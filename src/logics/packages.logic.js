const settings = require('../settings/settings');
const { DisplayStatusEnum, StatusEnum } = require('../core/enums');
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
        this.updateStatus('OUTDATED PACKAGES', StatusEnum.OUTDATED, DisplayStatusEnum.SCAN, false);
        applicationService.applicationDataModel.startDateTime = timeUtils.getCurrentDate();
        // Run the process - Check for outdated packages.
        await projectService.findOutdatedPackages();
        if (applicationService.applicationDataModel.isAutoUpdate && projectService.getProjectsUpdateAvailableCount()) {
            // Run the process - Update outdated packages.
            this.updateStatus('UPDATE PACKAGES', StatusEnum.UPDATE, DisplayStatusEnum.UPDATE, true);
            await projectService.findUpdatePackages();
            // Update projects with parent repository.
            this.updateStatus('UPDATE PARENT PACKAGES', StatusEnum.UPDATE_PARENT, DisplayStatusEnum.UPDATE_PARENT, true);
            await projectService.updateParentGitRepository();
            // Remove the temporary directory.
            this.updateStatus('FINALIZE', StatusEnum.FINALIZE, DisplayStatusEnum.FINALIZE, false);
            await projectService.removeTemporaryDirectory();
        }
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

    updateStatus(text, status, displayStatus, isBeforeBreakLine) {
        if (isBeforeBreakLine) {
            logUtils.logSpace();
        }
        logUtils.logStatus(text);
        if (applicationService.applicationDataModel) {
            if (status) {
                applicationService.applicationDataModel.status = status;
            }
            if (displayStatus) {
                applicationService.applicationDataModel.displayStatus = displayStatus;
            }
        }
    }

    async exit(status) {
        if (applicationService.applicationDataModel) {
            if (status) {
                applicationService.applicationDataModel.status = status;
            }
            await this.sleep();
        }
        systemUtils.exit(status);
    }
}

module.exports = PackagesLogic;