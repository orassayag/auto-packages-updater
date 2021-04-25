class LogDataModel {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { DIST_FILE_NAME } = settings;
		this.distFileName = DIST_FILE_NAME;
	}
}

module.exports = LogDataModel;