const settings = require('../settings/settings');
const { Status } = require('../core/enums');
const { applicationService, confirmationService, countLimitService, logService,
    pathService, projectService, validationService } = require('../services');
const globalUtils = require('../utils/files/global.utils');
const { logUtils, systemUtils, timeUtils } = require('../utils');

class OutdatedLogic {

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
        this.updateStatus('INITIATE THE SERVICES', Status.INITIATE);
        countLimitService.initiate(settings);
        applicationService.initiate({
            settings: settings,
            status: Status.INITIATE
        });
        pathService.initiate(settings);
        await logService.initiate(settings);
        projectService.initiate();
    }

    async validateGeneralSettings() {
        this.updateStatus('VALIDATE GENERAL SETTINGS', Status.VALIDATE);
        // Validate that the internet connection works.
        await validationService.validateInternetConnection();
    }

    async startSession() {
        // Initiate.
        this.updateStatus('OUTDATED PACKAGES', Status.OUTDATED);
        applicationService.applicationData.startDateTime = timeUtils.getCurrentDate();
        // Run the process - Check for outdated packages.
        await projectService.findOutdatedPackages();
        await this.exit(Status.FINISH);
    }

    async sleep() {
        await globalUtils.sleep(countLimitService.countLimitData.millisecondsTimeoutExitApplication);
    }

    // Let the user confirm all the IMPORTANT settings before the process starts.
    async confirm() {
        if (!await confirmationService.confirm(settings)) {
            await this.exit(Status.ABORT_BY_THE_USER);
        }
    }

    updateStatus(text, status) {
        logUtils.logStatus(text);
        if (applicationService.applicationData) {
            applicationService.applicationData.status = status;
        }
    }

    async exit(status) {
        if (applicationService.applicationData) {
            applicationService.applicationData.status = status;
            await this.sleep();
        }
        logUtils.logSpace();
        systemUtils.exit(status);
    }
}

module.exports = OutdatedLogic;