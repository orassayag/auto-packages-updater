const settings = require('../settings/settings');
const { StatusEnum } = require('../core/enums');
const { applicationService, confirmationService, countLimitService, logService,
    pathService, projectService, validationService } = require('../services');
const globalUtils = require('../utils/files/global.utils');
const { logUtils, systemUtils, timeUtils } = require('../utils');

class PackagesLogic {

    constructor() { }

    async run() {
        // Validate all settings that fit the user's needs.
        await this.confirm();
        // Initiate all the settings, configurations, services, etc...
        await this.initiate();
        // Validate general settings.
        await this.validateGeneralSettings();
        // Start the scan for outdated packages process.
        await this.startSession();
    }

    async initiate() {
        this.updateStatus('INITIATE THE SERVICES', StatusEnum.INITIATE);
        countLimitService.initiate(settings);
        applicationService.initiate({
            settings: settings,
            status: StatusEnum.INITIATE
        });
        pathService.initiate(settings);
        await logService.initiate(settings);
        projectService.initiate();
    }

    async validateGeneralSettings() {
        this.updateStatus('VALIDATE GENERAL SETTINGS', StatusEnum.VALIDATE);
        // Validate that the internet connection works.
        await validationService.validateInternetConnection();
    }

    async startSession() {
        // Initiate.
        this.updateStatus('OUTDATED PACKAGES', StatusEnum.OUTDATED, false);
        applicationService.applicationDataModel.startDateTime = timeUtils.getCurrentDate();
        // Run the process - Check for outdated packages.
        await projectService.findOutdatedPackages();
/*         if (projectService.getProjectsUpdateAvailableCount()) {
            // Run the process - Update outdated packages.
            this.updateStatus('UPDATE PACKAGES', StatusEnum.UPDATE, true);
            await projectService.findUpdatePackages();
        } */
        // Handle all the project's results.
        await projectService.handleResult();
        await this.exit(StatusEnum.FINISH);
    }

    async sleep() {
        await globalUtils.sleep(countLimitService.countLimitDataModel.millisecondsTimeoutExitApplication);
    }

    // Let the user confirm all the IMPORTANT settings before the process starts.
    async confirm() {
        if (!await confirmationService.confirm(settings)) {
            await this.exit(StatusEnum.ABORT_BY_THE_USER);
        }
    }

    updateStatus(text, status, isBeforeBreakLine) {
        if (isBeforeBreakLine) {
            logUtils.logSpace();
        }
        logUtils.logStatus(text);
        if (applicationService.applicationDataModel) {
            applicationService.applicationDataModel.status = status;
        }
    }

    async exit(status) {
        if (applicationService.applicationDataModel) {
            applicationService.applicationDataModel.status = status;
            await this.sleep();
        }
        logUtils.logSpace();
        systemUtils.exit(status);
    }
}

module.exports = PackagesLogic;