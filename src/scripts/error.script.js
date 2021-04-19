class ErrorScript {

    constructor() { }

    handleScriptError(error, code) {
        process.stdout.write('\n');
        console.log(error);
        process.exit(code);
    }
}

module.exports = new ErrorScript();