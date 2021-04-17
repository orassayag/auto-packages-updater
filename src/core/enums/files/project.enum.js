const enumUtils = require('../enum.utils');

const ProjectStatus = enumUtils.createEnum([
    ['CREATE', 'create'],
    ['MISSING_FIELD', 'missing field'],
    ['UPDATE', 'update'],
    ['MISSING_NAME', 'missing name'],
    ['INVALID_NAME', 'invalid name'],
    ['EMPTY_NAME', 'empty name'],
    ['MISSING_UPDATE_TYPE', 'missing update type'],
    ['INVALID_UPDATE_TYPE', 'invalid update type'],
    ['EMPTY_UPDATE_TYPE', 'empty update type'],
    ['MISMATCH_UPDATE_TYPE', 'mismatch update type'],
    ['MISSING_INCLUDE_DEV_DEPENDENCIES', 'missing include dev dependencies'],
    ['INVALID_INCLUDE_DEV_DEPENDENCIES', 'invalid include dev dependencies'],
    ['MISSING_PACKAGES_PATH', 'missing packages path'],
    ['INVALID_PACKAGES_PATH', 'invalid packages path'],
    ['EMPTY_PACKAGES_PATH', 'empty packages path'],
    ['FILE_ERROR_PACKAGES_PATH', 'file error packages path'],
    ['INVALID_STRUCTURE_PACKAGES_PATH', 'invalid structure packages path'],
    ['NO_PACKAGES_IN_PACKAGES_PATH', 'no packages in packages path'],
    ['MISSING_CUSTOM_PACKAGES_PATH', 'missing custom packages path'],
    ['INVALID_CUSTOM_PACKAGES_PATH', 'invalid custom packages path'],
    ['FILE_ERROR_CUSTOM_PACKAGES_PATH', 'file error custom packages path'],
    ['MISSING_EXCLUDE_PACKAGES_LIST', 'missing exclude packages list'],
    ['INVALID_EXCLUDE_PACKAGES_LIST', 'invalid exclude packages list'],
    ['EMPTY_EXCLUDE_PACKAGES_LIST', 'empty exclude packages list'],
    ['FAIL', 'fail'],
    ['FINISH', 'finish']
]);

const UpdateType = enumUtils.createEnum([
    ['FULL', 'full'],
    ['CUSTOM', 'custom']
]);

module.exports = { ProjectStatus, UpdateType };
/* const enumUtils = require('../enum.utils');

const PackageStatus = enumUtils.createEnum([
    ['CREATE', 'create'],
    ['EMPTY_NAME', 'empty name'],
    ['EMPTY_VERSION', 'empty version'],
    ['OUTDATE', 'outdate'],
    ['FAIL', 'fail'],
    ['UPDATE', 'update']
]);

const PackageType = enumUtils.createEnum([
    ['DEPENDENCIES', 'dependencies'],
    ['DEV_DEPENDENCIES', 'devDependencies'],
    ['CUSTOM', 'custom'],
    ['EXCLUDE', 'exclude']
]);

module.exports = { PackageStatus, PackageType }; */
/* const PackageStatus = enumUtils.createEnum([
    ['CREATE', 'create'],
    ['UPDATE', 'update'],
    ['FAIL', 'fail'],
    ['FINISH', 'finish']
]); */

/*     ['MISSING_NAME', 'missing name'],
    ['INVALID_NAME', 'invalid name'],
    ['EMPTY_NAME', 'empty name'],
    ['MISSING_UPDATE_TYPE', 'missing update type'],
    ['INVALID_UPDATE_TYPE', 'invalid update type'],
    ['EMPTY_UPDATE_TYPE', 'empty update type'],
    ['MISMATCH_UPDATE_TYPE', 'mismatch update type'],
    ['MISSING_INCLUDE_DEV_DEPENDENCIES', 'missing include dev dependencies'],
    ['INVALID_INCLUDE_DEV_DEPENDENCIES', 'invalid include dev dependencies'],
    ['MISSING_PACKAGES_PATH', 'missing packages path'],
    ['INVALID_PACKAGES_PATH', 'invalid packages path'],
    ['EMPTY_PACKAGES_PATH', 'empty packages path'],
    ['FILE_ERROR_PACKAGES_PATH', 'file error packages path'],
    ['INVALID_STRUCTURE_PACKAGES_PATH', 'invalid structure packages path'],
    ['NO_PACKAGES_IN_PACKAGES_PATH', 'no packages in packages path'],
    ['MISSING_CUSTOM_PACKAGES_PATH', 'missing custom packages path'],
    ['INVALID_CUSTOM_PACKAGES_PATH', 'invalid custom packages path'],
    ['FILE_ERROR_CUSTOM_PACKAGES_PATH', 'file error custom packages path'],
    ['MISSING_EXCLUDE_PACKAGES_LIST', 'missing exclude packages list'],
    ['INVALID_EXCLUDE_PACKAGES_LIST', 'invalid exclude packages list'],
    ['EMPTY_EXCLUDE_PACKAGES_LIST', 'empty exclude packages list'], */
/*     ['EMPTY_INCLUDE_DEV_DEPENDENCIES', 'EMPTY INCLUDE DEV DEPENDENCIES'], */
/* name: 'project-name',
'update-type': 'FULL',
'packages-path': 'C:\\package.json',
'custom-packages-path': null,
'exclude-packages-list': null,
'include-dev-dependencies': true */
/*     ['EMPTY_INCLUDE_DEV_DEPENDENCIES', 'EMPTY INCLUDE DEV DEPENDENCIES'], */
/* name: 'project-name',
'update-type': 'FULL',
'packages-path': 'C:\\package.json',
'custom-packages-path': null,
'exclude-packages-list': null,
'include-dev-dependencies': true */