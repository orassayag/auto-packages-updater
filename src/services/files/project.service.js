const { ProjectDataModel, ProjectsDataModel } = require('../../core/models');
const { ProjectStatusEnum, UpdateTypeEnum } = require('../../core/enums');
const countLimitService = require('./countLimit.service');
const fileService = require('./file.service');
const logService = require('./log.service');
const packageService = require('./package.service');
const pathService = require('./path.service');
const { fileUtils, textUtils, timeUtils, validationUtils } = require('../../utils');

class ProjectService {

    constructor() {
        this.projectsDataModel = null;
    }

    initiate() {
        this.projectsDataModel = new ProjectsDataModel();
    }

    async findOutdatedPackages() {
        // Get the projects data from the projects.json file.
        const fileDataResultModel = await fileService.getFileData({
            filePath: pathService.pathDataModel.projectsPath,
            parameterName: 'projectsPath',
            fileExtension: '.json',
            isPackageJSONFile: false
        });
        if (!fileDataResultModel) {
            throw new Error('Invalid or no fileDataResultModel object was found (1000017)');
        }
        const { resultData, errorMessage } = fileDataResultModel;
        if (errorMessage) {
            throw new Error(errorMessage);
        }
        if (!validationUtils.isValidArray(resultData)) {
            throw new Error('Invalid or no resultData array was found (1000018)');
        }
        // Validate and create all the projects.
        await this.createProjects(resultData);
        // Validate the projects.
        this.validateProjects();
        // Check for updates in all the projects.
        await this.getProjectsOutdatedPackages();
        // Auto-update projects.
        await this.updateProjectsOutdatedPackages();
        // Handle all the project's results.
        await this.handleResult();
    }

    // This method creates the projects.
    async createProjects(resultData) {
        let lastProjectId = 1;
        for (let i = 0; i < resultData.length; i++) {
            const projectDataModel = await this.validateCreateProject(resultData[i], lastProjectId);
            if (!projectDataModel) {
                throw new Error('Invalid or no projectDataModel object was found (1000019)');
            }
            lastProjectId++;
            this.projectsDataModel.projectsList.push(projectDataModel);
        }
    }

    // This method validates the projects.
    validateProjects() {
        if (this.projectsDataModel.projectsList.length <= 1) {
            return;
        }
        // Clean duplicate projects (by the same package.json paths).
        for (let i = 0; i < this.projectsDataModel.projectsList.length; i++) {
            this.compareProjects(this.projectsDataModel.projectsList[i]);
        }
        // Validate that the maximum number of projects don't exceed the limit.
        if (this.projectsDataModel.projectsList.length > countLimitService.countLimitDataModel.maximumProjectsCount) {
            this.projectsDataModel.projectsList = this.projectsDataModel.projectsList.slice(0, countLimitService.countLimitDataModel.maximumProjectsCount);
        }
    }

    // This method checks if duplicate projects exist, based on the same package.json paths.
    compareProjects(projectDataModel) {
        if (projectDataModel.status !== ProjectStatusEnum.CREATE) {
            return;
        }
        for (let i = 0; i < this.projectsDataModel.projectsList.length; i++) {
            const currentProjectDataModel = this.projectsDataModel.projectsList[i];
            if (projectDataModel.id === currentProjectDataModel.id || currentProjectDataModel.status !== ProjectStatusEnum.CREATE) {
                continue;
            }
            if (projectDataModel.packagesPath === currentProjectDataModel.packagesPath) {
                this.projectsDataModel.projectsList[i] = this.updateProjectStatus({
                    projectDataModel: currentProjectDataModel,
                    status: ProjectStatusEnum.DUPLICATE,
                    resultMessage: `The project's package.json already exists in the list of projects: ${projectDataModel.updateType} (1000020)`
                });
            }
        }
    }

