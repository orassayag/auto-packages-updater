const errorScript = require('./error.script');
require('../services/files/initiate.service').initiate('outdated');
const OutdatedLogic = require('../logics/outdated.logic');
try {
    new OutdatedLogic().run();
} catch (error) {
    errorScript.handleScriptError(error, 1);
}