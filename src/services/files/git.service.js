const { CommandEnum } = require('../../core/enums');
const applicationService = require('./application.service');
const commandService = require('./command.service');
const packageService = require('./package.service');
const pathService = require('./path.service');

class GitService {

  constructor() { }

  async getProject(name, cleanDirectory) {
    // Clean the temporary directory.
    await cleanDirectory(pathService.pathDataModel.temporaryDirectoryPath);
    // Download the repository from GitHub to the temporary directory.
    await commandService.runCommand({
      command: CommandEnum.CLONE,
      path: pathService.pathDataModel.temporaryDirectoryPath,
      extraData: `${applicationService.applicationDataModel.githubURL}/${name}`
    });
  }

  async updateProjectChanges(data) {
    const { projectDataModel, path } = data;
    // Run 'git add .', run 'git commit -m 'update packages'', and run 'git push' and wait for a successful message.
    const addError = await commandService.runCommand({
      command: CommandEnum.ADD,
      path: path,
      isDelay: true
    });
    let commitError = null;
    if (!addError) {
      commitError = await commandService.runCommand({
        command: CommandEnum.COMMIT,
        path: path,
        isDelay: true
      });
    }
    let pushError = null;
    if (!commitError) {
      pushError = await commandService.runCommand({
        command: CommandEnum.PUSH,
        path: path,
        isDelay: true
      });
    }
    // Update all packages statuses.
    projectDataModel.packagesList = packageService.updatePackagesStatus(addError || commitError || pushError, projectDataModel.packagesList);
    return projectDataModel;
  }
}

module.exports = new GitService();