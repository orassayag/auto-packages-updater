const util = require('util');
const exec = util.promisify(require('child_process').exec);
const countLimitService = require('./countLimit.service');
const globalUtils = require('../../utils/files/global.utils');
const { logUtils } = require('../../utils');

class CommandService {

  constructor() { }

  async runCommand(data) {
    const { command, path, extraData, isDelay } = data;
    if (!command) {
      throw new Error(`Invalid or no command parameter was found: Expected a number but received: ${command} (1000009)`);
    }
    let cmd = command;
    if (extraData) {
      cmd += ` ${extraData}`;
    }
    const { error /* , stdout, stderr */ } = await exec(cmd, { cwd: path });
    if (isDelay) {
      await globalUtils.sleep(countLimitService.countLimitDataModel.millisecondsTimeoutGitCommandsExecution);
    }
    if (error) {
      logUtils.log(error);
    }
    return error;
  }
}

module.exports = new CommandService();