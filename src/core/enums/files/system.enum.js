const enumUtils = require('../enum.utils');

const ScriptTypeEnum = enumUtils.createEnum([
    ['BACKUP', 'backup'],
    ['OUTDATED', 'outdated'],
    ['TEST', 'test']
]);

const StatusEnum = enumUtils.createEnum([
    ['INITIATE', 'INITIATE'],
    ['VALIDATE', 'VALIDATE'],
    ['OUTDATED', 'OUTDATED'],
    ['ABORT_BY_THE_USER', 'ABORT BY THE USER'],
    ['FINISH', 'FINISH']
]);

module.exports = { ScriptTypeEnum, StatusEnum };