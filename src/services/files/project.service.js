const { ProjectData, ProjectsData } = require('../../core/models');
const { ProjectStatus, UpdateType } = require('../../core/enums');
const countLimitService = require('./countLimit.service');
const fileService = require('./file.service');
const pathService = require('./path.service');
const { validationUtils, textUtils, timeUtils } = require('../../utils');

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
            throw new Error('Invalid or no fileDataResult object was found (1000015)');
        }
        const { resultData, errorMessage } = fileDataResult;
        if (errorMessage) {
            throw new Error(errorMessage);
        }
        if (!validationUtils.isValidArray(resultData)) {
            throw new Error('Invalid or no resultData array was found (1000015)');
        }
        // Validate and create all the projects.
        await this.createProjects(resultData);
        // Validate the projects.
        this.validateProjects();
        console.log(this.projectsData.projectsList);
        // Check for updates in all the projects.

        // Log all the projects with the results.
    }

    // This method creates the projects.
    async createProjects(resultData) {
        let lastProjectId = 1;
        for (let i = 0; i < resultData.length; i++) {
            const projectData = await this.validateCreateProject(resultData[i], lastProjectId);
            if (!projectData) {
                throw new Error('Invalid or no projectData object was found (1000015)');
            }
            lastProjectId++;
            this.projectsData.projectsList.push(projectData);
        }
    }

    // This method validate the projects.
    validateProjects() {
        if (this.projectsData.projectsList.length <= 1) {
            return;
        }
        // Clean duplicate projects (by the same package.json paths).
        for (let i = 0; i < this.projectsData.projectsList.length; i++) {
            this.compareProjects(this.projectsData.projectsList[i]);
        }
        // Validate that the maximum number of projects don't exceeded the limit.
        if (this.projectsData.projectsList.length > countLimitService.countLimitData.maximumProjectsCount) {
            this.projectsData.projectsList = this.projectsData.projectsList.slice(0, countLimitService.countLimitData.maximumProjectsCount);
        }
    }

    // This method check if duplicate projects exist, based on the same package.json paths.
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
                    resultMessage: `The project's package.json already exists in the list of projects: ${projectData.updateType} (1000014)`
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

    // This method validate the 'name' field.
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

    // This method validate the 'update-type' field.
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
                resultMessage: `Mismatch UpdateType parameter was found: ${projectData.updateType} (1000014)`
            });
        }
        return projectData;
    }

    // This method validate the 'packages-path' field.
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
            throw new Error('Invalid or no fileDataResult object was found (1000015)');
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
                resultMessage: `Invalid package.json file structure: missing 'dependencies' property (1000016)`
            });
        }
        // Check that at least one package exists - Throw an exception if not.
        const dependenciesKeys = Object.keys(resultData.dependencies);
        if (!validationUtils.isExists(dependenciesKeys)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.NO_PACKAGES_IN_PACKAGES_PATH,
                resultMessage: `No packages exists in the package.json file (1000016)`
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

    // This method validate the 'custom-packages-path' field.
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
            throw new Error('Invalid or no fileDataResult object was found (1000015)');
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

    // This method validate the 'exclude-packages-list' field.
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

    // This method validate the 'include-dev-dependencies' field.
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

    // This method validate the a string field from the project.json file.
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
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000016)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000016)`
                });
            }
        }
        projectData[projectFieldName] = fieldValue ? fieldValue.trim() : fieldValue;
        return projectData;
    }

    // This method validate the a boolean field from the project.json file.
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
                resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a boolean but received: ${fieldValue} (1000016)`
            });
        }
        projectData[projectFieldName] = fieldValue;
        return projectData;
    }

    // This method validate the an array field from the project.json file.
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
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000016)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected an array but received: ${fieldValue} (1000016)`
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

    // This method validate that if the update type is custom, at least one package from custom
    // match the dependencies or to devDependencies objects (if required).
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

    // This method validate the entire project data.
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
                    resultMessage: 'The project update type marked as custom but no custom packages were found (1000034)'
                });
            }
            // Validate that if the update type is custom, at least one package from custom
            // match the dependencies or to devDependencies objects (if required).
            if (!this.findMatchCustomPackages(projectData)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: ProjectStatus.NO_MATCH_CUSTOM_PACKAGES,
                    resultMessage: 'No match custom package in the dependencies or devDependencies objects were found (1000034)'
                });
            }
        }
        return projectData;
    }

    finalizeProject(projectData) {
        // Clear all duplicate packages, regardless to the versions.
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
        // Remove the exclude packages from the list, if exists.
        if (validationUtils.isExists(excludePackagesList)) {
            for (let i = 0; i < excludePackagesList.length; i++) {
                delete packagesTemplate[excludePackagesList[i]];
            }
        }
        // Validate that there are any packages in the template. If not, update the status.
        if (!validationUtils.isExists(Object.keys(packagesTemplate))) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.NO_TEMPLATE_PACKAGES,
                resultMessage: 'There are no packages to validate. Consider rechecking the custom/exclude lists (1000034)'
            });
        }
        projectData.packagesTemplate = packagesTemplate;
        return projectData;
    }

    validateCheckResult() {
        // ToDo: On the second step here - Logic of update packages - Here - If outdated packages exists.

        // Prepare and save the result to log.
    }

    updateProjectStatus(data) {
        const { projectData, status, resultMessage } = data;
        if (!status || !validationUtils.isValidEnum({
            enum: ProjectStatus,
            value: status
        })) {
            throw new Error(`Invalid or no ProjectStatus parameter was found: ${status} (1000014)`);
        }
        projectData.status = status;
        projectData.resultMessage = resultMessage;
        projectData.resultDateTime = timeUtils.getCurrentDate();
        return projectData;
    }
}

module.exports = new ProjectService();
/*                 debugger; */
/*         //projectData.customPackagesList = resultData.split('\r\n').map(p => p.trim()); */
/*         switch (updateType) {
            case UpdateType.FULL: {
                break;
            }
            case UpdateType.CUSTOM: {
                break;
            }
        } */
/*     this.packagesPath = null;
this.customPackagesPath = null;
this.customPackagesList = null;
this.excludePackagesList = null;
this.isIncludeDevDependencies = null;
this.dependencies = null;
this.devDependencies = null; */
/*         let packagesTemplate = { ...projectData.dependencies };
        if (projectData.isIncludeDevDependencies && projectData.devDependencies) {
            packagesTemplate = { ...packagesTemplate, ...projectData.devDependencies };
        } */
        // If the update type is custom - Remove all the packages that are not listed in the customPackagesList.
        //if (projectData.updateType === UpdateType.CUSTOM) {
        //for (let i = )
/*             const keys = Object.keys(packagesTemplate);
            for (let i = 0; i < keys.length; i++) {

            } */
        //    else if ()
        //}
/* } */
/*         console.log(resultData.length); */
/*         this.lastProjectId = null; */
/*             console.log(projectData); */
/*         this.lastProjectId++; */
/*                 this.coursesData.coursesList[i] = this.updateCourseStatus({
                    course: currentCourse,
                    status: CourseStatus.DUPLICATE,
                    details: 'This course repeats multiple times in this session and should be purchased.'
                }); */
/* initiateProjects */
/* CreateProjectService */
/* CreateProjectService */
/*         // Verify all fields that expected to be filled are filled. */
/*    constructor(data) {
const { id, createDateTime, status } = data;
this.id = id;
this.createDateTime = createDateTime;
this.name = null;
this.updateType = null;
this.packagesPath = null;
this.customPackagesPath = null;
this.customPackagesList = null;
this.excludePackagesList = null;
this.isIncludeDevDependencies = null;
this.dependencies = null;
this.devDependencies = null;
this.status = status;
this.resultDateTime = null;
this.resultMessage = null;
this.retriesCount = 0;
} */
/*         if (projectData.resultMessage) {
            return projectData;
        }
        // 1. Refer to the new service - The Package service to add it to the exclude packages list. */
/*         // 1. Refer to the new service - The Package service to check for each package in the custom packages path. */
/*         // Once the validation complete, refer to the packageService to create all the packages list.
        projectData = packageService.createDependenciesPackagesList({
            projectData: projectData,
            dependencies: resultData.dependencies,
            dependenciesKeys: dependenciesKeys
        });
        // Create the devDependencies as well (if exists and required).
        if (projectData.isIncludeDevDependencies && resultData.devDependencies) {
            const devDependenciesKeys = Object.keys(resultData.devDependencies);
            if (validationUtils.isExists(devDependenciesKeys)) {
                projectData = packageService.createDevDependenciesPackagesList({
                    projectData: projectData,
                    devDependencies: resultData.devDependencies,
                    devDependenciesKeys: devDependenciesKeys
                });
            }
        } */
/* const packageService = require('./package.service'); */
// =================================
/* const { PackageData } = require('../../core/models');
const { PackageStatus, PackageType } = require('../../core/enums');
const { textUtils, timeUtils, validationUtils } = require('../../utils');
const countLimitService = require('./countLimit.service');

class PackageService {

    constructor() {
        this.lastPackageId = 1;
    }

    // This method converts the dependencies packages in the JSON package.json file into packages models.
    createDependenciesPackagesList(data) {
        const { projectData, dependencies, dependenciesKeys } = data;
        projectData.packagesList = [];
        for (let i = 0; i < dependenciesKeys.length; i++) {
            const key = dependenciesKeys[i];
            const packageData = this.validateCreatePackage({
                name: key,
                version: dependencies[key],
                type: PackageType.DEPENDENCIES
            });
            if (packageData) {
                projectData.packagesList.push(packageData);
            }
        }
        return projectData;
    }

    // This method converts the dev dependencies packages in the JSON package.json file into packages models.
    createDevDependenciesPackagesList(data) {
        const { projectData, devDependencies, devDependenciesKeys } = data;
        for (let i = 0; i < devDependenciesKeys.length; i++) {
            const key = devDependenciesKeys[i];
            const packageData = this.validateCreatePackage({
                name: key,
                version: devDependencies[key],
                type: PackageType.DEV_DEPENDENCIES
            });
            if (packageData) {
                projectData.packagesList.push(packageData);
            }
        }
        return projectData;
    }

    // This method converts the custom packages in the TXT file into packages models.
    createCustomPackagesList() {

    }

    // This method converts the exclude packages from the projectData object into packages models.
    createExcludePackagesList() {

    }

    // This method validates and creates a package model.
    validateCreatePackage(data) {
        const { name, version, type } = data;
        // Create a new package data.
        const packageData = new PackageData({
            id: this.lastPackageId,
            createDateTime: timeUtils.getCurrentDate(),
            type: type,
            status: PackageStatus.CREATE
        });
        this.lastPackageId++;
        // Validate the name.
        if (!name) {
            return this.updatePackageStatus({
                packageData: packageData,
                status: PackageStatus.EMPTY_NAME,
                resultMessage: `No package name was found: ${name} (1000014)`
            });
        }
        packageData.name = textUtils.cutText({
            text: name,
            count: countLimitService.countLimitData.maximumPackageNameCharactersCount
        });
        // Validate the version.
        if (type === PackageType.DEPENDENCIES || type === PackageType.DEV_DEPENDENCIES) {
            if (!version) {
                return this.updatePackageStatus({
                    packageData: packageData,
                    status: PackageStatus.EMPTY_VERSION,
                    resultMessage: `No package version was found: ${version} (1000014)`
                });
            }
            packageData.currentVersion = textUtils.cutText({
                text: version,
                count: countLimitService.countLimitData.maximumPackageVersionCharactersCount
            });
        }
        return packageData;
    }

    updatePackageStatus(data) {
        const { packageData, status, resultMessage } = data;
        if (!status || !validationUtils.isValidEnum({
            enum: PackageStatus,
            value: status
        })) {
            throw new Error(`Invalid or no PackageStatus parameter was found: ${status} (1000014)`);
        }
        packageData.status = status;
        packageData.resultMessage = resultMessage;
        packageData.resultDateTime = timeUtils.getCurrentDate();
        return packageData;
    }
}


module.exports = new PackageService();
/*         projectData.packagesList = []; */
/*         //projectData.packagesList = new PackagesData(); */
/* , PackagesData */
/*     this.maximumPackageNameCharactersCount = MAXIMUM_PACKAGE_NAME_CHARACTERS_COUNT;
    this.maximumPackageVersionCharactersCount = MAXIMUM_PACKAGE_VERSION_CHARACTERS_COUNT; */
// =================================
/* fileUtils,  */
/*
['MISSING_CUSTOM_PACKAGES_PATH', 'MISSING CUSTOM PACKAGES PATH'],
['INVALID_CUSTOM_PACKAGES_PATH', 'INVALID CUSTOM PACKAGES PATH'], */
/*         if (isRequired) { */ /*         } */
/*             fieldType: 'string', */
/*             fieldType: 'string', */
/*             fieldType: 'string', */
/* ,
emptyStatus: null */
/*             fieldType: 'boolean', */
/* this.validateJSONString({ */
/*     // This method validate the a field from the project.json file.
    validateJSONField(data, jsonData) {
        const { projectData, jsonFieldName, projectFieldName, fieldType, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired) {
            let validationMethod = null;
            switch (fieldType) {
                case 'string': { validationMethod = validationUtils.isValidString; break; }
                case 'boolean': { validationMethod = validationUtils.isValidBoolean; break; }
            }
            if (!validationMethod(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: invalidStatus,
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a ${fieldType} but received: ${fieldValue} (1000016)`
                });
            }
            if (fieldType === 'string' && !validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a ${fieldType} but received: ${fieldValue} (1000016)`
                });
            }
        }
        projectData[projectFieldName] = fieldType === 'string' ? fieldValue.trim() : fieldValue;
        return projectData;
    } */

/* fieldType,  */
/*                let validationMethod = null;
               switch (fieldType) {
                   case 'string': { validationMethod = validationUtils.isValidString; break; }
                   case 'boolean': { validationMethod = validationUtils.isValidBoolean; break; }
               } */
                                //if (!validationMethod(fieldValue)) {
                                    //${fieldType}
                                    //${fieldType}
/* fieldType === 'string' &&  */
/*  : fieldValue; */ /* fieldType === 'string' ?  */
/* , emptyStatus */
/* fieldType,  */
/*             let validationMethod = null;
            switch (fieldType) {
                case 'string': { validationMethod = validationUtils.isValidString; break; }
                case 'boolean': { validationMethod = validationUtils.isValidBoolean; break; }
            } */
/* ${fieldType} */
            //if (!validationMethod(fieldValue)) {
/*                 ${fieldType} */
/*           if (fieldType === 'string' && !validationUtils.isExists(fieldValue)) {
              return this.updateProjectStatus({
                  projectData: projectData,
                  status: emptyStatus,
                  resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a boolean but received: ${fieldValue} (1000016)`
              });
          } */
