const readline = require('readline');
const logService = require('./log.service');
const { logUtils } = require('../../utils');

class ConfirmationService {
  constructor() {}

  setRawMode(value) {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(value);
    }
  }

  confirm(settings) {
    debugger;
    if (process.argv.length && process.argv[2] === 'AUTO') {
      return true;
    }
    logUtils.log(logService.createConfirmSettingsTemplate(settings));
    readline.emitKeypressEvents(process.stdin);
    this.setRawMode(true);
    return new Promise((resolve, reject) => {
      try {
        process.stdin.on('keypress', (chunk, key) => {
          if (chunk) {
          }
          resolve((key && key.name === 'y') || key.sequence === 'ט');
          this.setRawMode(false);
        });
      } catch (error) {
        this.setRawMode(false);
        reject(false);
      }
    }).catch();
  }
}

module.exports = new ConfirmationService();
