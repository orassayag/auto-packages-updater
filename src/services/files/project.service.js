const { ProjectData, ProjectsData } = require('../../core/models');
const { ProjectStatus, UpdateType } = require('../../core/enums');
const countLimitService = require('./countLimit.service');
const fileService = require('./file.service');
const logService = require('./log.service');
const packageService = require('./package.service');
const pathService = require('./path.service');
const { textUtils, timeUtils, validationUtils } = require('../../utils');

class ProjectService {

    constructor() {
        this.projectsData = null;
    }

    initiate() {
        this.projectsData = new ProjectsData();
    }

    async findOutdatedPackages() {
        // Get the projects data from the projects.json file.
        const fileDataResult = await fileService.getFileData({
            filePath: pathService.pathData.projectsPath,
            parameterName: 'projectsPath',
            fileExtension: '.json',
            isPackageJSONFile: false
        });
        if (!fileDataResult) {
            throw new Error('Invalid or no fileDataResult object was found (1000016)');
        }
        const { resultData, errorMessage } = fileDataResult;
        if (errorMessage) {
            throw new Error(errorMessage);
        }
        if (!validationUtils.isValidArray(resultData)) {
            throw new Error('Invalid or no resultData array was found (1000017)');
        }
        // Validate and create all the projects.
        await this.createProjects(resultData);
        // Validate the projects.
        this.validateProjects();
        // Check for updates in all the projects.
        await this.getProjectsOutdatedPackages();
        // Handle all the project's results.
        await this.handleResult();
    }

    // This method creates the projects.
    async createProjects(resultData) {
        let lastProjectId = 1;
        for (let i = 0; i < resultData.length; i++) {
            const projectData = await this.validateCreateProject(resultData[i], lastProjectId);
            if (!projectData) {
                throw new Error('Invalid or no projectData object was found (1000018)');
            }
            lastProjectId++;
            this.projectsData.projectsList.push(projectData);
        }
    }

    // This method validates the projects.
    validateProjects() {
        if (this.projectsData.projectsList.length <= 1) {
            return;
        }
        // Clean duplicate projects (by the same package.json paths).
        for (let i = 0; i < this.projectsData.projectsList.length; i++) {
            this.compareProjects(this.projectsData.projectsList[i]);
        }
        // Validate that the maximum number of projects don't exceed the limit.
        if (this.projectsData.projectsList.length > countLimitService.countLimitData.maximumProjectsCount) {
            this.projectsData.projectsList = this.projectsData.projectsList.slice(0, countLimitService.countLimitData.maximumProjectsCount);
        }
    }

    // This method checks if duplicate projects exist, based on the same package.json paths.
    compareProjects(projectData) {
        if (projectData.status !== ProjectStatus.CREATE) {
            return;
        }
        for (let i = 0; i < this.projectsData.projectsList.length; i++) {
            const currentProjectData = this.projectsData.projectsList[i];
            if (projectData.id === currentProjectData.id || currentProjectData.status !== ProjectStatus.CREATE) {
                continue;
            }
            if (projectData.packagesPath === currentProjectData.packagesPath) {
                this.projectsData.projectsList[i] = this.updateProjectStatus({
                    projectData: currentProjectData,
                    status: ProjectStatus.DUPLICATE,
                    resultMessage: `The project's package.json already exists in the list of projects: ${projectData.updateType} (1000019)`
                });
            }
        }
    }