/* fieldType === 'string' ? fieldValue.trim() : */
/*         if (fieldType === 'string') { *//*         } */
/*     // This method validate the a field from the project.json file.
validateJSONField(data, jsonData) {
const { projectData, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
return this.updateProjectStatus({
projectData: projectData,
status: missingStatus,
resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
});
}
const fieldValue = jsonData[jsonFieldName];
if (isRequired) {
if (!validationUtils.isValidString(fieldValue)) {
return this.updateProjectStatus({
    projectData: projectData,
    status: invalidStatus,
    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000016)`
});
}
if (!validationUtils.isExists(fieldValue)) {
return this.updateProjectStatus({
    projectData: projectData,
    status: emptyStatus,
    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000016)`
});
}
}
projectData[projectFieldName] = fieldValue.trim();
return projectData;
} */

/*     // This method validate the a boolean from the project.json file.
    validateJSONBoolean(data, jsonData) {
        const { projectData, jsonFieldName, projectFieldName, isRequired, missingStatus, invalidStatus, emptyStatus } = data;
        if (!validationUtils.isPropertyExists(jsonData, jsonFieldName)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: missingStatus,
                resultMessage: `Field '${jsonFieldName}' does not exists in the project.`
            });
        }
        const fieldValue = jsonData[jsonFieldName];
        if (isRequired) {
            if (!validationUtils.isValidString(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: invalidStatus,
                    resultMessage: `Invalid '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000016)`
                });
            }
            if (!validationUtils.isExists(fieldValue)) {
                return this.updateProjectStatus({
                    projectData: projectData,
                    status: emptyStatus,
                    resultMessage: `Empty '${jsonFieldName}' parameter was found: Expected a string but received: ${fieldValue} (1000016)`
                });
            }
        }
        projectData[projectFieldName] = fieldValue.trim();
        return projectData;
    } */

