const enumUtils = require('../enum.utils');

const DisplayStatusEnum = enumUtils.createEnum([
  ['SCAN', 'SCAN'],
  ['UPDATE', 'UPDATE'],
  ['UPDATE_PARENT', 'UPDATE_PARENT'],
]);

const ScriptTypeEnum = enumUtils.createEnum([
  ['BACKUP', 'backup'],
  ['PACKAGES', 'packages'],
  ['TEST', 'test'],
]);

const StatusEnum = enumUtils.createEnum([
  ['INITIATE', 'INITIATE'],
  ['VALIDATE', 'VALIDATE'],
  ['OUTDATED', 'OUTDATED'],
  ['UPDATE', 'UPDATE'],
  ['UPDATE_PARENT', 'UPDATE_PARENT'],
  ['FINALIZE', 'FINALIZE'],
  ['ABORT_BY_THE_USER', 'ABORT BY THE USER'],
  ['FINISH', 'FINISH'],
]);

module.exports = { DisplayStatusEnum, ScriptTypeEnum, StatusEnum };
