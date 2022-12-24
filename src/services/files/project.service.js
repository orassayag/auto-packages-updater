const { ProjectDataModel, ProjectsDataModel, UpdateProjectOutdatedPackagesResultModel } = require('../../core/models');
const { CommandEnum, ProjectStatusEnum, UpdateTypeEnum } = require('../../core/enums');
const applicationService = require('./application.service');
const commandService = require('./command.service');
const countLimitService = require('./countLimit.service');
const fileService = require('./file.service');
const gitService = require('./git.service');
const logService = require('./log.service');
const packageService = require('./package.service');
const pathService = require('./path.service');
const globalUtils = require('../../utils/files/global.utils');
const { logUtils, fileUtils, textUtils, timeUtils, validationUtils } = require('../../utils');

class ProjectService {

    constructor() {
        this.projectsDataModel = null;
    }

    initiate() {
        this.projectsDataModel = new ProjectsDataModel();
        this.updatedProjectsCount = null;
    }

    async findOutdatedPackages() {
        // Remove the temporary directory.
        await this.removeTemporaryDirecotry();
        // Get the project's data from the projects.json file.
        const fileDataResultModel = await fileService.getFileData({
            filePath: pathService.pathDataModel.projectsPath,
            parameterName: 'projectsPath',
            fileExtension: '.json',
            isPackageJSONFile: false
        });
        if (!fileDataResultModel) {
            throw new Error('Invalid or no fileDataResultModel object was found (1000019)');
        }
        const { resultData, errorMessage } = fileDataResultModel;
        if (errorMessage) {
            throw new Error(errorMessage);
        }
        if (!validationUtils.isValidArray(resultData)) {
            throw new Error('Invalid or no resultData array was found (1000020)');
        }
        // Validate and create all the projects.
        await this.createProjects(resultData);
        // Validate the projects.
        this.validateProjects();
        // Check for updates in all the projects.
        await this.getProjectsOutdatedPackages();
    }

    async removeTemporaryDirecotry() {
        // Remove the temporary directory.
        await fileUtils.removeDirectoryIfExists(pathService.pathDataModel.temporaryDirectoryPath);
    }

    async findUpdatePackages() {
        // Auto-update projects.
        await this.updateProjectsOutdatedPackages();
    }

