const textUtils = require('./text.utils');

class TimeUtils {

    constructor() { }

    getCurrentDate() {
        return new Date();
    }

    getDateNoSpaces() {
        const date = new Date();
        return [this.getDay(date), this.getMonth(date), this.getYear(date)].join('');
    }

    getDay(date) {
        return textUtils.addLeadingZero(date.getDate());
    }

    getMonth(date) {
        return textUtils.addLeadingZero(date.getMonth() + 1);
    }

    getYear(date) {
        return date.getFullYear();
    }
}

module.exports = new TimeUtils();