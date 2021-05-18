class LogDataModel {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { DIST_FILE_NAME,IS_LOG_ONLY_UPDATES } = settings;
		this.distFileName = DIST_FILE_NAME;
		this.isLogOnlyUpdates = IS_LOG_ONLY_UPDATES;
	}
}

module.exports = LogDataModel;