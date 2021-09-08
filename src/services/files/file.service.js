const { FileDataResultModel } = require('../../core/models');
const { fileUtils, pathUtils, validationUtils } = require('../../utils');

class FileService {

    constructor() { }

    async getFileData(data) {
        const { filePath, parameterName, fileExtension, isPackageJSONFile } = data;
        const fileDataResultModel = new FileDataResultModel();
        if (!await fileUtils.isPathExists(filePath)) {
            fileDataResultModel.errorMessage = `Path not exists: ${filePath} (1000003)`;
            return fileDataResultModel;
        }
        if (!fileUtils.isFilePath(filePath)) {
            fileDataResultModel.errorMessage = `The parameter path ${parameterName} marked as file but it's a path of a directory: ${filePath} (1000004)`;
            return fileDataResultModel;
        }
        const extension = pathUtils.getExtension(filePath);
        if (extension !== fileExtension) {
            fileDataResultModel.errorMessage = `The parameter path ${parameterName} must be a ${fileExtension} file but it's: ${extension} file (1000005)`;
            return fileDataResultModel;
        }
        fileDataResultModel.resultData = await fileUtils.read(filePath);
        if (fileExtension === '.json') {
            fileDataResultModel.resultData = JSON.parse(fileDataResultModel.resultData);
        }
        if (!isPackageJSONFile && !validationUtils.isExists(fileDataResultModel.resultData)) {
            fileDataResultModel.errorMessage = `No data exists in the file: ${filePath} (1000006)`;
            return fileDataResultModel;
        }
        return fileDataResultModel;
    }

    async removeLastEmptyLine(targetPath) {
        let file = await fileUtils.read(targetPath);
        file = file.replace(/\n*$/, '');
        await fileUtils.removeFile(targetPath);
        await fileUtils.appendFile({
            targetPath: targetPath,
            message: file
        });
    }
}

module.exports = new FileService();