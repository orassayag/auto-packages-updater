const ncu = require('npm-check-updates');
const { OutdatedResultModel } = require('../../core/models');
const { PackageStatusEnum } = require('../../core/enums');
const logService = require('./log.service');
const { fileUtils, systemUtils, textUtils } = require('../../utils');

class PackageService {

    constructor() { }

    // This method returns the outdated packages of a given package.json data template.
    async getOutdatedPackages(data) {
        const { displayName, index, projectsCount } = data;
        let { packagesTemplate } = data;
        if (!packagesTemplate) {
            throw new Error('Invalid or no packagesTemplate object was found (1000018)');
        }
        packagesTemplate = { dependencies: packagesTemplate };
        const outdatedResultModel = new OutdatedResultModel();
        try {
            // Log the progress.
            logService.logProgress({
                displayName: displayName,
                currentNumber: index + 1,
                totalNumber: projectsCount,
                retriesCount: 0
            });
            // Check for all the package updates.
            outdatedResultModel.outdatedPackages = await ncu.run({
                // Pass any CLI option.
                packageData: JSON.stringify(packagesTemplate),
                upgrade: false,
                // Defaults:
                jsonUpgraded: true,
                silent: true
            });
        }
        catch (error) {
            outdatedResultModel.errorMessage = systemUtils.getErrorDetails(error);
        }
        return outdatedResultModel;
    }

    async updatePackageJsonPackages(data) {
        const { packageJsonPath, packagesList } = data;
        const packageJson = await fileUtils.read(packageJsonPath);
        await fileUtils.removeFile(packageJsonPath);
        let result = packageJson;
        for (let i = 0; i < packagesList.length; i++) {
            const { outdatedPackage, updatePackage } = packagesList[i];
            result = textUtils.replaceBreakLines({
                string: result,
                value: outdatedPackage,
                replace: updatePackage
            });
        }
        await fileUtils.appendFile({
            targetPath: packageJsonPath,
            message: result
        });
    }

    async validatePackageJsonUpdates(data) {
        const { packageJsonPath, packagesList } = data;
        const packageJson = await fileUtils.read(packageJsonPath);
        for (let i = 0; i < packagesList.length; i++) {
            packagesList[i].status = packageJson.indexOf(packagesList[i].outdatedPackage) === -1 &&
                packageJson.indexOf(packagesList[i].updatePackage) > -1 ? PackageStatusEnum.UPDATED : PackageStatusEnum.FAILED;
        }
        return packagesList;
    }

    updatePackagesStatus(data) {
        const { isErrorExists, packagesList } = data;
        for (let i = 0; i < packagesList.length; i++) {
            packagesList[i].status = isErrorExists ? PackageStatusEnum.FAILED : PackageStatusEnum.GIT_PUSHED;
        }
        return packagesList;
    }
}

module.exports = new PackageService();