const settings = require('../../settings/settings');
const { ScriptTypeEnum } = require('../../core/enums');
const globalUtils = require('../../utils/files/global.utils');
const { fileUtils, pathUtils, validationUtils } = require('../../utils');

class InitiateService {

	constructor() {
		this.scriptType = null;
	}

	initiate(scriptType) {
		// First, setup handles errors and promises.
		this.setup();
		// Validate the script type.
		this.scriptType = scriptType;
		this.validateScriptType();
		// The second important thing to do is to validate all the parameters of the settings.js file.
		this.validateSettings();
		// The next thing is to calculate paths and inject back to the settings.js file.
		this.calculateSettings();
		// Make sure that the dist directory exists. If not, create it.
		this.validateDirectories();
		// Validate that certain directories exist, and if not, create them.
		this.createDirectories();
	}

	setup() {
		// Handle any uncaughtException error.
		process.on('uncaughtException', (error) => {
			process.stdout.write('\n\r');
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			console.log(error);
		});
		// Handle any unhandledRejection promise error.
		process.on('unhandledRejection', (reason, promise) => {
			process.stdout.write('\n\r');
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			console.log(reason);
			console.log(promise);
		});
		// Handle ctrl+v keys.
		process.on('SIGINT', () => {
			process.stdout.write('\n\r');
			process.exit(0);
		});
	}

	validateScriptType() {
		if (!this.scriptType || !validationUtils.isValidEnum({
			enum: ScriptTypeEnum,
			value: this.scriptType
		})) {
			throw new Error('Invalid or no ScriptTypeEnum parameter was found (1000007)');
		}
	}

	validateSettings() {
		// Validate the settings object existence.
		if (!settings) {
			throw new Error('Invalid or no settings object was found (1000008)');
		}
		this.validatePositiveNumbers();
		this.validateStrings();
		this.validateBooleans();
		this.validateArrays();
		this.validateSpecial();
	}

