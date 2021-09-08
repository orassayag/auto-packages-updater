const errorScript = require('./error.script');
require('../services/files/initiate.service').initiate('packages');
const PackagesLogic = require('../logics/packages.logic');
try {
    new PackagesLogic().run();
} catch (error) {
    errorScript.handleScriptError(error, 1);
}