    // This method creates the projects.
    async createProjects(resultData) {
        let lastProjectId = 1;
        for (let i = 0; i < resultData.length; i++) {
            const projectDataModel = await this.validateCreateProject({
                jsonData: resultData[i],
                lastProjectId: lastProjectId
            });
            if (!projectDataModel) {
                throw new Error('Invalid or no projectDataModel object was found (1000021)');
            }
            lastProjectId++;
            this.projectsDataModel.projectsList.push(projectDataModel);
        }
        // Re-order project by parent directory to be first in the list, in order to clone the parent project only once.
        this.projectsDataModel.projectsList = this.projectsDataModel.projectsList.reduce((acc, item) => {
            if (item.parentProjectPath) {
                return [item, ...acc];
            }
            return [...acc, item];
        }, []);
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
            if (projectDataModel.projectPath === currentProjectDataModel.projectPath) {
                this.projectsDataModel.projectsList[i] = this.updateProjectStatus({
                    projectDataModel: currentProjectDataModel,
                    status: ProjectStatusEnum.DUPLICATE,
                    resultMessage: `The project's package.json already exists in the list of projects: ${projectDataModel.updateType} (1000022)`
                });
            }
        }
    }

    async validateCreateProject(data) {
        const { jsonData, lastProjectId } = data;
        // Create a new project data.
        let projectDataModel = new ProjectDataModel({
            id: lastProjectId,
            createDateTime: timeUtils.getCurrentDate(),
            status: ProjectStatusEnum.CREATE
        });
        // Validate the 'name' field.
        projectDataModel = this.validateName({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'display-name' field.
        projectDataModel = this.validateDisplayName({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        projectDataModel.displayName = `${projectDataModel.name}${projectDataModel.displayName ? `: ${projectDataModel.displayName}` : ''}`;

        // Validate the 'update-type' field.
        projectDataModel = this.validateUpdateType({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'include-dev-dependencies' field.
        projectDataModel = await this.validateIncludeDevDependencies({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'project-path' field.
        projectDataModel = await this.validateProjectPath({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'parent-project-path' field.
        projectDataModel = await this.validateParentProjectPath({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'git-root-path' field.
        projectDataModel = this.validateGitRootPath({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'custom-packages-path' field.
        projectDataModel = await this.validateCustomPackagesPath({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'exclude-packages-list' field.
        projectDataModel = await this.validateExcludePackagesList({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'is-packages-update' field.
        projectDataModel = await this.validateIsPackagesUpdate({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
        if (projectDataModel.resultMessage) {
            return projectDataModel;
        }
        // Validate the 'is-git-update' field.
        projectDataModel = await this.validateIsGitUpdate({
            projectDataModel: projectDataModel,
            jsonData: jsonData
        });
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
    validateName(data) {
        const { projectDataModel, jsonData } = data;
        return this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'name',
            projectFieldName: 'name',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_NAME,
            invalidStatus: ProjectStatusEnum.INVALID_NAME,
            emptyStatus: ProjectStatusEnum.EMPTY_NAME
        }, jsonData);
    }

    // This method validates the 'display-name' field.
    validateDisplayName(data) {
        const { projectDataModel, jsonData } = data;
        return this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'display-name',
            projectFieldName: 'displayName',
            isRequired: false,
            missingStatus: ProjectStatusEnum.MISSING_DISPLAY_NAME,
            invalidStatus: ProjectStatusEnum.INVALID_DISPLAY_NAME,
            emptyStatus: ProjectStatusEnum.EMPTY_DISPLAY_NAME
        }, jsonData);
    }

    // This method validates the 'update-type' field.
    validateUpdateType(data) {
        const { jsonData } = data;
        let { projectDataModel } = data;
        projectDataModel = this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'update-type',
            projectFieldName: 'updateType',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_UPDATE_TYPE,
            invalidStatus: ProjectStatusEnum.INVALID_UPDATE_TYPE,
            emptyStatus: ProjectStatusEnum.EMPTY_UPDATE_TYPE
        }, jsonData);
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
                resultMessage: `Mismatch UpdateTypeEnum parameter was found: ${projectDataModel.updateType} (1000023)`
            });
        }
        return projectDataModel;
    }

    // This method validates the 'project-path' field.
    async validateProjectPath(data) {
        const { jsonData } = data;
        let { projectDataModel } = data;
        projectDataModel = this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'project-path',
            projectFieldName: 'projectPath',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_PROJECT_PATH,
            invalidStatus: ProjectStatusEnum.INVALID_PROJECT_PATH,
            emptyStatus: ProjectStatusEnum.EMPTY_PROJECT_PATH
        }, jsonData);
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
            throw new Error('Invalid or no fileDataResultModel object was found (1000024)');
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
                resultMessage: `Invalid package.json file structure: missing 'dependencies' property (1000025)`
            });
        }
        // Check that at least one package exists - Throw an exception if not.
        const dependenciesKeys = Object.keys(resultData.dependencies);
        if (!validationUtils.isExists(dependenciesKeys)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: ProjectStatusEnum.NO_PACKAGES_IN_PROJECT_PATH,
                resultMessage: `No packages exists in the package.json file (1000026)`
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

    // This method validates the 'parent-project-path' field.
    validateParentProjectPath(data) {
        const { projectDataModel, jsonData } = data;
        return this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'parent-project-path',
            projectFieldName: 'parentProjectPath',
            isRequired: false,
            missingStatus: null,
            invalidStatus: null,
            emptyStatus: null
        }, jsonData);
    }

    // This method validates the 'git-root-path' field.
    validateGitRootPath(data) {
        const { projectDataModel, jsonData } = data;
        return this.validateJSONString({
            projectDataModel: projectDataModel,
            jsonFieldName: 'git-root-path',
            projectFieldName: 'gitRootPath',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_GIT_ROOT_PATH,
            invalidStatus: ProjectStatusEnum.INVALID_GIT_ROOT_PATH,
            emptyStatus: ProjectStatusEnum.EMPTY_GIT_ROOT_PATH
        }, jsonData);
    }

    // This method validates the 'custom-packages-path' field.
    async validateCustomPackagesPath(data) {
        const { jsonData } = data;
        let { projectDataModel } = data;
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
        }, jsonData);
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
            throw new Error('Invalid or no fileDataResultModel object was found (1000027)');
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
    validateExcludePackagesList(data) {
        const { jsonData } = data;
        let { projectDataModel } = data;
        projectDataModel = this.validateJSONArray({
            projectDataModel: projectDataModel,
            jsonFieldName: 'exclude-packages-list',
            projectFieldName: 'excludePackagesList',
            isRequired: false,
            missingStatus: ProjectStatusEnum.MISSING_EXCLUDE_PACKAGES_LIST,
            invalidStatus: ProjectStatusEnum.INVALID_EXCLUDE_PACKAGES_LIST,
            emptyStatus: ProjectStatusEnum.EMPTY_EXCLUDE_PACKAGES_LIST
        }, jsonData);
        if (validationUtils.isExists(projectDataModel.excludePackagesList)) {
            projectDataModel.excludePackagesList = projectDataModel.excludePackagesList.map(p => textUtils.toLowerCaseTrim(p));
        }
        return projectDataModel;
    }

    // This method validates the 'include-dev-dependencies' field.
    validateIncludeDevDependencies(data) {
        const { projectDataModel, jsonData } = data;
        return this.validateJSONBoolean({
            projectDataModel: projectDataModel,
            jsonFieldName: 'include-dev-dependencies',
            projectFieldName: 'isIncludeDevDependencies',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_INCLUDE_DEV_DEPENDENCIES,
            invalidStatus: ProjectStatusEnum.INVALID_INCLUDE_DEV_DEPENDENCIES
        }, jsonData);
    }

    // This method validates the 'is-packages-update' field.
    validateIsPackagesUpdate(data) {
        const { projectDataModel, jsonData } = data;
        return this.validateJSONBoolean({
            projectDataModel: projectDataModel,
            jsonFieldName: 'is-packages-update',
            projectFieldName: 'isPackagesUpdate',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_IS_PACKAGES_UPDATE,
            invalidStatus: ProjectStatusEnum.INVALID_IS_PACKAGES_UPDATE
        }, jsonData);
    }

    // This method validates the 'is-git-update' field.
    validateIsGitUpdate(data) {
        const { projectDataModel, jsonData } = data;
        return this.validateJSONBoolean({
            projectDataModel: projectDataModel,
            jsonFieldName: 'is-git-update',
            projectFieldName: 'isGitUpdate',
            isRequired: true,
            missingStatus: ProjectStatusEnum.MISSING_IS_GIT_UPDATE,
            invalidStatus: ProjectStatusEnum.INVALID_IS_GIT_UPDATE
        }, jsonData);
    }

    // This method validates a string field from the project.json file.
    validateJSONString(data, jsonData) {
        const { projectDataModel, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (isRequired && !validationUtils.isPropertyExists({
            obj: jsonData,
            fieldName: jsonFieldName
        })) {
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
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000028)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000029)`
                });
            }
        }
        projectDataModel[projectFieldName] = fieldValue ? fieldValue.trim() : fieldValue;
        return projectDataModel;
    }

    // This method validates a boolean field from the project.json file.
    validateJSONBoolean(data, jsonData) {
        const { projectDataModel, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus } = data;
        if (!validationUtils.isPropertyExists({
            obj: jsonData,
            fieldName: jsonFieldName
        })) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exist in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired && !validationUtils.isValidBoolean(fieldValue)) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: invalidStatus,
                resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a boolean but received: ${fieldValue} (1000030)`
            });
        }
        projectDataModel[projectFieldName] = fieldValue;
        return projectDataModel;
    }

    // This method validates an array field from the project.json file.
    validateJSONArray(data, jsonData) {
        const { projectDataModel, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (!validationUtils.isPropertyExists({
            obj: jsonData,
            fieldName: jsonFieldName
        })) {
            return this.updateProjectStatus({
                projectDataModel: projectDataModel,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exist in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired || fieldValue) {
            if (!validationUtils.isValidArray(fieldValue)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: invalidStatus,
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000031)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000032)`
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
            if (validationUtils.isPropertyExists({
                obj: dependencies,
                fieldName: customPackageName
            })) {
                isMatchPackage = true;
                break;
            }
            if (isIncludeDevDependencies && devDependencies) {
                if (validationUtils.isPropertyExists({
                    obj: devDependencies,
                    fieldName: customPackageName
                })) {
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
            keysList: ['id', 'createDateTime', 'name', 'displayName', 'updateType', 'projectPath',
                'isIncludeDevDependencies', 'dependencies', 'isPackagesUpdate', 'isGitUpdate',
                'status', 'retriesCount']
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
                    resultMessage: 'The project update type marked as custom but no custom packages were found (1000033)'
                });
            }
            // Validate that if the update type is custom, at least one package from custom
            // matches the dependencies or to devDependencies objects (if required).
            if (!this.findMatchCustomPackages(projectDataModel)) {
                return this.updateProjectStatus({
                    projectDataModel: projectDataModel,
                    status: ProjectStatusEnum.NO_MATCH_CUSTOM_PACKAGES,
                    resultMessage: 'No match custom package in the dependencies or devDependencies objects were found (1000034)'
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
                resultMessage: 'There are no packages to validate. Consider rechecking the custom/exclude lists (1000035)'
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
            displayName: projectDataModel.displayName,
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
        projectDataModel.packagesList = [];
        if (status === ProjectStatusEnum.SUCCESS && validationUtils.isExists(projectDataModel.outdatedPackagesKeys)) {
            for (let i = 0; i < projectDataModel.outdatedPackagesKeys.length; i++) {
                const packageName = projectDataModel.outdatedPackagesKeys[i];
                const currentVersion = projectDataModel.packagesTemplate[packageName];
                const newerVersion = outdatedPackages[packageName];
                projectDataModel.packagesList.push({
                    outdatedPackage: `"${packageName}": "${currentVersion}"`,
                    updatePackage: `"${packageName}": "${newerVersion}"`,
                    logDisplay: `${packageName}: ${currentVersion} => ${newerVersion}`
                });
            }
        }
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

    async initiateUpdateProjectStep() {
        fileUtils.createDirectory(pathService.pathDataModel.temporaryDirectoryPath);
        await this.cleanTemporaryDirectory();
    }

    getProjectsUpdateAvailableCount() {
        return this.projectsDataModel.projectsList.filter(p => p.isPackagesUpdate && validationUtils.isExists(p.packagesList)).length;
    }

    async cleanTemporaryDirectory() {
        let isCleaned = true;
        for (let i = 0; i < countLimitService.countLimitDataModel.maximumDeleteTemporaryDirectoryRetriesCount; i++) {
            try {
                // Clean the temporary directory.
                await fileUtils.cleanDirectory(pathService.pathDataModel.temporaryDirectoryPath);
            } catch (error) {
                isCleaned = false;
            }
            if (isCleaned) {
                break;
            }
            else {
                await globalUtils.sleep(countLimitService.countLimitDataModel.millisecondsTimeoutDeleteTemporaryDirectory);
            }
        }
        if (!isCleaned) {
            throw new Error('Temporary directory is not cleanable (1000036)');
        }
    }

    async removeTemporaryDirectory() {
        let isRemoved = true;
        for (let i = 0; i < countLimitService.countLimitDataModel.maximumDeleteTemporaryDirectoryRetriesCount; i++) {
            try {
                // Remove the temporary directory if it exists.
                await fileUtils.removeDirectoryIfExists(pathService.pathDataModel.temporaryDirectoryPath);
            } catch (error) {
                isRemoved = false;
            }
            if (isRemoved) {
                break;
            }
            else {
                await globalUtils.sleep(countLimitService.countLimitDataModel.millisecondsTimeoutDeleteTemporaryDirectory);
            }
        }
        if (!isRemoved) {
            throw new Error(`${pathService.pathDataModel.temporaryDirectoryPath} directory is not removable (1000037)`);
        }
    }

    // This method updates the outdated packages of the project.
    async updateProjectOutdatedPackages(data) {
        const { index, totalProjects } = data;
        let { projectDataModel } = data;
        const { name, displayName, projectPath, parentProjectPath, gitRootPath,
            isPackagesUpdate, isGitUpdate, status, packagesList } = projectDataModel;
        try {
            // Validate that the project is package update flagged and successfully has outdated packages.
            if (!isPackagesUpdate || status !== ProjectStatusEnum.SUCCESS || !validationUtils.isExists(packagesList)) {
                return new UpdateProjectOutdatedPackagesResultModel(false, projectDataModel);
            }
            // Log the progress.
            logService.logProgress({
                displayName: displayName,
                currentNumber: index + 1,
                totalNumber: totalProjects,
                retriesCount: projectDataModel.retriesCount
            });
            // If it's a parent project or the temporary directory is empty, only then clone the project.
            if (!parentProjectPath || fileUtils.isDirectoryEmpty(pathService.pathDataModel.temporaryDirectoryPath)) {
                await gitService.getProject({
                    name: name,
                    cleanDirectory: this.cleanTemporaryDirectory
                });
            }
            // If the package-lock.json exists, delete it.
            const repositoryProjectBasePath = `${pathService.pathDataModel.temporaryDirectoryPath}\\${gitRootPath}`;
            const repositoryPackageJsonFilePath = `${repositoryProjectBasePath}\\package.json`;
            const repositoryPackageJsonLockFilePath = `${repositoryProjectBasePath}\\package-lock.json`;
            await fileUtils.removeFile(repositoryPackageJsonLockFilePath);
            // Update the package.json file with the updated packages versions.
            await packageService.updatePackageJsonPackages({
                packageJsonPath: repositoryPackageJsonFilePath,
                packagesList: packagesList
            });
            // Run 'npm i', wait for the results.
            await commandService.runCommand({
                command: CommandEnum.INSTALL,
                path: repositoryProjectBasePath
            });
            // Remove the last empty line in the package.json and package-lock.json files.
            await fileService.removeLastEmptyLine(repositoryPackageJsonFilePath);
            await fileService.removeLastEmptyLine(repositoryPackageJsonLockFilePath);
            // After the NPM update packages, will verify the update by checking the package.json file again.
            projectDataModel.packagesList = await packageService.validatePackageJsonUpdates({
                packageJsonPath: repositoryPackageJsonFilePath,
                packagesList: packagesList
            });
            // If it's a 'simulate mode' - Return true.
            if (applicationService.applicationDataModel.isSimulateUpdateMode) {
                return new UpdateProjectOutdatedPackagesResultModel(true, projectDataModel);
            }
            // Check if the project is-git-update = true in order to continue with the flow.
            if (isGitUpdate) {
                // Update GitHub.
                projectDataModel = await gitService.updateProjectChanges({
                    projectDataModel: projectDataModel,
                    path: repositoryProjectBasePath
                });
            }
            // After verification complete, delete the package.json and package-lock.json files from the original project.
            const originalProjectPackageJsonFilePath = `${projectPath}\\package.json`;
            const originalProjectPackageJsonLockFilePath = `${projectPath}\\package-lock.json`;
            await fileUtils.removeFile(originalProjectPackageJsonFilePath);
            await fileUtils.removeFile(originalProjectPackageJsonLockFilePath);
            // After deletion completes, copy the updated package.json and package-lock.json files to the original project's path.
            await fileUtils.copyFile({
                sourcePath: repositoryPackageJsonFilePath,
                targetPath: originalProjectPackageJsonFilePath
            });
            await fileUtils.copyFile({
                sourcePath: repositoryPackageJsonLockFilePath,
                targetPath: originalProjectPackageJsonLockFilePath
            });
        } catch (error) {
            logUtils.log(error);
            // If failed, add 1 to the retries, and go to the retry process.
            projectDataModel.retriesCount++;
            // If retries exceeded the limit, mark an error to the project and continue to the next project.
            if (projectDataModel.retriesCount <= countLimitService.countLimitDataModel.maximumRetriesCount) {
                await this.updateProjectOutdatedPackages({ projectDataModel, index, totalProjects });
            }
        }
        return new UpdateProjectOutdatedPackagesResultModel(true, projectDataModel);
    }

    selectUpdateProjects(totalUpdatableProjectsCount) {
        // Check if exceed the maximum update projects count.
        if (totalUpdatableProjectsCount < countLimitService.countLimitDataModel.maximumProjectsUpdateCount) {
            return;
        }
        // Get all project's indexes and reset all projects.
        let projectIndexesList = this.projectsDataModel.projectsList.reduce((a, e, i) => {
            if (e.isPackagesUpdate) {
                a.push(i);
                this.projectsDataModel.projectsList[i].isPackagesUpdate = false;
            }
            return a;
        }, []);
        // Random the projects to update and update the projects.
        projectIndexesList = textUtils.getListRandomElements(projectIndexesList,
            countLimitService.countLimitDataModel.maximumProjectsUpdateCount);
        for (let i = 0; i < projectIndexesList.length; i++) {
            this.projectsDataModel.projectsList[projectIndexesList[i]].isPackagesUpdate = true;
        }
    }

    // This method loops all the projects and auto updates the outdated packages.
    async updateProjectsOutdatedPackages() {
        // Check if any projects need to be updated.
        const totalUpdatableProjectsCount = this.getProjectsUpdateAvailableCount();
        if (!totalUpdatableProjectsCount) {
            return;
        }
        this.updatedProjectsCount = 0;
        // Select update projects.
        this.selectUpdateProjects(totalUpdatableProjectsCount);
        // Initiate the update step.
        await this.initiateUpdateProjectStep();
        // Loop on all the potential update projects.
        for (let i = 0; i < this.projectsDataModel.projectsList.length; i++) {
            const { isUpdated, projectDataModel } = await this.updateProjectOutdatedPackages({
                projectDataModel: this.projectsDataModel.projectsList[i],
                index: this.updatedProjectsCount,
                totalProjects: totalUpdatableProjectsCount
            });
            if (isUpdated) {
                this.projectsDataModel.projectsList[i] = projectDataModel;
                this.updatedProjectsCount++;
                if (this.updatedProjectsCount >= countLimitService.countLimitDataModel.maximumProjectsUpdateCount) {
                    break;
                }
                // Delay the application and move to the next project to update.
                await globalUtils.sleep(countLimitService.countLimitDataModel.millisecondsTimeoutUpdateProject);
            }
        }
    }

    async updateParentGitRepository() {
        /* Check if there are any projects with parent path that have
           been updated successfully. */
        const parentGitProjectNames = [];
        for (let i = 0; i < this.projectsDataModel.projectsList.length; i++) {
            const projectDataModel = this.projectsDataModel.projectsList[i];
            const { name, status, packagesList, parentProjectPath } = projectDataModel;
            if (validationUtils.isExists(packagesList) && status === ProjectStatusEnum.SUCCESS && parentProjectPath &&
                !parentGitProjectNames.includes(name)) {
                // Update the parent Git repository.
                this.projectsDataModel.projectsList[i] = await this.updateParentProject(projectDataModel);
                parentGitProjectNames.push(projectDataModel.name);
            }
        }
    }

    async updateParentProject(projectDataModel) {
        await gitService.getProject({
            name: projectDataModel.name,
            cleanDirectory: this.cleanTemporaryDirectory
        });
        const baseParentProjectPath = `${pathService.pathDataModel.temporaryDirectoryPath}\\${projectDataModel.name}`;
        const childOriginalProjectPath = `${projectDataModel.parentProjectPath}${projectDataModel.name}`;
        const childTemporaryProjectPath = `${baseParentProjectPath}\\${projectDataModel.name}`;
        // Remove outdated code.
        await fileUtils.removeDirectoryIfExists(childTemporaryProjectPath);
        // Copy the updated code into the temporary directory.
        await fileUtils.copyDirectory({
            sourcePath: childOriginalProjectPath,
            targetPath: childTemporaryProjectPath
        });
        // Update GitHub.
        projectDataModel = await gitService.updateProjectChanges({
            projectDataModel: projectDataModel,
            path: baseParentProjectPath
        });
        // Remove original outdated code.
        await fileUtils.removeDirectoryIfExists(childOriginalProjectPath);
        // Replace the original outdated code with the updated code.
        await fileUtils.copyDirectory({
            sourcePath: childTemporaryProjectPath,
            targetPath: childOriginalProjectPath
        });
        return projectDataModel;
    }

    // This method handles the outdated and updated packages result check.
    async handleResult() {
        // Log the result.
        await logService.logProjects(this.projectsDataModel);
    }

    updateProjectStatus(data) {
        const { projectDataModel, status, resultMessage } = data;
        if (!status || !validationUtils.isValidEnum({
            enum: ProjectStatusEnum,
            value: status
        })) {
            throw new Error(`Invalid or no ProjectStatusEnum parameter was found: ${status} (1000038)`);
        }
        projectDataModel.status = status;
        projectDataModel.resultMessage = resultMessage;
        projectDataModel.resultDateTime = timeUtils.getCurrentDate();
        return projectDataModel;
    }
}

module.exports = new ProjectService();