class ProjectData {

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
        this.outdatedPackages = null;
        this.outdatedPackagesKeys = null;
        this.status = status;
        this.resultDateTime = null;
        this.resultMessage = null;
        this.retriesCount = 0;
    }
}

module.exports = ProjectData;
/*         this.packagesList = null; */
/*         this.customPackagesList = null;
 */
/* this.id = id;
this.createDateTime = createDateTime;
this.name = name;
this.updateType = updateType;
this.packagesPath = packagesPath;
this.customPackagesPath = customPackagesPath;
this.excludePackagesList = excludePackagesList;
this.isIncludeDevDependencies = isIncludeDevDependencies;
this.status = status;
this.resultMessage = null;
this.retriesCount = 0; */
/* data */
/*         const { id, createDateTime, name, updateType, packagesPath, customPackagesPath, excludePackagesList,
             isIncludeDevDependencies, status } = data; */
/* const { ProjectStatus, UpdateType } = require('../../enums'); */