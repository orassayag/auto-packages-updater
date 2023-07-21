class LogDataModel {
  constructor(settings) {
    // Set the parameters from the settings file.
    const { DIST_OUTDATED_FILE_NAME, DIST_UPDATED_FILE_NAME, IS_LOG_ONLY_UPDATES } = settings;
    this.distOutdatedFileName = DIST_OUTDATED_FILE_NAME;
    this.distUpdatedFileName = DIST_UPDATED_FILE_NAME;
    this.isLogOnlyUpdates = IS_LOG_ONLY_UPDATES;
  }
}

module.exports = LogDataModel;
