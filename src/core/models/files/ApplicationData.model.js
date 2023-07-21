class ApplicationDataModel {
  constructor(data) {
    // Set the parameters from the settings file.
    const { settings, status, displayStatus } = data;
    const { GITHUB_URL, IS_AUTO_UPDATE, IS_SIMULATE_UPDATE_MODE, VALIDATION_CONNECTION_LINK } =
      settings;
    this.githubURL = GITHUB_URL;
    this.isAutoUpdate = IS_AUTO_UPDATE;
    this.isSimulateUpdateMode = IS_SIMULATE_UPDATE_MODE;
    this.status = status;
    this.displayStatus = displayStatus;
    this.validationConnectionLink = VALIDATION_CONNECTION_LINK;
    this.startDateTime = null;
  }
}

module.exports = ApplicationDataModel;
