const { LogDataModel } = require('../../core/models');
const { ProjectStatusEnum } = require('../../core/enums');
const pathService = require('./path.service');
const { fileUtils, logUtils, textUtils, validationUtils } = require('../../utils');

class LogService {

	constructor() {
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
		this.distFileName = `${this.baseSessionPath}\\${this.logDataModel.distFileName}.txt`;
		await fileUtils.removeFile(this.distFileName);
	}

	createProjectTemplate(data) {
		const { name, packagesTemplate, packagesTemplateKeys, outdatedPackages, outdatedPackagesKeys, status, resultMessage } = data;
		const lines = [];
		const displayName = `${name} ${textUtils.addLeadingZero(outdatedPackagesKeys?.length)}/${textUtils.addLeadingZero(packagesTemplateKeys?.length)}`;
		lines.push(textUtils.setLogStatus(displayName));
		if (status === ProjectStatusEnum.SUCCESS && validationUtils.isExists(outdatedPackagesKeys)) {
			for (let i = 0; i < outdatedPackagesKeys.length; i++) {
				const packageName = outdatedPackagesKeys[i];
				const currentVersion = packagesTemplate[packageName];
				const newerVersion = outdatedPackages[packageName];
				lines.push(`${packageName}: ${currentVersion} => ${newerVersion}`);
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
			throw new Error('Invalid or no projectsDataModel object was found (1000014)');
		}
		let resultLog = '';
		// Prepare the result as a log template.
		for (let i = 0; i < projectsDataModel.projectsList.length; i++) {
			resultLog += this.createProjectTemplate(projectsDataModel.projectsList[i]);
		}
		resultLog = textUtils.clearLastBreakLines(resultLog);
		// Log the result.
		await fileUtils.appendFile({
			targetPath: this.distFileName,
			message: resultLog
		});
	}

	logProgress(data) {
		const { name, currentNumber, totalNumber } = data;
		logUtils.logProgress({
			progressData: {
				'WORKING': `${name} ${textUtils.getNumberOfNumber({ number1: currentNumber, number2: totalNumber })}`
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
		const parameters = ['DIST_FILE_NAME', 'MAXIMUM_PROJECTS_COUNT', 'PROJECTS_PATH'];
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