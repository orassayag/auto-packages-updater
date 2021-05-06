/* eslint-disable no-control-regex */
class RegexUtils {

	constructor() {
		this.numberCommasRegex = /\B(?=(\d{3})+(?!\d))/g;
		this.clearLastBreakLines = /\n+$/;
	}
}

module.exports = new RegexUtils();