const { LogData } = require('../../core/models');
const { ProjectStatus } = require('../../core/enums');
const pathService = require('./path.service');
const { fileUtils, logUtils, textUtils, validationUtils } = require('../../utils');

class LogService {

	constructor() {
		this.logData = null;
		// ===PATH=== //
		this.baseSessionPath = null;
	}

	async initiate(settings) {
		this.logData = new LogData(settings);
		await this.initiateDirectories();
	}

	async initiateDirectories() {
		// ===PATH=== //
		this.baseSessionPath = pathService.pathData.distPath;
		fileUtils.createDirectory(this.baseSessionPath);
		this.distFileName = `${this.baseSessionPath}\\${this.logData.distFileName}.txt`;
		await fileUtils.removeFile(this.distFileName);
	}

	createProjectTemplate(data) {
		const { name, packagesTemplate, outdatedPackages, outdatedPackagesKeys, status, resultMessage } = data;
		const lines = [];
		const displayName = `${name} ${textUtils.addLeadingZero(outdatedPackagesKeys.length)}/${textUtils.addLeadingZero(Object.keys(packagesTemplate).length)}`;
		lines.push(textUtils.setLogStatus(displayName));
		if (status === ProjectStatus.SUCCESS && validationUtils.isExists(outdatedPackagesKeys)) {
			for (let i = 0; i < outdatedPackagesKeys.length; i++) {
				const packageName = outdatedPackagesKeys[i];
				const currentVersion = packagesTemplate[packageName];
				const newerVersion = outdatedPackages[packageName];
				lines.push(`${packageName}: ${currentVersion} => ${newerVersion}`);
			}
		}
		else {
			lines.push(`${status} | ${resultMessage}`);
		}
		lines.push('\n');
		return lines.join('\n');
	}

	// This method gets the project and prepare and log the result.
	async logProjects(projectsData) {
		if (!projectsData) {
			throw new Error('Invalid or no projectsData object was found (1000015)');
		}
		let resultLog = '';
		// Prepare the result as log template.
		for (let i = 0; i < projectsData.projectsList.length; i++) {
			resultLog += this.createProjectTemplate(projectsData.projectsList[i]);
		}
		// Log the result.
		await fileUtils.appendFile({
			targetPath: this.distFileName,
			message: resultLog
		});
	}

	logProgress(data) {
		const { name, currentNumber, totalNumber } = data;
		logUtils.logProgress({
			progressData: {
				'WORKING': `${name} ${textUtils.getNumberOfNumber({ number1: currentNumber, number2: totalNumber })}`
			},
			percentage: textUtils.calculatePercentageDisplay({
				partialValue: currentNumber,
				totalValue: totalNumber
			})
		});
	}

	createLineTemplate(title, value) {
		return textUtils.addBreakLine(`${title}: ${value}`);
	}

	createConfirmSettingsTemplate(settings) {
		const parameters = ['DIST_FILE_NAME', 'MAXIMUM_PROJECTS_COUNT', 'PROJECTS_PATH'];
		let settingsText = Object.keys(settings).filter(s => parameters.indexOf(s) > -1)
			.map(k => this.createLineTemplate(k, settings[k])).join('');
		settingsText = textUtils.removeLastCharacters({
			value: settingsText,
			charactersCount: 1
		});
		return `${textUtils.setLogStatus('IMPORTANT SETTINGS')}
${settingsText}
========================
OK to run? (y = yes)`;
	}
}

module.exports = new LogService();
/* 		let isResultMessage = false; */
/* 	//===Working: sender (1/13 | 05.50%)=== */
/* 	logProgress(currentCommentsCount) {
		logService.logProgress({
			currentNumber: currentCommentsCount,
			totalNumber: this.youtubeData.commentsCount
		});
	} */
/* 		console.log(data); */
/*
===sender (1/13)===
jsdom: ^16.5.2 => ^16.5.3
===udemy-courses (0/22)===
-All packages up to date.
===youtube-comments (0/12)===
-All packages up to date.
*/

