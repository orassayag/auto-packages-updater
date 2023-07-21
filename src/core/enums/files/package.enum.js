const enumUtils = require('../enum.utils');

const PackageStatusEnum = enumUtils.createEnum([
  ['SCANNED', 'scanned'],
  ['UPDATED', 'updated'],
  ['GIT_PUSHED', 'git_pushed'],
  ['FAILED', 'failed'],
]);

module.exports = { PackageStatusEnum };
