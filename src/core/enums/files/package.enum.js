const enumUtils = require('../enum.utils');

const PackageStatusEnum = enumUtils.createEnum([
    ['UPDATED', 'updated'],
    ['GIT_PUSHED', 'git_pushed'],
    ['FAILED', 'failed']
]);

module.exports = { PackageStatusEnum };