/* 	const { id, createDateTime, status } = data;
	this.id = id;
	this.createDateTime = createDateTime;
	this.name = null;
	this.updateType = null;
	this.packagesPath = null;
	this.customPackagesPath = null;
	this.customPackagesList = null;
	this.excludePackagesList = null;
	this.isIncludeDevDependencies = null;
	this.dependencies = null;
	this.devDependencies = null;
	this.packagesTemplate = null;
	this.outdatedPackages = null;
	this.status = status;
	this.resultDateTime = null;
	this.resultMessage = null;
	this.retriesCount = 0; */

/* 		const { course, isLog } = data;
		const { id, postId, creationDateTime, pageNumber, indexPageNumber, publishDate, priceNumber, priceDisplay, courseURLCourseName,
			udemyURLCourseName, type, isFree, courseURL, udemyURL, couponKey, status, resultDateTime, resultDetails } = course;
		const time = timeUtils.getFullTime(resultDateTime);
		const displayCreationDateTime = timeUtils.getFullDateTemplate(creationDateTime);
		const displayPriceNumber = priceNumber ? priceNumber : this.emptyValue;
		const displayPriceDisplay = priceDisplay ? priceDisplay : this.emptyValue;
		const displayStatus = CourseStatusLog[status];
		const name = this.getCourseName({
			courseURLCourseName: courseURLCourseName,
			udemyURLCourseName: udemyURLCourseName,
			isLog: isLog
		});
		const displayCourseURL = textUtils.cutText({ text: courseURL, count: countLimitService.countLimitData.maximumURLCharactersDisplayCount });
		const displayUdemyURL = udemyURL ? textUtils.cutText({ text: udemyURL, count: countLimitService.countLimitData.maximumURLCharactersDisplayCount }) : this.emptyValue;
		const displayResultDetails = resultDetails.join('\n');
		const lines = [];
		lines.push(`Time: ${time} | Id: ${id} | Post Id: ${postId ? postId : this.emptyValue} | Creation Date Time: ${displayCreationDateTime}`);
		lines.push(`Publish Date: ${publishDate} | Price Number: ${displayPriceNumber} | Price Display: ${displayPriceDisplay} | Coupon Key: ${couponKey}`);
		lines.push(`Status: ${displayStatus} | Page Number: ${pageNumber} | Index Page Number: ${indexPageNumber} | Type: ${type} | Is Free: ${isFree}`);
		lines.push(`Name: ${name}`);
		lines.push(`Course URL: ${displayCourseURL}`);
		lines.push(`Udemy URL: ${displayUdemyURL}`);
		lines.push(`Result Details: ${displayResultDetails}`);
		lines.push(`${this.logSeparator}${isLog ? '\n' : ''}`);
		return lines.join('\n'); */
