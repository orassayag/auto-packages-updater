const exec = require('child_process').exec;

class CommandService {

    constructor() { }
}

module.exports = new CommandService();

/* var exec = require('child_process').exec;
exec('pwd', {
  cwd: '/home/user/directory'
}, function(error, stdout, stderr) {
  // work with result
}); */

/* var cmd =  `ls
cd foo
ls`

var exec =  require('child_process').exec;

exec(cmd, function(err, stdout, stderr) {
        console.log(stdout);
}) */