    async validateCreateProject(data, lastProjectId) {
        // Create a new project data.
        let projectDataModel = new ProjectDataModel({
            id: lastProjectId,
            createDateTime: timeUtils.getCurrentDate(),
            status: ProjectStatusEnum.CREATE
        });
        // Validate the 'name' field.
        projectDataModel = this.validateName(projectDataModel, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'update-type' field.
        projectDataModel = this.validateUpdateType(projectDataModel, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'include-dev-dependencies' field.
        projectDataModel = await this.validateIncludeDevDependencies(projectDataModel, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'packages-path' field.
        projectDataModel = await this.validatePackagesPath(projectDataModel, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'custom-packages-path' field.
        projectDataModel = await this.validateCustomPackagesPath(projectDataModel, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'exclude-packages-list' field.
        projectDataModel = await this.validateExcludePackagesList(projectDataModel, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the entire project data.
        projectDataModel = this.validateProject(projectDataModel);
        // Finalize the project data.
        projectDataModel = this.finalizeProject(projectDataModel);
        return projectDataModel;
    }

    // This method validates the 'name' field.
    validateName(projectDataModel, data) {
        return this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'name',
            projectFieldName: 'name',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_NAME,
            invalidStatus: ProjectStatusEnum.INVALID_NAME,
            emptyStatus: ProjectStatusEnum.EMPTY_NAME
        }, data);
    }

    // This method validates the 'update-type' field.
    validateUpdateType(projectDataModel, data) {
        projectDataModel = this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'update-type',
            projectFieldName: 'updateType',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_UPDATE_TYPE,
            invalidStatus: ProjectStatusEnum.INVALID_UPDATE_TYPE,
            emptyStatus: ProjectStatusEnum.EMPTY_UPDATE_TYPE
        }, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        if (!validationUtils.isValidEnum({
            enum: UpdateTypeEnum,
            value: projectDataModel.updateType
        })) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: ProjectStatusEnum.MISMATCH_UPDATE_TYPE,
                resultMessage: `Mismatch UpdateTypeEnum parameter was found: ${projectDataModel.updateType} (1000021)`
            });
        }
        return projectDataModel;
    }

