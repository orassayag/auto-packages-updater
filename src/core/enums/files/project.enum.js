const enumUtils = require('../enum.utils');

const ProjectStatus = enumUtils.createEnum([
    ['CREATE', 'create'],
    ['UPDATE', 'update'],
    ['MISSING_NAME', 'MISSING NAME'],
    ['INVALID_NAME', 'INVALID NAME'],
    ['EMPTY_NAME', 'EMPTY NAME'],
    ['MISSING_UPDATE_TYPE', 'MISSING UPDATE TYPE'],
    ['INVALID_UPDATE_TYPE', 'INVALID UPDATE TYPE'],
    ['EMPTY_UPDATE_TYPE', 'EMPTY UPDATE TYPE'],
    ['MISMATCH_UPDATE_TYPE', 'MISMATCH UPDATE TYPE'],
    ['MISSING_INCLUDE_DEV_DEPENDENCIES', 'MISSING INCLUDE DEV DEPENDENCIES'],
    ['INVALID_INCLUDE_DEV_DEPENDENCIES', 'INVALID INCLUDE DEV DEPENDENCIES'],
    ['EMPTY_INCLUDE_DEV_DEPENDENCIES', 'EMPTY INCLUDE DEV DEPENDENCIES'],
    ['MISSING_PACKAGES_PATH', 'MISSING PACKAGES PATH'],
    ['INVALID_PACKAGES_PATH', 'INVALID PACKAGES PATH'],
    ['EMPTY_PACKAGES_PATH', 'EMPTY PACKAGES PATH'],
    ['FILE_ERROR_PACKAGES_PATH', 'FILE ERROR PACKAGES PATH'],
    ['INVALID_STRUCTURE_PACKAGES_PATH', 'INVALID STRUCTURE PACKAGES PATH'],
    ['NO_PACKAGES_IN_PACKAGES_PATH', 'NO PACKAGES IN PACKAGES PATH'],
    ['MISSING_CUSTOM_PACKAGES_PATH', 'MISSING CUSTOM PACKAGES PATH'],
    ['INVALID_CUSTOM_PACKAGES_PATH', 'INVALID CUSTOM PACKAGES PATH'],
    ['MISSING_EXCLUDE_PACKAGES_LIST', 'MISSING EXCLUDE PACKAGES LIST'],
    ['INVALID_EXCLUDE_PACKAGES_LIST', 'INVALID EXCLUDE PACKAGES LIST'],
    ['FAIL', 'fail'],
    ['FINISH', 'finish']
]);

const UpdateType = enumUtils.createEnum([
    ['FULL', 'full'],
    ['CUSTOM', 'custom']
]);

module.exports = { ProjectStatus, UpdateType };
/* name: 'project-name',
'update-type': 'FULL',
'packages-path': 'C:\\package.json',
'custom-packages-path': null,
'exclude-packages-list': null,
'include-dev-dependencies': true */