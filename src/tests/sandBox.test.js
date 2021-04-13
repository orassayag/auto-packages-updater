require('../services/files/initiate.service').initiate('test');

(() => {
})();

/*
const ncu = require('npm-check-updates');

const json = JSON.stringify({
        "dependencies": {
            "ansi-escapes": "^4.3.2",
            "babel-eslint": "^10.1.0",
            "cli-cursor": "^3.1.0",
            "eslint": "^7.24.0",
            "fs-extra": "^9.1.0",
            "is-reachable": "^5.0.0",
            "jsdom": "^16.5.2",
            "lorem-ipsum": "^2.0.3",
            "npm-check-updates": "^11.4.1",
            "puppeteer": "^8.0.0",
            "puppeteer-extra": "^3.1.18",
            "puppeteer-extra-plugin-stealth": "^2.7.6",
            "random-useragent": "^0.5.0",
            "slice-ansi": "^4.0.0",
            "tree-kill": "^1.2.2",
            "wrap-ansi": "^7.0.0"
        }
    });

    const upgraded = await ncu.run({
        // Pass any cli option
        packageData: json,
        upgrade: false,
        // Defaults:
        // jsonUpgraded: true,
        // silent: true,
    });

    console.log(upgraded);

 */