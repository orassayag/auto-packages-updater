const { FileDataResult } = require('../../core/models');
const { fileUtils, pathUtils, validationUtils } = require('../../utils');

class FileService {

    constructor() { }

    async getFileData(data) {
        const { filePath, parameterName, fileExtension } = data;
        const fileDataResult = new FileDataResult();
        if (!await fileUtils.isPathExists(filePath)) {
            fileDataResult.errorMessage = `Invalid or no ${parameterName} parameter was found: Expected a number but received: ${filePath} (1000010)`;
            return fileDataResult;
        }
        if (!fileUtils.isFilePath(filePath)) {
            fileDataResult.errorMessage = `The parameter path ${parameterName} marked as file but it's a path of a directory: ${filePath} (1000011)`;
            return fileDataResult;
        }
        const extension = pathUtils.getExtension(filePath);
        if (extension !== fileExtension) {
            fileDataResult.errorMessage = `The parameter path ${parameterName} must be a ${fileExtension} file but it's: ${extension} file (1000012)`;
            return fileDataResult;
        }
        fileDataResult.resultData = await fileUtils.read(filePath);
        if (fileExtension === '.json') {
            fileDataResult.resultData = JSON.parse(fileDataResult.resultData);
        }
        if (!validationUtils.isExists(fileDataResult.resultData)) {
            fileDataResult.errorMessage = `No data exists in the file: ${filePath} (1000013)`;
            return fileDataResult;
        }
        return fileDataResult;
    }
}

module.exports = new FileService();
/* textUtils,  */
/*  environment, */
            /*         fileDataResult.resultData =  */
        //return resultData;
            /*             throw new Error(`No data exists in the file: ${filePath} (1000013)`); */
                    //const fileData = await fileUtils.read(filePath);
/*         let resultData = null; */
            /*             throw new Error(`The parameter path ${parameterName} must be a ${fileExtension} file but it's: ${extension} file (1000012)`); */
            /*             throw new Error(`Invalid or no ${parameterName} parameter was found: Expected a number but received: ${filePath} (1000010)`); */
/*             throw new Error(`The parameter path ${parameterName} marked as file but it's a path of a directory: ${filePath} (1000011)`); */