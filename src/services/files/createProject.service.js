const { ProjectData, ProjectsData } = require('../../core/models');
const { ProjectStatus, UpdateType } = require('../../core/enums');
const fileService = require('./file.service');
const pathService = require('./path.service');
const { fileUtils, validationUtils, timeUtils } = require('../../utils');

class CreateProjectService {

    constructor() {
        this.projectsData = null;
    }

    initiate() {
        this.projectsData = new ProjectsData();
    }

    async initiateProjects() {
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
    }

    async createProjects(resultData) {
        for (let i = 0; i < resultData.length; i++) {
            const projectData = await this.validateCreateProject(resultData[i]);
            console.log(projectData);
        }
    }

    async validateCreateProject(data) {
        // Create a new project data.
        let lastProjectId = 1;
        let projectData = new ProjectData({
            id: lastProjectId,
            createDateTime: timeUtils.getCurrentDate(),
            status: ProjectStatus.CREATE
        });
        lastProjectId++;
        // Validate the 'name' field.
        projectData = this.validateProjectName(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // This method validate the 'update-type' field.
        projectData = this.validateUpdateType(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        // This method validate the 'packages-path' field.
        projectData = await this.validatePackagesPath(projectData, data);
        if (projectData.resultMessage) {
            return projectData;
        }
        return projectData;
    }

    // This method validate the 'name' field.
    validateProjectName(projectData, data) {
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
        return projectData;
    }

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
        projectData.resultDateTime = timeUtils.getCurrentDate();
        projectData.resultMessage = resultMessage;
        return projectData;
    }
}

module.exports = new CreateProjectService();
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