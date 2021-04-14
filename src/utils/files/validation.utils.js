class ValidationUtils {

    constructor() { }

    isExists(list) {
        return list && list.length > 0;
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
        // Validate the existence and validity of the data parameters. If not exists, return false.
        if (!data || !data.enum || !data.value) {
            return false;
        }
        // Check if the value exists within a given array. Return false if not.
        return Object.values(data.enum).indexOf(data.value) > -1;
    }

    isValidArray(variable) {
        return Object.prototype.toString.call(variable) === '[object Array]';
    }
}

module.exports = new ValidationUtils();
/*
    // This method validates if a given variable is a valid boolean and returns the result.
    isValidBoolean(boolean) {
        return typeof boolean == typeof true;
    }

    isValidURL(url) {
        return regexUtils.validateURLRegex.test(url);
    }

    isValidDate(dateTime) {
        return dateTime instanceof Date;
    }

    isValidDateFormat(date) {
        try {
            const parts = date.split('/');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            // Check the ranges of month and year.
            if (year < 1000 || year > 3000 || month == 0 || month > 12) {
                return false;
            }
            const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            // Adjust for leap years.
            if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
                monthLength[1] = 29;
            }
            // Check the range of the day.
            return day > 0 && day <= monthLength[month - 1];
        }
        catch {
            return false;
        }
    }

    isValidEmailAddress(emailAddress) {
        return regexUtils.validateEmailAddressRegex.test(emailAddress);
    }

    isPropertyExists(obj, fieldName) {
        return Object.prototype.hasOwnProperty.call(obj, fieldName);
    } */

/* const regexUtils = require('./regex.utils'); */