    async validateCreateProject(data, lastProjectId) {
        // Create a new project data.
        let projectData = new ProjectData({
            id: lastProjectId,
            createDateTime: timeUtils.getCurrentDate(),
            status: ProjectStatus.CREATE
        });
        // Validate the 'name' field.
        projectData = this.validateName(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // Validate the 'update-type' field.
        projectData = this.validateUpdateType(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // Validate the 'include-dev-dependencies' field.
        projectData = await this.validateIncludeDevDependencies(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // Validate the 'packages-path' field.
        projectData = await this.validatePackagesPath(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // Validate the 'custom-packages-path' field.
        projectData = await this.validateCustomPackagesPath(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // Validate the 'exclude-packages-list' field.
        projectData = await this.validateExcludePackagesList(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // Validate the entire project data.
        projectData = this.validateProject(projectData);
        // Finalize the project data.
        projectData = this.finalizeProject(projectData);
        return projectData;
    }

    // This method validates the 'name' field.
    validateName(projectData, data) {
        return this.validateJSONString({
            projectData: projectData,
            jsonFieldName: 'name',
            projectFieldName: 'name',
            isRequired: true,
            missingStatus: ProjectStatus.MISSING_NAME,
            invalidStatus: ProjectStatus.INVALID_NAME,
            emptyStatus: ProjectStatus.EMPTY_NAME
        }, data);
    }

    // This method validates the 'update-type' field.
    validateUpdateType(projectData, data) {
        projectData = this.validateJSONString({
            projectData: projectData,
            jsonFieldName: 'update-type',
            projectFieldName: 'updateType',
            isRequired: true,
            missingStatus: ProjectStatus.MISSING_UPDATE_TYPE,
            invalidStatus: ProjectStatus.INVALID_UPDATE_TYPE,
            emptyStatus: ProjectStatus.EMPTY_UPDATE_TYPE
        }, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        if (!validationUtils.isValidEnum({
            enum: UpdateType,
            value: projectData.updateType
        })) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.MISMATCH_UPDATE_TYPE,
                resultMessage: `Mismatch UpdateType parameter was found: ${projectData.updateType} (1000020)`
            });
        }
        return projectData;
    }

    // This method validates the 'packages-path' field.
    async validatePackagesPath(projectData, data) {
        projectData = this.validateJSONString({
            projectData: projectData,
            jsonFieldName: 'packages-path',
            projectFieldName: 'packagesPath',
            isRequired: true,
            missingStatus: ProjectStatus.MISSING_PACKAGES_PATH,
            invalidStatus: ProjectStatus.INVALID_PACKAGES_PATH,
            emptyStatus: ProjectStatus.EMPTY_PACKAGES_PATH
        }, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        const fileDataResult = await fileService.getFileData({
            filePath: projectData.packagesPath,
            parameterName: 'packagesPath',
            fileExtension: '.json',
            isPackageJSONFile: true
        });
        if (!fileDataResult) {
            throw new Error('Invalid or no fileDataResult object was found (1000021)');
        }
        const { resultData, errorMessage } = fileDataResult;
        if (errorMessage) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.FILE_ERROR_PACKAGES_PATH,
                resultMessage: errorMessage
            });
        }
        // Check that 'dependencies' field exists - Throw an exception if not.
        if (!resultData.dependencies) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.INVALID_STRUCTURE_PACKAGES_PATH,
                resultMessage: `Invalid package.json file structure: missing 'dependencies' property (1000022)`
            });
        }
        // Check that at least one package exists - Throw an exception if not.
        const dependenciesKeys = Object.keys(resultData.dependencies);
        if (!validationUtils.isExists(dependenciesKeys)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.NO_PACKAGES_IN_PACKAGES_PATH,
                resultMessage: `No packages exists in the package.json file (1000023)`
            });
        }
        projectData.dependencies = resultData.dependencies;
        // Check that 'devDependencies' is required.
        if (projectData.isIncludeDevDependencies && resultData.devDependencies) {
            const devDependenciesKeys = Object.keys(resultData.devDependencies);
            if (validationUtils.isExists(devDependenciesKeys)) {
                projectData.devDependencies = resultData.devDependencies;
            }
        }
        return projectData;
    }

    // This method validates the 'custom-packages-path' field.
    async validateCustomPackagesPath(projectData, data) {
        // If the update type is full, ignore the custom logic.
        if (projectData.updateType === UpdateType.FULL) {
            return projectData;
        }
        projectData = this.validateJSONString({
            projectData: projectData,
            jsonFieldName: 'custom-packages-path',
            projectFieldName: 'customPackagesPath',
            isRequired: false,
            missingStatus: ProjectStatus.MISSING_CUSTOM_PACKAGES_PATH,
            invalidStatus: ProjectStatus.INVALID_CUSTOM_PACKAGES_PATH,
            emptyStatus: null
        }, data);
        if (!projectData.customPackagesPath || projectData.resultMessage) {
            return projectData;
        }
        const fileDataResult = await fileService.getFileData({
            filePath: projectData.customPackagesPath,
            parameterName: 'customPackagesPath',
            fileExtension: '.txt',
            isPackageJSONFile: false
        });
        if (!fileDataResult) {
            throw new Error('Invalid or no fileDataResult object was found (1000024)');
        }
        const { resultData, errorMessage } = fileDataResult;
        if (errorMessage) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.FILE_ERROR_CUSTOM_PACKAGES_PATH,
                resultMessage: errorMessage
            });
        }
        projectData.customPackagesList = resultData.split('\r\n').map(p => textUtils.toLowerCaseTrim(p));
        return projectData;
    }

    // This method validates the 'exclude-packages-list' field.
    validateExcludePackagesList(projectData, data) {
        projectData = this.validateJSONArray({
            projectData: projectData,
            jsonFieldName: 'exclude-packages-list',
            projectFieldName: 'excludePackagesList',
            isRequired: false,
            missingStatus: ProjectStatus.MISSING_EXCLUDE_PACKAGES_LIST,
            invalidStatus: ProjectStatus.INVALID_EXCLUDE_PACKAGES_LIST,
            emptyStatus: ProjectStatus.EMPTY_EXCLUDE_PACKAGES_LIST
        }, data);
        if (validationUtils.isExists(projectData.excludePackagesList)) {
            projectData.excludePackagesList = projectData.excludePackagesList.map(p => textUtils.toLowerCaseTrim(p));
        }
        return projectData;
    }

    // This method validates the 'include-dev-dependencies' field.
    validateIncludeDevDependencies(projectData, data) {
        return this.validateJSONBoolean({
            projectData: projectData,
            jsonFieldName: 'include-dev-dependencies',
            projectFieldName: 'isIncludeDevDependencies',
            isRequired: true,
            missingStatus: ProjectStatus.MISSING_INCLUDE_DEV_DEPENDENCIES,
            invalidStatus: ProjectStatus.INVALID_INCLUDE_DEV_DEPENDENCIES
        }, data);
    }

    // This method validates a string field from the project.json file.
    validateJSONString(data, jsonData) {
        const { projectData, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired || fieldValue) {
            if (!validationUtils.isValidString(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: invalidStatus,
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000025)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000026)`
                });
            }
        }
        projectData[projectFieldName] = fieldValue ? fieldValue.trim() : fieldValue;
        return projectData;
    }

    // This method validates a boolean field from the project.json file.
    validateJSONBoolean(data, jsonData) {
        const { projectData, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired && !validationUtils.isValidBoolean(fieldValue)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: invalidStatus,
                resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a boolean but received: ${fieldValue} (1000027)`
            });
        }
        projectData[projectFieldName] = fieldValue;
        return projectData;
    }

    // This method validates an array field from the project.json file.
    validateJSONArray(data, jsonData) {
        const { projectData, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired || fieldValue) {
            if (!validationUtils.isValidArray(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: invalidStatus,
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000028)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000029)`
                });
            }
        }
        projectData[projectFieldName] = fieldValue;
        return projectData;
    }

    scanFields(data) {
        const { projectData, keysList } = data;
        let scanFieldsResult = null;
        for (let i = 0; i < keysList.length; i++) {
            const key = keysList[i];
            const value = projectData[key];
            if (!value && value !== 0) {
                scanFieldsResult = {
                    status: ProjectStatus.MISSING_FIELD,
                    resultMessage: `Field ${key} should not be empty, but does not contain any value.`
                };
                break;
            }
        }
        return scanFieldsResult;
    }

    // This method validates that if the update type is custom, at least one package from custom
    // matches the dependencies or to devDependencies objects (if required).
    findMatchCustomPackages(projectData) {
        let isMatchPackage = false;
        const { customPackagesList, dependencies, devDependencies, isIncludeDevDependencies } = projectData;
        for (let i = 0; i < customPackagesList.length; i++) {
            const customPackageName = customPackagesList[i];
            if (validationUtils.isPropertyExists(dependencies, customPackageName)) {
                isMatchPackage = true;
                break;
            }
            if (isIncludeDevDependencies && devDependencies) {
                if (validationUtils.isPropertyExists(devDependencies, customPackageName)) {
                    isMatchPackage = true;
                    break;
                }
            }
        }
        return isMatchPackage;
    }

    // This method validates the entire project data.
    validateProject(projectData) {
        // Validate all expected fields.
        const scanFieldsResult = this.scanFields({
            projectData: projectData,
            keysList: ['id', 'createDateTime', 'name', 'updateType', 'packagesPath', 'isIncludeDevDependencies', 'dependencies', 'status', 'retriesCount']
        });
        if (scanFieldsResult) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: scanFieldsResult.status,
                resultMessage: scanFieldsResult.resultMessage
            });
        }
        // Validate that if the update type is custom, make sure there are custom packages.
        if (projectData.updateType === UpdateType.CUSTOM) {
            if (!validationUtils.isExists(projectData.customPackagesList)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: ProjectStatus.NO_CUSTOM_PACKAGES,
                    resultMessage: 'The project update type marked as custom but no custom packages were found (1000030)'
                });
            }
            // Validate that if the update type is custom, at least one package from custom
            // matches the dependencies or to devDependencies objects (if required).
            if (!this.findMatchCustomPackages(projectData)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: ProjectStatus.NO_MATCH_CUSTOM_PACKAGES,
                    resultMessage: 'No match custom package in the dependencies or devDependencies objects were found (1000031)'
                });
            }
        }
        return projectData;
    }

    finalizeProject(projectData) {
        // Clear all duplicate packages, regardless of the versions.
        projectData.customPackagesList = textUtils.removeDuplicates(projectData.customPackagesList);
        projectData.excludePackagesList = textUtils.removeDuplicates(projectData.excludePackagesList);
        // If the project data contains no error -
        // Create the final version of the package.json structure data to check for outdated packages.
        projectData = this.createPackagesTemplate(projectData);
        return projectData;
    }

    createPackagesTemplate(projectData) {
        const { updateType, customPackagesList, excludePackagesList, isIncludeDevDependencies, dependencies, devDependencies } = projectData;
        let packagesTemplate = { ...dependencies };
        if (isIncludeDevDependencies && devDependencies) {
            packagesTemplate = { ...packagesTemplate, ...devDependencies };
        }
        // If the update type is custom - Remove all the packages that are not listed in the customPackagesList.
        if (updateType === UpdateType.CUSTOM) {
            const customPackagesTemplate = {};
            for (let i = 0; i < customPackagesList.length; i++) {
                const packageName = customPackagesList[i];
                const packageVersion = packagesTemplate[packageName];
                if (packageVersion) {
                    customPackagesTemplate[packageName] = packageVersion;
                }
            }
            packagesTemplate = customPackagesTemplate;
        }
        // Remove the excluded packages from the list, if exists.
        if (validationUtils.isExists(excludePackagesList)) {
            for (let i = 0; i < excludePackagesList.length; i++) {
                delete packagesTemplate[excludePackagesList[i]];
            }
        }
        // Validate that there are any packages in the template. If not, update the status.
        projectData.packagesTemplateKeys = Object.keys(packagesTemplate);
        if (!validationUtils.isExists(projectData.packagesTemplateKeys)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.NO_TEMPLATE_PACKAGES,
                resultMessage: 'There are no packages to validate. Consider rechecking the custom/exclude lists (1000032)'
            });
        }
        projectData.packagesTemplate = packagesTemplate;
        return projectData;
    }

    // This method sends the packagesTemplate to get the outdated packages.
    async getProjectOutdatedPackages(data) {
        let { projectData } = data;
        if (projectData.status !== ProjectStatus.CREATE) {
            return projectData;
        }
        const { outdatedPackages, errorMessage } = await packageService.getOutdatedPackages({
            name: projectData.name,
            packagesTemplate: projectData.packagesTemplate,
            projectsCount: this.projectsData.projectsList.length,
            index: data.index
        });
        let status, resultMessage = null;
        if (errorMessage) {
            status = ProjectStatus.FAIL;
            resultMessage = errorMessage;
        }
        else {
            status = ProjectStatus.SUCCESS;
            projectData.outdatedPackagesKeys = Object.keys(outdatedPackages);
            resultMessage = validationUtils.isExists(projectData.outdatedPackagesKeys) ?
                'Success to handle the outdated packages.' : 'All packages up to date.';
        }
        projectData = this.updateProjectStatus({
            projectData: projectData,
            status: status,
            resultMessage: resultMessage
        });
        projectData.outdatedPackages = outdatedPackages;
        return projectData;
    }

    // This method loops all the projects and gets the outdated packages for each project.
    async getProjectsOutdatedPackages() {
        for (let i = 0; i < this.projectsData.projectsList.length; i++) {
            this.projectsData.projectsList[i] = await this.getProjectOutdatedPackages({
                projectData: this.projectsData.projectsList[i],
                index: i
            });
        }
    }

    // This method handles the outdated packages result check.
    async handleResult() {
        // ToDo: On the second step here - Logic of update packages - Here - If outdated packages exist.
        // Log the result.
        await logService.logProjects(this.projectsData);
    }

    updateProjectStatus(data) {
        const { projectData, status, resultMessage } = data;
        if (!status || !validationUtils.isValidEnum({
            enum: ProjectStatus,
            value: status
        })) {
            throw new Error(`Invalid or no ProjectStatus parameter was found: ${status} (1000033)`);
        }
        projectData.status = status;
        projectData.resultMessage = resultMessage;
        projectData.resultDateTime = timeUtils.getCurrentDate();
        return projectData;
    }
}

module.exports = new ProjectService();