    // This method validates the 'project-path' field.
    async validatePackagesPath(projectDataModel, data) {
        projectDataModel = this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'project-path',
            projectFieldName: 'projectPath',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_PROJECT_PATH,
            invalidStatus: ProjectStatusEnum.INVALID_PROJECT_PATH,
            emptyStatus: ProjectStatusEnum.EMPTY_PROJECT_PATH
        }, data);
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        const fileDataResultModel = await fileService.getFileData({
            filePath: `${projectDataModel.projectPath}\\package.json`,
            parameterName: 'projectPath',
            fileExtension: '.json',
            isPackageJSONFile: true
        });
        if (!fileDataResultModel) {
            throw new Error('Invalid or no fileDataResultModel object was found (1000022)');
        }
        const { resultData, errorMessage } = fileDataResultModel;
        if (errorMessage) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: ProjectStatusEnum.FILE_ERROR_PROJECT_PATH,
                resultMessage: errorMessage
            });
        }
        // Check that 'dependencies' field exists - Throw an exception if not.
        if (!resultData.dependencies) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: ProjectStatusEnum.INVALID_STRUCTURE_PROJECT_PATH,
                resultMessage: `Invalid package.json file structure: missing 'dependencies' property (1000023)`
            });
        }
        // Check that at least one package exists - Throw an exception if not.
        const dependenciesKeys = Object.keys(resultData.dependencies);
        if (!validationUtils.isExists(dependenciesKeys)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: ProjectStatusEnum.NO_PACKAGES_IN_PROJECT_PATH,
                resultMessage: `No packages exists in the package.json file (1000024)`
            });
        }
        projectDataModel.dependencies = resultData.dependencies;
        // Check that 'devDependencies' is required.
        if (projectDataModel.isIncludeDevDependencies && resultData.devDependencies) {
            const devDependenciesKeys = Object.keys(resultData.devDependencies);
            if (validationUtils.isExists(devDependenciesKeys)) {
                projectDataModel.devDependencies = resultData.devDependencies;
            }
        }
        return projectDataModel;
    }

    // This method validates the 'custom-packages-path' field.
    async validateCustomPackagesPath(projectDataModel, data) {
        // If the update type is full, ignore the custom logic.
        if (projectDataModel.updateType === UpdateTypeEnum.FULL) {
            return projectDataModel;
        }
        projectDataModel = this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'custom-packages-path',
            projectFieldName: 'customPackagesPath',
            isRequired: false,
            missingStatus: ProjectStatusEnum.MISSING_CUSTOM_PACKAGES_PATH,
            invalidStatus: ProjectStatusEnum.INVALID_CUSTOM_PACKAGES_PATH,
            emptyStatus: null
        }, data);
        if (!projectDataModel.customPackagesPath || projectDataModel.resultMessage) {
            return projectDataModel;
        }
        const fileDataResultModel = await fileService.getFileData({
            filePath: projectDataModel.customPackagesPath,
            parameterName: 'customPackagesPath',
            fileExtension: '.txt',
            isPackageJSONFile: false
        });
        if (!fileDataResultModel) {
            throw new Error('Invalid or no fileDataResultModel object was found (1000025)');
        }
        const { resultData, errorMessage } = fileDataResultModel;
        if (errorMessage) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: ProjectStatusEnum.FILE_ERROR_CUSTOM_PACKAGES_PATH,
                resultMessage: errorMessage
            });
        }
        projectDataModel.customPackagesList = resultData.split('\r\n').map(p => textUtils.toLowerCaseTrim(p));
        return projectDataModel;
    }

    // This method validates the 'exclude-packages-list' field.
    validateExcludePackagesList(projectDataModel, data) {
        projectDataModel = this.validateJSONArray({
            projectDataModel: projectDataModel,
            jsonFieldName: 'exclude-packages-list',
            projectFieldName: 'excludePackagesList',
            isRequired: false,
            missingStatus: ProjectStatusEnum.MISSING_EXCLUDE_PACKAGES_LIST,
            invalidStatus: ProjectStatusEnum.INVALID_EXCLUDE_PACKAGES_LIST,
            emptyStatus: ProjectStatusEnum.EMPTY_EXCLUDE_PACKAGES_LIST
        }, data);
        if (validationUtils.isExists(projectDataModel.excludePackagesList)) {
            projectDataModel.excludePackagesList = projectDataModel.excludePackagesList.map(p => textUtils.toLowerCaseTrim(p));
        }
        return projectDataModel;
    }

    // This method validates the 'include-dev-dependencies' field.
    validateIncludeDevDependencies(projectDataModel, data) {
        return this.validateJSONBoolean({
            projectDataModel: projectDataModel,
            jsonFieldName: 'include-dev-dependencies',
            projectFieldName: 'isIncludeDevDependencies',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_INCLUDE_DEV_DEPENDENCIES,
            invalidStatus: ProjectStatusEnum.INVALID_INCLUDE_DEV_DEPENDENCIES
        }, data);
    }

    // This method validates the 'is-packages-update' field.
    validateIsPackagesUpdate(projectDataModel, data) {
        return this.validateJSONBoolean({
            projectDataModel: projectDataModel,
            jsonFieldName: 'is-packages-update',
            projectFieldName: 'isPackagesUpdate',
            isRequired: true,
            missingStatus: ProjectStatusEnum.IS_PACKAGES_UPDATE,
            invalidStatus: ProjectStatusEnum.IS_PACKAGES_UPDATE
        }, data);
    }

    // This method validates the 'is-git-update' field.
    validateIsGitUpdate(projectDataModel, data) {
        return this.validateJSONBoolean({
            projectDataModel: projectDataModel,
            jsonFieldName: 'is-git-update',
            projectFieldName: 'isGitUpdate',
            isRequired: true,
            missingStatus: ProjectStatusEnum.IS_GIT_UPDATE,
            invalidStatus: ProjectStatusEnum.IS_GIT_UPDATE
        }, data);
    }

    // This method validates a string field from the project.json file.
    validateJSONString(data, jsonData) {
        const { projectDataModel, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired || fieldValue) {
            if (!validationUtils.isValidString(fieldValue)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: invalidStatus,
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000026)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000027)`
                });
            }
        }
        projectDataModel[projectFieldName] = fieldValue ? fieldValue.trim() : fieldValue;
        return projectDataModel;
    }

    // This method validates a boolean field from the project.json file.
    validateJSONBoolean(data, jsonData) {
        const { projectDataModel, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired && !validationUtils.isValidBoolean(fieldValue)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: invalidStatus,
                resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a boolean but received: ${fieldValue} (1000028)`
            });
        }
        projectDataModel[projectFieldName] = fieldValue;
        return projectDataModel;
    }

    // This method validates an array field from the project.json file.
    validateJSONArray(data, jsonData) {
        const { projectDataModel, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired || fieldValue) {
            if (!validationUtils.isValidArray(fieldValue)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: invalidStatus,
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000029)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000030)`
                });
            }
        }
        projectDataModel[projectFieldName] = fieldValue;
        return projectDataModel;
    }

    scanFields(data) {
        const { projectDataModel, keysList } = data;
        let scanFieldsResult = null;
        for (let i = 0; i < keysList.length; i++) {
            const key = keysList[i];
            const value = projectDataModel[key];
            if (validationUtils.isEmpty(value)) {
                scanFieldsResult = {
                    status: ProjectStatusEnum.MISSING_FIELD,
                    resultMessage: `Field ${key} should not be empty, but does not contain any value.`
                };
                break;
            }
        }
        return scanFieldsResult;
    }

    // This method validates that if the update type is custom, at least one package from custom
    // matches the dependencies or to devDependencies objects (if required).
    findMatchCustomPackages(projectDataModel) {
        let isMatchPackage = false;
        const { customPackagesList, dependencies, devDependencies, isIncludeDevDependencies } = projectDataModel;
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
    validateProject(projectDataModel) {
        // Validate all expected fields.
        const scanFieldsResult = this.scanFields({
            projectDataModel: projectDataModel,
            keysList: ['id', 'createDateTime', 'name', 'updateType', 'packagesPath', 'isIncludeDevDependencies', 'dependencies', 'status', 'retriesCount']
        });
        if (scanFieldsResult) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: scanFieldsResult.status,
                resultMessage: scanFieldsResult.resultMessage
            });
        }
        // Validate that if the update type is custom, make sure there are custom packages.
        if (projectDataModel.updateType === UpdateTypeEnum.CUSTOM) {
            if (!validationUtils.isExists(projectDataModel.customPackagesList)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: ProjectStatusEnum.NO_CUSTOM_PACKAGES,
                    resultMessage: 'The project update type marked as custom but no custom packages were found (1000031)'
                });
            }
            // Validate that if the update type is custom, at least one package from custom
            // matches the dependencies or to devDependencies objects (if required).
            if (!this.findMatchCustomPackages(projectDataModel)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: ProjectStatusEnum.NO_MATCH_CUSTOM_PACKAGES,
                    resultMessage: 'No match custom package in the dependencies or devDependencies objects were found (1000032)'
                });
            }
        }
        return projectDataModel;
    }

    finalizeProject(projectDataModel) {
        // Clear all duplicate packages, regardless of the versions.
        projectDataModel.customPackagesList = textUtils.removeDuplicates(projectDataModel.customPackagesList);
        projectDataModel.excludePackagesList = textUtils.removeDuplicates(projectDataModel.excludePackagesList);
        // If the project data contains no error -
        // Create the final version of the package.json structure data to check for outdated packages.
        projectDataModel = this.createPackagesTemplate(projectDataModel);
        return projectDataModel;
    }

    createPackagesTemplate(projectDataModel) {
        const { updateType, customPackagesList, excludePackagesList, isIncludeDevDependencies, dependencies, devDependencies } = projectDataModel;
        let packagesTemplate = { ...dependencies };
        if (isIncludeDevDependencies && devDependencies) {
            packagesTemplate = { ...packagesTemplate, ...devDependencies };
        }
        // If the update type is custom - Remove all the packages that are not listed in the customPackagesList.
        if (updateType === UpdateTypeEnum.CUSTOM) {
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
        projectDataModel.packagesTemplateKeys = Object.keys(packagesTemplate);
        if (!validationUtils.isExists(projectDataModel.packagesTemplateKeys)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: ProjectStatusEnum.NO_TEMPLATE_PACKAGES,
                resultMessage: 'There are no packages to validate. Consider rechecking the custom/exclude lists (1000033)'
            });
        }
        projectDataModel.packagesTemplate = packagesTemplate;
        return projectDataModel;
    }

    // This method sends the packagesTemplate to get the outdated packages.
    async getProjectOutdatedPackages(data) {
        let { projectDataModel } = data;
        if (projectDataModel.status !== ProjectStatusEnum.CREATE) {
            return projectDataModel;
        }
        const { outdatedPackages, errorMessage } = await packageService.getOutdatedPackages({
            name: projectDataModel.name,
            packagesTemplate: projectDataModel.packagesTemplate,
            projectsCount: this.projectsDataModel.projectsList.length,
            index: data.index
        });
        let status, resultMessage = null;
        if (errorMessage) {
            status = ProjectStatusEnum.FAIL;
            resultMessage = errorMessage;
        }
        else {
            status = ProjectStatusEnum.SUCCESS;
            projectDataModel.outdatedPackagesKeys = Object.keys(outdatedPackages);
            resultMessage = validationUtils.isExists(projectDataModel.outdatedPackagesKeys) ?
                'Success to handle the outdated packages.' : 'All packages up to date.';
        }
        projectDataModel = this.updateProjectStatus({
            projectDataModel: projectDataModel,
            status: status,
            resultMessage: resultMessage
        });
        projectDataModel.outdatedPackages = outdatedPackages;
        return projectDataModel;
    }

    // This method loops all the projects and gets the outdated packages for each project.
    async getProjectsOutdatedPackages() {
        for (let i = 0; i < this.projectsDataModel.projectsList.length; i++) {
            this.projectsDataModel.projectsList[i] = await this.getProjectOutdatedPackages({
                projectDataModel: this.projectsDataModel.projectsList[i],
                index: i
            });
        }
    }

    initiateUpdateProjectStep() {
        fileUtils.createDirectory(pathService.temporaryDirectoryPath);
    }

    getProjectsUpdateAvailableCount() {
        return this.projectsDataModel.projectsList.filter(p => p.isPackagesUpdate).length;
    }

    // This method updates the outdated packages of the project.
    async updateProjectOutdatedPackages(data) {
        const { projectDataModel, index } = data;
        const { id, createDateTime, name, updateType, projectPath, customPackagesPath, customPackagesList,
            excludePackagesList, isIncludeDevDependencies, isPackagesUpdate, isGitUpdate, dependencies,
            devDependencies, packagesTemplate, packagesTemplateKeys, outdatedPackages,
            outdatedPackagesKeys, status, resultDateTime, resultMessage, retriesCount } = projectDataModel;
        // Validate that the project is package update flaged.
        // Log the progress.
        logService.logProgress({
            name: packagesTemplate,
            currentNumber: index + 1,
            totalNumber: this.getProjectsUpdateAvailableCount()
        });
        if (!await fileUtils.isPathExists(projectDataModel.projectPath))
        {

        }
        // 02. Download the repository from GitHub to the temporary directory.
        // 03. If the package-lock.json exists, delete it.
        // 04. Update the package.json file with the updated packages versions.
        // 05. Run 'npm i', wait for the results.
        // 06. If successful, check if 'is-git-update' === true. If so, run 'git add .', run 'git commit -m 'update packages'',
        // and run 'git push' and wait for a successful message.
        // 07. Remove the last empty line (mark it as flag in settings.js) in the package.json and package-lock.json files.
        // 08. If failed, add 1 to the retries, and go to the retry process: Delete the 'node_modules' directory and run 'npm i' again.
        // 09. If retries exceeded the limit, mark an error to the project and continue to the next project.
        // 10. After the NPM update packages, will verify the update by checking the package.json file again.
        // 11. After verification complete, delete the package.json and package-lock.json files from the original project.
        // 12. After deletion completes, copy the updated package.json and package-lock.json files to the original project's path.
    }

    // This method loops all the projects and auto updates the outdated packages.
    async updateProjectsOutdatedPackages() {
        // Check if any projects need to be updated.
        if (!this.getProjectsUpdateAvailableCount()) {
            return;
        }
        // Initiate the update step.
        this.initiateUpdateProjectStep();
        // Loop on all the potential update projects.
        for (let i = 0; i < this.projectsDataModel.projectsList.length; i++) {
            this.projectsDataModel.projectsList[i] = await this.updateProjectOutdatedPackages({
                projectDataModel: this.projectsDataModel.projectsList[i],
                index: i
            });
        }
    }

    // This method handles the outdated and updated packages result check.
    async handleResult() {
        // Log the result.
        // ToDo: Add to the final log which packages were updated.
        await logService.logProjects(this.projectsDataModel);
    }

    updateProjectStatus(data) {
        const { projectDataModel, status, resultMessage } = data;
        if (!status || !validationUtils.isValidEnum({
            enum: ProjectStatusEnum,
            value: status
        })) {
            throw new Error(`Invalid or no ProjectStatusEnum parameter was found: ${status} (1000034)`);
        }
        projectDataModel.status = status;
        projectDataModel.resultMessage = resultMessage;
        projectDataModel.resultDateTime = timeUtils.getCurrentDate();
        return projectDataModel;
    }
}

module.exports = new ProjectService();