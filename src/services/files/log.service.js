const { LogDataModel } = require('../../core/models');
const { PackageStatusEnum, ProjectStatusEnum } = require('../../core/enums');
const applicationService = require('./application.service');
const pathService = require('./path.service');
const { fileUtils, logUtils, textUtils, validationUtils } = require('../../utils');

class LogService {

	constructor() {
		this.distOutdatedFileName = null;
		this.distUpdatedFileName = null;
		this.logDataModel = null;
		// ===PATH=== //
		this.baseSessionPath = null;
	}

	async initiate(settings) {
		this.logDataModel = new LogDataModel(settings);
		await this.initiateDirectories();
	}

	async initiateDirectories() {
		// ===PATH=== //
		this.baseSessionPath = pathService.pathDataModel.distPath;
		fileUtils.createDirectory(this.baseSessionPath);
		this.distOutdatedFileName = `${this.baseSessionPath}\\${this.logDataModel.distOutdatedFileName}.txt`;
		this.distUpdatedFileName = `${this.baseSessionPath}\\${this.logDataModel.distUpdatedFileName}.txt`;
		await fileUtils.removeFile(this.distOutdatedFileName);
		await fileUtils.removeFile(this.distUpdatedFileName);
	}

	createProjectTemplate(data) {
		const { displayName, packagesTemplateKeys, outdatedPackagesKeys, packagesList, status, resultMessage } = data;
		const lines = [];
		const displayPackageName = `${displayName} ${textUtils.addLeadingZero(outdatedPackagesKeys?.length)}/${textUtils.addLeadingZero(packagesTemplateKeys?.length)}`;
		lines.push(textUtils.setLogStatus(displayPackageName));
		if (status === ProjectStatusEnum.SUCCESS && validationUtils.isExists(outdatedPackagesKeys)) {
			for (let i = 0; i < packagesList.length; i++) {
				const { logDisplay, status: packageStatus } = packagesList[i];
				lines.push(`${logDisplay} | ${packageStatus || PackageStatusEnum.SCANNED}`);
			}
		}
		else {
			lines.push(`${status} | ${resultMessage}`);
		}
		lines.push('\n');
		return lines.join('\n');
	}

	// This method gets the project and prepares and logs the result.
	async logProjects(projectsDataModel) {
		if (!projectsDataModel) {
			throw new Error('Invalid or no projectsDataModel object was found (1000017)');
		}
		// Check if to log only the project with updates.
		if (this.logDataModel.isLogOnlyUpdates) {
			projectsDataModel.projectsList = projectsDataModel.projectsList.filter(project => {
				return validationUtils.isExists(project.outdatedPackagesKeys);
			});
		}
		let resultLog = '';
		// Prepare the result as a log template.
		for (let i = 0; i < projectsDataModel.projectsList.length; i++) {
			resultLog += this.createProjectTemplate(projectsDataModel.projectsList[i]);
		}
		resultLog = textUtils.clearLastBreakLines(resultLog);
		// Log the result.
		if (resultLog) {
			await fileUtils.appendFile({
				targetPath: this.distOutdatedFileName,
				message: resultLog
			});
		}
	}

	logProgress(data) {
		const { displayName, currentNumber, totalNumber, retriesCount } = data;
		logUtils.logProgress({
			progressData: {
				[`WORKING (${applicationService.applicationDataModel.displayStatus}${retriesCount ? ` | RETRIES: ${retriesCount}` : ''})`]:
					`${displayName} ${textUtils.getNumberOfNumber({ number1: currentNumber, number2: totalNumber })}`
			},
			percentage: textUtils.calculatePercentageDisplay({
				partialValue: currentNumber,
				totalValue: totalNumber
			})
		});
	}

	createLineTemplate(title, value) {
		return textUtils.addBreakLine(`${title}: ${value}`);
	}

	createConfirmSettingsTemplate(settings) {
		const parameters = ['GITHUB_URL', 'DIST_OUTDATED_FILE_NAME', 'DIST_UPDATED_FILE_NAME', 'MAXIMUM_PROJECTS_COUNT',
			'MAXIMUM_PROJECTS_UPDATE_COUNT', 'MILLISECONDS_TIMEOUT_EXIT_APPLICATION', 'MAXIMUM_URL_VALIDATION_COUNT',
			'MILLISECONDS_TIMEOUT_URL_VALIDATION', 'MAXIMUM_RETRIES_COUNT', 'MILLISECONDS_TIMEOUT_UPDATE_PROJECT',
			'MILLISECONDS_TIMEOUT_GIT_COMMANDS_EXECUTION', 'IS_AUTO_UPDATE', 'IS_LOG_ONLY_UPDATES',
			'IS_SIMULATE_UPDATE_MODE', 'TEMPORARY_DIRECTORY_PATH'];
		let settingsText = Object.keys(settings).filter(s => parameters.indexOf(s) > -1)
			.map(k => this.createLineTemplate(k, settings[k])).join('');
		settingsText = textUtils.removeLastCharacters({
			value: settingsText,
			charactersCount: 1
		});
		return `${textUtils.setLogStatus('IMPORTANT SETTINGS')}
${settingsText}
========================
OK to run? (y = yes)`;
	}
}

module.exports = new LogService();