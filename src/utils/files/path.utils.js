const path = require('path');

class PathUtils {

    constructor() { }

    getJoinPath(data) {
        const { targetPath, targetName } = data;
        // Check if the targetPath parameter was received.
        if (!targetPath) {
            throw new Error(`targetPath not received: ${targetPath} (1000033)`);
        }
        // Check if the fileName parameter was received.
        if (!targetName) {
            throw new Error(`targetName not received: ${targetName} (1000034)`);
        }
        return path.join(targetPath, targetName);
    }

    getBasename(source) {
        return path.basename(source);
    }
}

module.exports = new PathUtils();
/*

getDirName(targetPath) {
    return path.dirname(targetPath);
}

getExtension(targetPath) {
    return path.extname(targetPath);
} */