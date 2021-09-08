class CountLimitDataModel {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { MAXIMUM_PROJECTS_COUNT, MAXIMUM_PROJECTS_UPDATE_COUNT, MILLISECONDS_TIMEOUT_EXIT_APPLICATION,
			MAXIMUM_URL_VALIDATION_COUNT, MILLISECONDS_TIMEOUT_URL_VALIDATION, MAXIMUM_RETRIES_COUNT,
			MILLISECONDS_TIMEOUT_UPDATE_PROJECT, MILLISECONDS_TIMEOUT_GIT_COMMANDS_EXECUTION } = settings;
		this.maximumProjectsCount = MAXIMUM_PROJECTS_COUNT;
		this.maximumProjectsUpdateCount = MAXIMUM_PROJECTS_UPDATE_COUNT;
		this.millisecondsTimeoutExitApplication = MILLISECONDS_TIMEOUT_EXIT_APPLICATION;
		this.maximumURLValidationCount = MAXIMUM_URL_VALIDATION_COUNT;
		this.millisecondsTimeoutURLValidation = MILLISECONDS_TIMEOUT_URL_VALIDATION;
		this.maximumRetriesCount = MAXIMUM_RETRIES_COUNT;
		this.millisecondsTimeoutUpdateProject = MILLISECONDS_TIMEOUT_UPDATE_PROJECT;
		this.millisecondsTimeoutGitCommandsExecution = MILLISECONDS_TIMEOUT_GIT_COMMANDS_EXECUTION;
	}
}

module.exports = CountLimitDataModel;