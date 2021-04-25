class ApplicationDataModel {

	constructor(data) {
		// Set the parameters from the settings file.
		const { settings, status } = data;
		const { VALIDATION_CONNECTION_LINK } = settings;
		this.status = status;
		this.validationConnectionLink = VALIDATION_CONNECTION_LINK;
		this.startDateTime = null;
	}
}

module.exports = ApplicationDataModel;