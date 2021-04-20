const ncu = require('npm-check-updates');
const { OutdatedResult } = require('../../core/models');
const logService = require('./log.service');
const { systemUtils } = require('../../utils');

class PackageService {

    constructor() { }

    // This method returns the outdated packages of a given package.json data template.
    async getOutdatedPackages(data) {
        const { name, index, projectsCount } = data;
        let { packagesTemplate } = data;
        if (!packagesTemplate) {
            throw new Error('Invalid or no packagesTemplate object was found (1000015)');
        }
        packagesTemplate = { dependencies: packagesTemplate };
        const outdatedResult = new OutdatedResult();
        try {
            // Log the progress.
            logService.logProgress({
                name: name,
                currentNumber: index + 1,
                totalNumber: projectsCount
            });
            // Check for packages updates.
            outdatedResult.outdatedPackages = await ncu.run({
                // Pass any CLI option.
                packageData: JSON.stringify(packagesTemplate),
                upgrade: false,
                // Defaults:
                jsonUpgraded: true,
                silent: true
            });
        }
        catch (error) {
            outdatedResult.errorMessage = systemUtils.getErrorDetails(error);
        }
        return outdatedResult;
    }
}

module.exports = new PackageService();