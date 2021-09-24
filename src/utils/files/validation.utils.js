const regexUtils = require('./regex.utils');

class ValidationUtils {

    constructor() { }

    isExists(list) {
        return list && list.length > 0;
    }

    isEmpty(value) {
        return value === null || typeof value === 'undefined' || value.length === 0;
    }

    // This method validates if a given value is a valid number and returns the result.
    isValidNumber(number) {
        number = Number(number);
        return !isNaN(number) && typeof number == 'number';
    }

    isPositiveNumber(number) {
        if (!this.isValidNumber(number)) {
            return false;
        }
        return Number(number) > 0;
    }

    // This method validates that a given string exists in an array list of specific types.
    isValidEnum(data) {
        // Validate the existence and validity of the data parameters. If it does not exist, return false.
        if (!data || !data.enum || !data.value) {
            return false;
        }
        // Check if the value exists within a given array. Return false if not.
        return Object.values(data.enum).indexOf(data.value) > -1;
    }

    isValidArray(variable) {
        return Object.prototype.toString.call(variable) === '[object Array]';
    }

    isValidString(variable) {
        return typeof variable === 'string' || variable instanceof String;
    }

    // This method validates if a given variable is a valid boolean and returns the result.
    isValidBoolean(boolean) {
        return typeof boolean == typeof true;
    }

    isPropertyExists(data) {
        const { obj, fieldName } = data;
        return Object.prototype.hasOwnProperty.call(obj, fieldName);
    }

    isValidLink(link) {
        return regexUtils.validateLinkRegex.test(link);
    }
}

module.exports = new ValidationUtils();