const isReachable = require('is-reachable');
const applicationService = require('./application.service');
const countLimitService = require('./countLimit.service');
const globalUtils = require('../../utils/files/global.utils');

class ValidationService {

    constructor() { }

    async validateInternetConnection() {
        const url = applicationService.applicationDataModel.validationConnectionLink;
        let isConnected = true;
        for (let i = 0; i < countLimitService.countLimitDataModel.maximumURLValidationCount; i++) {
            try {
                isConnected = await isReachable(url);
            } catch (error) {
                isConnected = false;
            }
            if (isConnected) {
                break;
            }
            else {
                await globalUtils.sleep(countLimitService.countLimitDataModel.millisecondsTimeoutURLValidation);
            }
        }
        if (!isConnected) {
            throw new Error(`${url} is not available (1000039)`);
        }
    }
}

module.exports = new ValidationService();