/*
const { CourseStatusLog, CourseStatus, Color, Method, Mode, Placeholder, StatusIcon } = require('../../core/enums');
const accountService = require('./account.service');
const applicationService = require('./application.service');
const countLimitService = require('./countLimit.service');
const courseService = require('./course.service');
const domService = require('./dom.service');
const puppeteerService = require('./puppeteer.service');
const { fileUtils, logUtils, pathUtils, textUtils, timeUtils, validationUtils } = require('../../utils');

class LogService {

	constructor() {
		this.isLogProgress = null;
		this.logData = null;
		this.logInterval = null;
		// ===PATH=== //
		this.baseSessionPath = null;
		this.sessionDirectoryPath = null;
		this.createCoursesValidPath = null;
		this.createCoursesInvalidPath = null;
		this.updateCoursesValidPath = null;
		this.updateCoursesInvalidPath = null;
		this.purchaseCoursesValidPath = null;
		this.purchaseCoursesInvalidPath = null;
		this.i = 0;
		this.frames = ['-', '\\', '|', '/'];
		this.emptyValue = '##';
		this.logSeparator = '==========';
		this.isLogs = true;
	}

	initiateDirectories() {
		if (!this.isLogs) {
			return;
		}
		// ===PATH=== //
		this.baseSessionPath = pathService.pathData.distPath;
		this.createSessionDirectory();
		if (this.logData.isLogCreateCoursesMethodValid) {
			this.createCoursesValidPath = this.createFilePath(`create_courses_method_valid_${Placeholder.DATE}`);
		}
		if (this.logData.isLogCreateCoursesMethodInvalid) {
			this.createCoursesInvalidPath = this.createFilePath(`create_courses_method_invalid_${Placeholder.DATE}`);
		}
		if (this.logData.isLogUpdateCoursesMethodValid) {
			this.updateCoursesValidPath = this.createFilePath(`update_courses_method_valid_${Placeholder.DATE}`);
		}
		if (this.logData.isLogUpdateCoursesMethodInvalid) {
			this.updateCoursesInvalidPath = this.createFilePath(`update_courses_method_invalid_${Placeholder.DATE}`);
		}
		if (this.logData.isLogPurchaseCoursesMethodValid) {
			this.purchaseCoursesValidPath = this.createFilePath(`purchase_courses_method_valid_${Placeholder.DATE}`);
		}
		if (this.logData.isLogPurchaseCoursesMethodInvalid) {
			this.purchaseCoursesInvalidPath = this.createFilePath(`purchase_courses_method_invalid_${Placeholder.DATE}`);
		}
	}

	getNextDirectoryIndex() {
		const directories = fileUtils.getAllDirectories(this.baseSessionPath);
		if (!validationUtils.isExists(directories)) {
			return 1;
		}
		return Math.max(...directories.map(name => textUtils.getSplitNumber(name))) + 1;
	}

	createSessionDirectory() {
		this.sessionDirectoryPath = pathUtils.getJoinPath({
			targetPath: this.baseSessionPath,
			targetName: `${this.getNextDirectoryIndex()}_${applicationService.applicationData.logDateTime}-${textUtils.getEmailLocalPart(accountService.accountData.email)}`
		});
		fileUtils.createDirectory(this.sessionDirectoryPath);
	}

	createFilePath(fileName) {
		return pathUtils.getJoinPath({
			targetPath: this.sessionDirectoryPath ? this.sessionDirectoryPath : pathService.pathData.distPath,
			targetName: `${fileName.replace(Placeholder.DATE, applicationService.applicationData.logDateTime)}.txt`
		});
	}

	async logCourse(course) {
		if (!this.isLogs) {
			return;
		}
		let path = null;
		let isValid = null;
		switch (applicationService.applicationData.method) {
			case Method.CREATE_COURSES:
				isValid = course.status === CourseStatus.CREATE;
				path = isValid ? (this.logData.isLogCreateCoursesMethodValid ? this.createCoursesValidPath : null) :
					(this.logData.isLogCreateCoursesMethodInvalid ? this.createCoursesInvalidPath : null);
				break;
			case Method.UPDATE_COURSES:
				isValid = course.status === CourseStatus.CREATE;
				path = isValid ? (this.logData.isLogUpdateCoursesMethodValid ? this.updateCoursesValidPath : null) :
					(this.logData.isLogUpdateCoursesMethodInvalid ? this.updateCoursesInvalidPath : null);
				break;
			case Method.PURCHASE_COURSES:
				isValid = course.status === CourseStatus.PURCHASE;
				path = isValid ? (this.logData.isLogPurchaseCoursesMethodValid ? this.purchaseCoursesValidPath : null) :
					(this.logData.isLogPurchaseCoursesMethodInvalid ? this.purchaseCoursesInvalidPath : null);
				break;
		}
		if (!path) {
			return;
		}
		// Log the course.
		const message = this.createCourseTemplate({
			course: course,
			isLog: true
		});
		await fileUtils.appendFile({
			targetPath: path,
			message: message
		});
	}

	getCourseName(data) {
		const { courseURLCourseName, udemyURLCourseName, isLog } = data;
		let name = this.emptyValue;
		if (courseURLCourseName) {
			name = courseURLCourseName;
		}
		if (name === this.emptyValue && udemyURLCourseName) {
			name = udemyURLCourseName;
		}
		return isLog ? name : textUtils.cutText({ text: name, count: countLimitService.countLimitData.maximumCourseNameCharactersDisplayCount });
	}

	createCourseTemplate(data) {
		const { course, isLog } = data;
		const { id, postId, creationDateTime, pageNumber, indexPageNumber, publishDate, priceNumber, priceDisplay, courseURLCourseName,
			udemyURLCourseName, type, isFree, courseURL, udemyURL, couponKey, status, resultDateTime, resultDetails } = course;
		const time = timeUtils.getFullTime(resultDateTime);
		const displayCreationDateTime = timeUtils.getFullDateTemplate(creationDateTime);
		const displayPriceNumber = priceNumber ? priceNumber : this.emptyValue;
		const displayPriceDisplay = priceDisplay ? priceDisplay : this.emptyValue;
		const displayStatus = CourseStatusLog[status];
		const name = this.getCourseName({
			courseURLCourseName: courseURLCourseName,
			udemyURLCourseName: udemyURLCourseName,
			isLog: isLog
		});
		const displayCourseURL = textUtils.cutText({ text: courseURL, count: countLimitService.countLimitData.maximumURLCharactersDisplayCount });
		const displayUdemyURL = udemyURL ? textUtils.cutText({ text: udemyURL, count: countLimitService.countLimitData.maximumURLCharactersDisplayCount }) : this.emptyValue;
		const displayResultDetails = resultDetails.join('\n');
		const lines = [];
		lines.push(`Time: ${time} | Id: ${id} | Post Id: ${postId ? postId : this.emptyValue} | Creation Date Time: ${displayCreationDateTime}`);
		lines.push(`Publish Date: ${publishDate} | Price Number: ${displayPriceNumber} | Price Display: ${displayPriceDisplay} | Coupon Key: ${couponKey}`);
		lines.push(`Status: ${displayStatus} | Page Number: ${pageNumber} | Index Page Number: ${indexPageNumber} | Type: ${type} | Is Free: ${isFree}`);
		lines.push(`Name: ${name}`);
		lines.push(`Course URL: ${displayCourseURL}`);
		lines.push(`Udemy URL: ${displayUdemyURL}`);
		lines.push(`Result Details: ${displayResultDetails}`);
		lines.push(`${this.logSeparator}${isLog ? '\n' : ''}`);
		return lines.join('\n');
	}

	startLogProgress() {
		// Start the process for the first interval round.
		this.logInterval = setInterval(() => {
			// Update the current time of the process.
			applicationService.applicationData.time = timeUtils.getDifferenceTimeBetweenDates({
				startDateTime: applicationService.applicationData.startDateTime,
				endDateTime: new Date()
			});
			// Log the status console each interval round.
			this.logProgress();
		}, countLimitService.countLimitData.millisecondsIntervalCount);
	}

	getCurrentIndex(isPurchase) {
		const totalCount = isPurchase ? courseService.coursesData.coursesList.length : courseService.coursesData.totalCreateCoursesCount;
		const coursePosition = textUtils.getNumberOfNumber({ number1: courseService.coursesData.courseIndex, number2: totalCount });
		const coursePercentage = textUtils.calculatePercentageDisplay({ partialValue: courseService.coursesData.courseIndex, totalValue: totalCount });
		return `${coursePosition} (${coursePercentage})`;
	}

	logProgress() {
		const specificPageNumber = applicationService.applicationData.specificCoursesPageNumber ?
			applicationService.applicationData.specificCoursesPageNumber : this.emptyValue;
		const isKeywordsFilter = validationUtils.isExists(applicationService.applicationData.keywordsFilterList);
		const time = `${applicationService.applicationData.time} [${this.frames[this.i = ++this.i % this.frames.length]}]`;
		const totalCoursesPrice = `₪${textUtils.getNumber2CharactersAfterDot(courseService.coursesData.totalCoursesPriceNumber)}`;
		const totalPurchasedPrice = `₪${textUtils.getNumber2CharactersAfterDot(courseService.coursesData.totalPurchasedPriceNumber)}`;
		let courseIndex = this.emptyValue;
		const totalSingleCount = textUtils.getNumberWithCommas(courseService.coursesData.totalSingleCount);
		const totalCourseListCount = textUtils.getNumberWithCommas(courseService.coursesData.totalCourseListCount);
		const coursesCount = `${textUtils.getNumberWithCommas(courseService.coursesData.coursesList.length)} (Single: ${totalSingleCount} / Course List: ${totalCourseListCount})`;
		switch (applicationService.applicationData.method) {
			case Method.CREATE_COURSES:
				courseIndex = courseService.coursesData.coursesList.length;
				break;
			case Method.UPDATE_COURSES:
				courseIndex = this.getCurrentIndex(false);
				break;
			case Method.PURCHASE_COURSES:
				courseIndex = this.getCurrentIndex(true);
				break;
		}
		let dates = textUtils.getNumberWithCommas(applicationService.applicationData.coursesDatesValue.length);
		const purchaseCount = `${StatusIcon.V}  ${textUtils.getNumberWithCommas(courseService.coursesData.purchaseCount)}`;
		const failCount = `${StatusIcon.X}  ${textUtils.getNumberWithCommas(courseService.coursesData.failCount)}`;
		const coursesCurrentDate = applicationService.applicationData.coursesCurrentDate ? applicationService.applicationData.coursesCurrentDate : this.emptyValue;
		let creationDateTime = this.emptyValue;
		let id = this.emptyValue;
		let postId = this.emptyValue;
		let status = this.emptyValue;
		let publishDate = this.emptyValue;
		let pageNumber = this.emptyValue;
		let indexPageNumber = this.emptyValue;
		let isFree = this.emptyValue;
		let priceDisplay = this.emptyValue;
		let couponKey = this.emptyValue;
		let type = this.emptyValue;
		let name = this.emptyValue;
		let courseURL = this.emptyValue;
		let udemyURL = this.emptyValue;
		let resultDateTime = this.emptyValue;
		let resultDetails = this.emptyValue;
		if (courseService.coursesData.course) {
			creationDateTime = timeUtils.getFullDateTemplate(courseService.coursesData.course.creationDateTime);
			id = courseService.coursesData.course.id;
			postId = courseService.coursesData.course.postId ? courseService.coursesData.course.postId : this.emptyValue;
			status = CourseStatusLog[courseService.coursesData.course.status];
			publishDate = courseService.coursesData.course.publishDate;
			pageNumber = courseService.coursesData.course.pageNumber;
			indexPageNumber = courseService.coursesData.course.indexPageNumber;
			isFree = courseService.coursesData.course.isFree !== null ? courseService.coursesData.course.isFree : this.emptyValue;
			priceDisplay = courseService.coursesData.course.priceDisplay ? courseService.coursesData.course.priceDisplay : this.emptyValue;
			couponKey = courseService.coursesData.course.couponKey ? courseService.coursesData.course.couponKey : this.emptyValue;
			type = courseService.coursesData.course.type;
			name = this.getCourseName({
				courseURLCourseName: courseService.coursesData.course.courseURLCourseName,
				udemyURLCourseName: courseService.coursesData.course.udemyURLCourseName,
				isLog: false
			});
			courseURL = textUtils.cutText({ text: courseService.coursesData.course.courseURL, count: countLimitService.countLimitData.maximumURLCharactersDisplayCount });
			udemyURL = courseService.coursesData.course.udemyURL ? textUtils.cutText({
				text: courseService.coursesData.course.udemyURL,
				count: countLimitService.countLimitData.maximumURLCharactersDisplayCount
			}) : this.emptyValue;
			resultDateTime = courseService.coursesData.course.resultDateTime ?
				timeUtils.getFullDateTemplate(courseService.coursesData.course.resultDateTime) : this.emptyValue;
			resultDetails = validationUtils.isExists(courseService.coursesData.course.resultDetails) ?
				textUtils.cutText({
					text: courseService.coursesData.course.resultDetails.join(' '),
					count: countLimitService.countLimitData.maximumResultCharactersDisplayCount
				}) : this.emptyValue;
			dates = `${textUtils.getNumberWithCommas(courseService.coursesData.course.indexDate + 1)}/${textUtils.getNumberWithCommas(applicationService.applicationData.coursesDatesValue.length)}`;
		}
		if (!this.isLogProgress) {
			return;
		}
		logUtils.logProgress({
			titlesList: ['SETTINGS', 'GENERAL1', 'GENERAL2', 'DATES', 'ACCOUNT', 'PROCESS1', 'PROCESS2',
				'PROCESS3', 'PROCESS4', 'DATA1', 'DATA2', 'DATA3', 'ERRORS', 'NAME', 'COURSE URL',
				'UDEMY URL', 'RESULT'],
			colorsTitlesList: [Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE,
			Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE, Color.BLUE,
			Color.BLUE, Color.BLUE, Color.BLUE],
			keysLists: [{
				'Environment': applicationService.applicationData.environment,
				'Method': applicationService.applicationData.method,
				'Specific Page Number': specificPageNumber,
				'Session Number': applicationService.applicationData.sessionNumber,
				'Is Keywords Filter': isKeywordsFilter
			}, {
				'Time': time,
				'Course': courseIndex,
				'Courses Count': coursesCount
			}, {
				'Total Courses Price': totalCoursesPrice,
				'Total Purchase Price': totalPurchasedPrice,
				'Pages Count': courseService.coursesData.totalPagesCount,
				'Status': applicationService.applicationData.status
			}, {
				'Type': applicationService.applicationData.coursesDatesType,
				'Value': applicationService.applicationData.coursesDatesDisplayValue,
				'Dates': dates,
				'Current Date': coursesCurrentDate
			}, {
				'Email': accountService.accountData.email,
				'Password': accountService.accountData.asterixsPassword
			}, {
				'Purchase': purchaseCount,
				'Fail': failCount,
				'Filter': courseService.coursesData.filterCount,
				'Missing Field': courseService.coursesData.missingFieldCount,
				'Unexpected Field': courseService.coursesData.unexpectedFieldCount,
				'Duplicate': courseService.coursesData.duplicateCount
			}, {
				'Create Update Error': courseService.coursesData.createUpdateErrorCount,
				'Empty URL': courseService.coursesData.emptyURLCount,
				'Invalid URL': courseService.coursesData.invalidURLCount,
				'Not Exists': courseService.coursesData.notExistsCount,
				'Page Not Found': courseService.coursesData.pageNotFoundCount,
				'Limit Access': courseService.coursesData.limitAccessCount
			}, {
				'Suggestions List': courseService.coursesData.suggestionsListCount,
				'Private': courseService.coursesData.privateCount,
				'Already Purchase': courseService.coursesData.alreadyPurchaseCount,
				'Course Price Not Free': courseService.coursesData.coursePriceNotFreeCount
			}, {
				'Enroll Not Exists': courseService.coursesData.enrollNotExistsCount,
				'Checkout Price Not Exists': courseService.coursesData.checkoutPriceNotExistsCount,
				'Checkout Price Not Free': courseService.coursesData.checkoutPriceNotFreeCount,
				'Purchase Error': courseService.coursesData.purchaseErrorCount
			}, {
				'Creation': creationDateTime,
				'Id': id,
				'Post Id': postId,
				'Status': status
			}, {
				'Publish Date': publishDate,
				'Page Number': pageNumber,
				'Index Page Number': indexPageNumber
			}, {
				'Is Free': isFree,
				'Price Display': priceDisplay,
				'Coupon Key': couponKey,
				'Type': type
			}, {
				'Create Update Error In A Row': domService.createUpdateErrorsInARowCount,
				'Purchase Error In A Row': puppeteerService.purchaseErrorInARowCount
			}, {
				'#': name
			}, {
				'#': courseURL
			}, {
				'#': udemyURL
			}, {
				'Time': resultDateTime,
				'Result': resultDetails
			}],
			colorsLists: [
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW],
				[Color.GREEN, Color.RED, Color.CYAN, Color.CYAN, Color.CYAN, Color.CYAN],
				[Color.CYAN, Color.CYAN, Color.CYAN, Color.CYAN, Color.CYAN, Color.CYAN],
				[Color.CYAN, Color.CYAN, Color.CYAN, Color.CYAN],
				[Color.CYAN, Color.CYAN, Color.CYAN, Color.CYAN],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.YELLOW, Color.YELLOW, Color.YELLOW, Color.YELLOW],
				[Color.RED, Color.RED],
				[], [], [],
				[Color.CYAN, Color.CYAN]
			],
			nonNumericKeys: { 'Id': 'Id', 'Post Id': 'Post Id' },
			statusColor: Color.CYAN
		});
	}

	close() {
		if (this.logInterval) {
			clearInterval(this.logInterval);
		}
	}

	getCourseTime(title, coursesDatesValue) {
		let value = '';
		switch (textUtils.getVariableType(coursesDatesValue)) {
			case 'string': {
				value = coursesDatesValue;
				break;
			}
			case 'array': {
				value = coursesDatesValue.slice(0, 3).join(' ');
				break;
			}
			case 'object': {
				value = `${coursesDatesValue.from} - ${coursesDatesValue.to}`;
				break;
			}
		}
		return this.createLineTemplate(title, value);
	}
}

module.exports = new LogService(); */