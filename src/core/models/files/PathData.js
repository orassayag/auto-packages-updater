class PathData {

	constructor(settings) {
		// Set the parameters from the settings file.
		const { PROJECTS_PATH, DIST_PATH } = settings;
		this.projectsPath = PROJECTS_PATH;
		this.distPath = DIST_PATH;
	}
}

module.exports = PathData;

/* class PackageData {

    constructor(data) {
        const { id, createDateTime, type, status } = data;
        this.id = id;
        this.createDateTime = createDateTime;
        this.name = null;
        this.currentVersion = null;
        this.newerVersion = null;
        this.type = type;
        this.status = status;
        this.resultMessage = null;
        this.resultDateTime = null;
    }
}

module.exports = PackageData;
 */
    /*
        this.updateType = null;
        this.packagesPath = null;
        this.customPackagesPath = null;
        this.excludePackagesList = null;
        this.isIncludeDevDependencies = null;
        this.packagesList = null;
        this.customPackagesList = null;
        this.status = status;
        this.resultDateTime = null;
        this.resultMessage = null;
        this.retriesCount = 0; */