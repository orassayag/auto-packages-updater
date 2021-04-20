const { FileDataResult } = require('../../core/models');
const { fileUtils, pathUtils, validationUtils } = require('../../utils');

class FileService {

    constructor() { }

    async getFileData(data) {
        const { filePath, parameterName, fileExtension, isPackageJSONFile } = data;
        const fileDataResult = new FileDataResult();
        if (!await fileUtils.isPathExists(filePath)) {
            fileDataResult.errorMessage = `Path not exists: ${filePath} (1000003)`;
            return fileDataResult;
        }
        if (!fileUtils.isFilePath(filePath)) {
            fileDataResult.errorMessage = `The parameter path ${parameterName} marked as file but it's a path of a directory: ${filePath} (1000004)`;
            return fileDataResult;
        }
        const extension = pathUtils.getExtension(filePath);
        if (extension !== fileExtension) {
            fileDataResult.errorMessage = `The parameter path ${parameterName} must be a ${fileExtension} file but it's: ${extension} file (1000005)`;
            return fileDataResult;
        }
        fileDataResult.resultData = await fileUtils.read(filePath);
        if (fileExtension === '.json') {
            fileDataResult.resultData = JSON.parse(fileDataResult.resultData);
        }
        if (!isPackageJSONFile && !validationUtils.isExists(fileDataResult.resultData)) {
            fileDataResult.errorMessage = `No data exists in the file: ${filePath} (1000006)`;
            return fileDataResult;
        }
        return fileDataResult;
    }
}

module.exports = new FileService();