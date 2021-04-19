const textUtils = require('./text.utils');
const validationUtils = require('./validation.utils');

class LogUtils {

    constructor() { }

    log(message) {
        console.log(message);
    }

    logStatus(status) {
        if (!status) {
            return '';
        }
        this.log(textUtils.setLogStatus(status));
    }

    logProgress(data) {
        const { progressData, percentage } = data;
        const keys = Object.keys(progressData);
        let result = '';
        for (let i = 0, length = keys.length; i < length; i++) {
            const value = progressData[keys[i]];
            const displayValue = validationUtils.isValidNumber(value) ? textUtils.getNumberWithCommas(value) : value;
            result += `${keys[i]}: ${displayValue} | `;
        }
        result += percentage ? `${percentage} | ` : '';
        result = textUtils.removeLastCharacters({
            value: result,
            charactersCount: 3
        });
        process.stdout.write(`\r${textUtils.setLogStatus(result)}`);
    }

    logSpace() {
        process.stdout.write('\n\r');
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }
}

module.exports = new LogUtils();
/* const logUpdate = require('../../log-update');
const { Color } = require('../../core/enums');
const colorUtils = require('./color.utils'); */

/*

    logColor(message, color) {
        return colorUtils.createColorMessage({
            message: message,
            color: color
        });
    }

    logMagentaStatus(text) {
        if (!text) {
            return '';
        }
        return this.logColorStatus({
            status: text,
            color: Color.MAGENTA
        });
    }

    logProgress(data) {
        const { titlesList, colorsTitlesList, keysLists, colorsLists, nonNumericKeys, statusColor } = data;
        let results = '';
        for (let i = 0, lengthX = keysLists.length; i < lengthX; i++) {
            let result = '';
            // Group title.
            const title = `[${titlesList[i]}] `;
            const keyTitle = colorUtils.createColorMessage({
                message: title,
                color: colorsTitlesList[i]
            });
            result += keyTitle;
            // Group keys.
            const keysList = keysLists[i];
            const colorsList = colorsLists[i];
            const keys = Object.keys(keysList);
            for (let y = 0, lengthY = keys.length; y < lengthY; y++) {
                const color = colorsList ? colorsList[y] : null;
                let keyParameter = keys[y];
                const isNonNumberic = nonNumericKeys[keyParameter];
                if (color) {
                    keyParameter = colorUtils.createColorMessage({
                        message: keys[y],
                        color: color
                    });
                }
                const value = keysList[keys[y]];
                const displayValue = value && !isNonNumberic && validationUtils.isValidNumber(value) ? textUtils.getNumberWithCommas(value) : value;
                const message = `${keyParameter === '#' ? '' : `${keyParameter}: `}${displayValue} | `;
                result += message;
            }
            result = textUtils.removeLastCharacters({
                value: result,
                charactersCount: 3
            });
            results += textUtils.setLogStatusColored(result, statusColor);
            if (i < (lengthX - 1)) {
                results += '\n';
            }
        }
        logUpdate(results);
    } */