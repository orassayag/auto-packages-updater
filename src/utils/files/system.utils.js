
class SystemUtils {

    constructor() { }
}

module.exports = new SystemUtils();
/* const kill = require('tree-kill');
const logUtils = require('./log.utils');
 */

/*     exit(exitReason, color, code) {
        logUtils.logColorStatus({
            status: `EXIT: ${exitReason}`,
            color: color
        });
        process.exit(code);
    }

    getErrorDetails(error) {
        let errorText = '';
        if (!error) {
            return errorText;
        }
        if (error.message) {
            errorText += error.message;
        }
        if (error.stack) {
            errorText += error.stack;
        }
        return errorText;
    }

    killProcess(pid) {
        if (pid) {
            kill(pid);
        }
    } */