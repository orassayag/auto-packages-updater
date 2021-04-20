const enumUtils = require('../enum.utils');

const ScriptType = enumUtils.createEnum([
    ['BACKUP', 'backup'],
    ['OUTDATED', 'outdated'],
    ['TEST', 'test']
]);

const Status = enumUtils.createEnum([
    ['INITIATE', 'INITIATE'],
    ['VALIDATE', 'VALIDATE'],
    ['OUTDATED', 'OUTDATED'],
    ['ABORT_BY_THE_USER', 'ABORT BY THE USER'],
    ['FINISH', 'FINISH']
]);

module.exports = { ScriptType, Status };