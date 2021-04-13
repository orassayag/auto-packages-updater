const errorScript = require('./error.script');
require('../services/files/initiate.service').initiate('outdated');
const OutdatedLogic = require('../logics/outdated.logic');

(async () => {
    await new OutdatedLogic().run();
})().catch(e => errorScript.handleScriptError(e, 1));