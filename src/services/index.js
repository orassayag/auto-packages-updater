const applicationService = require('./files/application.service');
const commandService = require('./files/command.service');
const confirmationService = require('./files/confirmation.service');
const countLimitService = require('./files/countLimit.service');
const fileService = require('./files/file.service');
const gitService = require('./files/git.service');
const logService = require('./files/log.service');
const packageService = require('./files/package.service');
const pathService = require('./files/path.service');
const projectService = require('./files/project.service');
const validationService = require('./files/validation.service');

module.exports = {
  applicationService,
  commandService,
  confirmationService,
  countLimitService,
  fileService,
  gitService,
  logService,
  packageService,
  pathService,
  projectService,
  validationService,
};
