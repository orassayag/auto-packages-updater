const enumUtils = require('../enum.utils');

const CommandEnum = enumUtils.createEnum([
  ['CLONE', 'git clone'],
  ['INSTALL', 'npm i'],
  ['ADD', 'git add .'],
  ['COMMIT', 'git commit -m "update packages"'],
  ['PUSH', 'git push'],
]);

module.exports = { CommandEnum };