/*
    c */
/*     ['MISSING_PACKAGES_PATH', 'MISSING PACKAGES PATH'],
    ['INVALID_PACKAGES_PATH', 'INVALID PACKAGES PATH'],
    ['EMPTY_PACKAGES_PATH', 'EMPTY PACKAGES PATH'],
    ['NOT_FILE_PACKAGES_PATH', 'NOT FILE PACKAGES PATH'],
    ['INVALID_STRUCTURE_PACKAGES_PATH', 'INVALID STRUCTURE PACKAGES PATH'], */

/*         if (!fileUtils.isFilePath(projectData.packagesPath)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.NOT_FILE_PACKAGES_PATH,
                resultMessage: `The path 'packages-path' parameter needs to be a file path but it's a directory path: ${projectData.packagesPath} (1000008)`
            });
        } */
/*             'name','update-type','packages-path','custom-packages-path',
            'exclude-packages-list','include-dev-dependencies' */
/*         if (!validationUtils.isPropertyExists(data, 'update-type')) {
    return this.updateProjectStatus({
        projectData: projectData,
        status: ProjectStatus.MISSING_UPDATE_TYPE,
        resultMessage: 'Field "update-type" does not exists in the project.'
    });
}
let updateType = data['update-type'];
if (!validationUtils.isValidString(updateType)) {
    return this.updateProjectStatus({
        projectData: projectData,
        status: ProjectStatus.INVALID_UPDATE_TYPE,
        resultMessage: `Invalid "update-type" parameter was found: Expected a string but received: ${updateType} (1000016)`
    });
}
if (!validationUtils.isExists(updateType)) {
    return this.updateProjectStatus({
        projectData: projectData,
        status: ProjectStatus.EMPTY_UPDATE_TYPE,
        resultMessage: `Empty "name" parameter was found: Expected a string but received: ${updateType} (1000016)`
    });
} */
/*         projectData.updateType = updateType.trim(); */
/*
['MISSING_UPDATE_TYPE', 'MISSING UPDATE TYPE'],
['INVALID_UPDATE_TYPE', 'INVALID UPDATE TYPE'],
['EMPTY_UPDATE_TYPE', 'EMPTY UPDATE TYPE'],
['MISMATCH_UPDATE_TYPE', 'MISMATCH UPDATE TYPE'], */
/*             return projectData; */
/*             projectData.updateProjectStatus(projectData, ProjectStatus.MISSING_NAME, '') */

