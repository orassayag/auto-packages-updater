const enumUtils = require('../enum.utils');

const ProjectStatusEnum = enumUtils.createEnum([
    ['CREATE', 'create'],
    ['MISSING_FIELD', 'missing field'],
    ['UPDATE', 'update'],
    ['MISSING_NAME', 'missing name'],
    ['INVALID_NAME', 'invalid name'],
    ['EMPTY_NAME', 'empty name'],
    ['MISSING_DISPLAY_NAME', 'missing display name'],
    ['INVALID_DISPLAY_NAME', 'invalid display name'],
    ['EMPTY_DISPLAY_NAME', 'empty display name'],
    ['MISSING_UPDATE_TYPE', 'missing update type'],
    ['INVALID_UPDATE_TYPE', 'invalid update type'],
    ['EMPTY_UPDATE_TYPE', 'empty update type'],
    ['MISMATCH_UPDATE_TYPE', 'mismatch update type'],
    ['MISSING_INCLUDE_DEV_DEPENDENCIES', 'missing include dev dependencies'],
    ['INVALID_INCLUDE_DEV_DEPENDENCIES', 'invalid include dev dependencies'],
    ['MISSING_IS_PACKAGES_UPDATE', 'missing is packages update'],
    ['INVALID_IS_PACKAGES_UPDATE', 'invalid is packages update'],
    ['MISSING_IS_GIT_UPDATE', 'missing is git update'],
    ['INVALID_IS_GIT_UPDATE', 'invalid is git update'],
    ['MISSING_PROJECT_PATH', 'missing project path'],
    ['INVALID_PROJECT_PATH', 'invalid project path'],
    ['EMPTY_PROJECT_PATH', 'empty project path'],
    ['MISSING_GIT_ROOT_PATH', 'missing git root path'],
    ['INVALID_GIT_ROOT_PATH', 'invalid git root path'],
    ['EMPTY_GIT_ROOT_PATH', 'empty git root path'],
    ['FILE_ERROR_PROJECT_PATH', 'file error project path'],
    ['INVALID_STRUCTURE_PROJECT_PATH', 'invalid structure project path'],
    ['NO_PACKAGES_IN_PROJECT_PATH', 'no packages in project path'],
    ['MISSING_CUSTOM_PACKAGES_PATH', 'missing custom packages path'],
    ['INVALID_CUSTOM_PACKAGES_PATH', 'invalid custom packages path'],
    ['FILE_ERROR_CUSTOM_PACKAGES_PATH', 'file error custom packages path'],
    ['MISSING_EXCLUDE_PACKAGES_LIST', 'missing exclude packages list'],
    ['INVALID_EXCLUDE_PACKAGES_LIST', 'invalid exclude packages list'],
    ['EMPTY_EXCLUDE_PACKAGES_LIST', 'empty exclude packages list'],
    ['NO_CUSTOM_PACKAGES', 'no custom packages'],
    ['NO_MATCH_CUSTOM_PACKAGES', 'no match custom packages'],
    ['DUPLICATE', 'duplicate'],
    ['NO_TEMPLATE_PACKAGES', 'no template packages'],
    ['FAIL', 'fail'],
    ['SUCCESS', 'success']
]);

const UpdateTypeEnum = enumUtils.createEnum([
    ['FULL', 'full'],
    ['CUSTOM', 'custom']
]);

module.exports = { ProjectStatusEnum, UpdateTypeEnum };