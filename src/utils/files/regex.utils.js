/* eslint-disable no-control-regex */
class RegexUtils {

	constructor() {
		this.numberCommasRegex = /\B(?=(\d{3})+(?!\d))/g;
	}
}

module.exports = new RegexUtils();