/*     async validateProject(data)
    {

    } */

/*     const ProjectStatus = enumUtils.createEnum([
        ['CREATE', 'create'],
        ['UPDATE', 'update'],
        ['MISSING_NAME', 'MISSING NAME'],
        ['INVALID_NAME', 'INVALID NAME'],
        ['MISSING_UPDATE_TYPE', 'MISSING UPDATE TYPE'],
        ['MISSING_PACKAGES_PATH', 'MISSING PACKAGES PATH'],
        ['INVALID_PACKAGES_PATH', 'INVALID PACKAGES PATH'],
        ['MISSING_CUSTOM_PACKAGES_PATH', 'MISSING CUSTOM PACKAGES PATH'],
        ['INVALID_CUSTOM_PACKAGES_PATH', 'INVALID CUSTOM PACKAGES PATH'],
        ['MISSING_EXCLUDE_PACKAGES_LIST', 'MISSING EXCLUDE PACKAGES LIST'],
        ['INVALID_EXCLUDE_PACKAGES_LIST', 'INVALID EXCLUDE PACKAGES LIST'],
        ['MISSING_INCLUDE_DEV_DEPENDENCIES', 'MISSING INCLUDE DEV DEPENDENCIES'],
        ['INVALID_INCLUDE_DEV_DEPENDENCIES', 'INVALID INCLUDE DEV DEPENDENCIES'],
        ['FAIL', 'fail'],
        ['FINISH', 'finish']
    ]); */
