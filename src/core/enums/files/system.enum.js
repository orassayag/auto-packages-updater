const enumUtils = require('../enum.utils');

const ScriptTypeEnum = enumUtils.createEnum([
    ['BACKUP', 'backup'],
    ['PACKAGES', 'packages'],
    ['TEST', 'test']
]);

const StatusEnum = enumUtils.createEnum([
    ['INITIATE', 'INITIATE'],
    ['VALIDATE', 'VALIDATE'],
    ['OUTDATED', 'OUTDATED'],
    ['UPDATE', 'UPDATE'],
    ['ABORT_BY_THE_USER', 'ABORT BY THE USER'],
    ['FINISH', 'FINISH']
]);

module.exports = { ScriptTypeEnum, StatusEnum };