	calculateSettings() {
		const { OUTER_APPLICATION_PATH, INNER_APPLICATION_PATH, APPLICATION_PATH, BACKUPS_PATH,
			DIST_PATH, NODE_MODULES_PATH, PACKAGE_JSON_PATH, PACKAGE_LOCK_JSON_PATH,
			TEMPORARY_DIRECTORY_PATH } = settings;
		// ===DYNAMIC PATH=== //
		settings.APPLICATION_PATH = pathUtils.getJoinPath({ targetPath: OUTER_APPLICATION_PATH, targetName: APPLICATION_PATH });
		if (this.scriptType === ScriptTypeEnum.BACKUP) {
			settings.BACKUPS_PATH = pathUtils.getJoinPath({ targetPath: OUTER_APPLICATION_PATH, targetName: BACKUPS_PATH });
		}
		settings.DIST_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: DIST_PATH });
		settings.NODE_MODULES_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: NODE_MODULES_PATH });
		settings.PACKAGE_JSON_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: PACKAGE_JSON_PATH });
		settings.PACKAGE_LOCK_JSON_PATH = pathUtils.getJoinPath({ targetPath: INNER_APPLICATION_PATH, targetName: PACKAGE_LOCK_JSON_PATH });
		settings.TEMPORARY_DIRECTORY_PATH = pathUtils.getJoinPath({ targetPath: settings.DIST_PATH, targetName: TEMPORARY_DIRECTORY_PATH });
	}

	validatePositiveNumbers() {
		[
			// ===COUNT & LIMIT=== //
			'MAXIMUM_PROJECTS_COUNT', 'MAXIMUM_PROJECTS_UPDATE_COUNT', 'MILLISECONDS_TIMEOUT_EXIT_APPLICATION',
			'MAXIMUM_URL_VALIDATION_COUNT', 'MILLISECONDS_TIMEOUT_URL_VALIDATION', 'MAXIMUM_RETRIES_COUNT',
			'MILLISECONDS_TIMEOUT_UPDATE_PROJECT', 'MILLISECONDS_TIMEOUT_GIT_COMMANDS_EXECUTION',
			'MAXIMUM_DELETE_TEMPORARY_DIRECTORY_RETRIES_COUNT',
			'MILLISECONDS_TIMEOUT_DELETE_TEMPORARY_DIRECTORY',
			// ===BACKUP=== //
			'MILLISECONDS_DELAY_VERIFY_BACKUP_COUNT', 'BACKUP_MAXIMUM_DIRECTORY_VERSIONS_COUNT'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isPositiveNumber(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Expected a number but received: ${value} (1000009)`);
			}
		});
	}

	validateStrings() {
		const keys = this.scriptType === ScriptTypeEnum.BACKUP ? ['BACKUPS_PATH'] : [];
		[
			...keys,
			// ===GENERAL=== //
			'GITHUB_URL',
			// ===LOG=== //
			'DIST_OUTDATED_FILE_NAME', 'DIST_UPDATED_FILE_NAME',
			// ===SOURCE=== //
			'PROJECTS_PATH',
			// ===ROOT PATH=== //
			'APPLICATION_NAME', 'OUTER_APPLICATION_PATH', 'INNER_APPLICATION_PATH',
			// ===DYNAMIC PATH=== //
			'APPLICATION_PATH', 'DIST_PATH', 'NODE_MODULES_PATH', 'PACKAGE_JSON_PATH',
			'PACKAGE_LOCK_JSON_PATH', 'TEMPORARY_DIRECTORY_PATH',
			// ===VALIDATION=== ///
			'VALIDATION_CONNECTION_LINK'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isExists(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Expected a string but received: ${value} (1000010)`);
			}
		});
	}

	validateBooleans() {
		[
			// ===FLAG=== //
			'IS_AUTO_UPDATE', 'IS_LOG_ONLY_UPDATES', 'IS_SIMULATE_UPDATE_MODE'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isValidBoolean(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Expected a boolean but received: ${value} (1000011)`);
			}
		});
	}

	validateArrays() {
		[
			// ===BACKUP=== //
			'IGNORE_DIRECTORIES', 'IGNORE_FILES', 'INCLUDE_FILES'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isValidArray(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Expected a array but received: ${value} (1000012)`);
			}
		});
	}

	validateSpecial() {
		const { PROJECTS_PATH } = settings;
		this.validateDirectory(PROJECTS_PATH);
		// ===SOURCE=== //
		if (!fileUtils.isFilePath(PROJECTS_PATH)) {
			throw new Error(`The path PROJECTS_PATH parameter needs to be a file path but it's a directory path: ${PROJECTS_PATH} (1000013)`);
		}
		[
			// ===GENERAL=== //
			// ===VALIDATION=== //
			'GITHUB_URL', 'VALIDATION_CONNECTION_LINK'
		].map(key => {
			const value = settings[key];
			if (!validationUtils.isValidLink(value)) {
				throw new Error(`Invalid or no ${key} parameter was found: Expected a valid URL but received: ${value} (1000012)`);
			}
		});
	}

	validateDirectory(directory) {
		// Verify that the dist and the sources paths exist.
		globalUtils.isPathExistsError(directory);
		// Verify that the dist and the sources paths are accessible.
		globalUtils.isPathAccessible(directory);
	}

	validateDirectories() {
		const keys = this.scriptType === ScriptTypeEnum.BACKUP ? ['BACKUPS_PATH'] : [];
		[
			...keys,
			// ===SOURCE=== //
			'PROJECTS_PATH',
			// ===ROOT PATH=== //
			'OUTER_APPLICATION_PATH', 'INNER_APPLICATION_PATH',
			// ===DYNAMIC PATH=== //
			'APPLICATION_PATH', 'PACKAGE_JSON_PATH'
		].map(key => {
			const value = settings[key];
			this.validateDirectory(value);
		});
		[
			...keys,
			// ===ROOT PATH=== //
			'OUTER_APPLICATION_PATH', 'INNER_APPLICATION_PATH'
		].map(key => {
			const value = settings[key];
			// Verify that the paths are of directory and not a file.
			if (!fileUtils.isDirectoryPath(value)) {
				throw new Error(`The parameter path ${key} marked as directory but it's a path of a file: ${value} (1000014)`);
			}
		});
	}

	createDirectories() {
		[
			// ===DYNAMIC PATH=== //
			'DIST_PATH', 'NODE_MODULES_PATH'
		].map(key => {
			const value = settings[key];
			// Make sure that the dist directory exists, if not, create it.
			fileUtils.createDirectory(value);
		});
	}
}

module.exports = new InitiateService();