/*         if (!validationUtils.isPropertyExists(data, 'name')) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.MISSING_NAME,
                resultMessage: 'Field "name" does not exists in the project.'
            });
        }
        const name = data['name'];
        if (!validationUtils.isValidString(name)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.INVALID_NAME,
                resultMessage: `Invalid "name" parameter was found: Expected a string but received: ${name} (1000016)`
            });
        }
        if (!validationUtils.isExists(name)) {
            return this.updateProjectStatus({
                projectData: projectData,
                status: ProjectStatus.EMPTY_NAME,
                resultMessage: `Empty "name" parameter was found: Expected a string but received: ${name} (1000016)`
            });
        }
        projectData.name = name.trim();
        return projectData; */
/*         let result */
/* 		[
        ].map(key => {
        if (!validationUtils.isPropertyExists(data, key)) {
                result = `Invalid or no ${key} parameter was found: Expected a array but received: ${value} (1000019)`);
            }
        }); */
/* 			// ===BACKUP=== //
            'IGNORE_DIRECTORIES', 'IGNORE_FILES', 'INCLUDE_FILES' */
/* 			const value = data[key];
 */
/*        console.log(resultData); */
/*         if (!resultData) {
            throw new Error('Invalid or no resultData was found (1000015)');
        } */
/*         console.log(fileDataResult); */