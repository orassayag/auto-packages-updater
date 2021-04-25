class PathDataModel {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { PROJECTS_PATH, DIST_PATH } = settings;
		this.projectsPath = PROJECTS_PATH;
		this.distPath = DIST_PATH;
	}
}

module.exports = PathDataModel;