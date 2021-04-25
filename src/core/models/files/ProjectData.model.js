class ProjectDataModel {

    constructor(data) {
        const { id, createDateTime, status } = data;
        this.id = id;
        this.createDateTime = createDateTime;
        this.name = null;
        this.updateType = null;
        this.packagesPath = null;
        this.customPackagesPath = null;
        this.customPackagesList = null;
        this.excludePackagesList = null;
        this.isIncludeDevDependencies = null;
        this.dependencies = null;
        this.devDependencies = null;
        this.packagesTemplate = null;
        this.packagesTemplateKeys = null;
        this.outdatedPackages = null;
        this.outdatedPackagesKeys = null;
        this.status = status;
        this.resultDateTime = null;
        this.resultMessage = null;
        this.retriesCount = 0;
    }
}

module.exports = ProjectDataModel;