class RegexUtils {

	constructor() {
		this.numberCommasRegex = /\B(?=(\d{3})+(?!\d))/g;
		this.clearLastBreakLines = /\n+$/;
		this.validateLinkRegex = new RegExp('^(https?:\\/\\/)?' + /* Protocol. */ '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + /* Domain name. */ '((\\d{1,3}\\.){3}\\d{1,3}))' + /* OR IP (v4) Address. */ '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + /* Port and path. */ '(\\?[;&a-z\\d%_.~+=-]*)?' + /* Query string. */ '(\\#[-a-z\\d_]*)?$', 'i'); /* Fragment locator. */
	}
}

module.exports = new RegexUtils();