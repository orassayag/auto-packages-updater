class ApplicationDataModel {

	constructor(data) {
		// Set the parameters from the settings file.
		const { settings, status } = data;
		const { GITHUB_URL, VALIDATION_CONNECTION_LINK } = settings;
		this.githubURL = GITHUB_URL;
		this.status = status;
		this.validationConnectionLink = VALIDATION_CONNECTION_LINK;
		this.startDateTime = null;
	}
}

module.exports = ApplicationDataModel;