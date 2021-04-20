class CountLimitData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { MAXIMUM_PROJECTS_COUNT, MILLISECONDS_TIMEOUT_EXIT_APPLICATION, MAXIMUM_URL_VALIDATION_COUNT,
			MILLISECONDS_TIMEOUT_URL_VALIDATION } = settings;
		this.maximumProjectsCount = MAXIMUM_PROJECTS_COUNT;
		this.millisecondsTimeoutExitApplication = MILLISECONDS_TIMEOUT_EXIT_APPLICATION;
		this.maximumURLValidationCount = MAXIMUM_URL_VALIDATION_COUNT;
		this.millisecondsTimeoutURLValidation = MILLISECONDS_TIMEOUT_URL_VALIDATION;
	}
}

module.exports = CountLimitData;