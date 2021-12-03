const { pathUtils } = require('../utils');

const settings = {
    // ===GENERAL=== //
    // Determine the base URL of the GitHub repository to fetch and push all the repositories.
    GITHUB_URL: 'https://github.com/orassayag',

    // ===LOG=== //
    // Determine the name of the results of the outdated packages comments in the new TXT file in the 'dist' directory.
    DIST_OUTDATED_FILE_NAME: 'outdated',
    // Determine the name of the results of the updated packages comments in the new TXT file in the 'dist' directory.
    DIST_UPDATED_FILE_NAME: 'updated',

    // ===COUNT & LIMIT=== //
    // Determine the maximum number of projects to check for outdated packages.
    // If the limit exceeded, will take the first projects in the JSON file by the original order.
    MAXIMUM_PROJECTS_COUNT: 100,
    // Determine the maximum number of projects to auto update their outdated packages.
    // If the limit exceeded, will take the first projects in the JSON file by the original order.
    MAXIMUM_PROJECTS_UPDATE_COUNT: 100,
    // Determine the milliseconds count timeout to wait before exiting the application.
    MILLISECONDS_TIMEOUT_EXIT_APPLICATION: 1000,
    // Determine the number of retries to validate the URLs.
    MAXIMUM_URL_VALIDATION_COUNT: 5,
    // Determine the milliseconds count timeout to wait between URL validation retry.
    MILLISECONDS_TIMEOUT_URL_VALIDATION: 1000,
    // Determine the number of retries for each repository to update the packages.
    MAXIMUM_RETRIES_COUNT: 1,
    // Determine the milliseconds count timeout to wait between update projects.
    MILLISECONDS_TIMEOUT_UPDATE_PROJECT: 10000,
    // Determine the milliseconds count timeout to wait between git commands executions.
    MILLISECONDS_TIMEOUT_GIT_COMMANDS_EXECUTION: 2000,
    // Determine the number of retries to delete the temporary directory.
    MAXIMUM_DELETE_TEMPORARY_DIRECTORY_RETRIES_COUNT: 5,
    // Determine the milliseconds count timeout to wait before delete the temporary directory.
    MILLISECONDS_TIMEOUT_DELETE_TEMPORARY_DIRECTORY: 1000,

    // ===FLAG=== //
    // Determine if to enable the 'auto-update' step.
    IS_AUTO_UPDATE: true,
    // Determine if to log all the project results regardless of whether there are updates or not (=false),
    // or to log only the projects that have updates available (=true).
    IS_LOG_ONLY_UPDATES: true,
    // Determine if to simulate updates in original projects and in the Git repository (=true) or not (=false).
    IS_SIMULATE_UPDATE_MODE: false,

    // ===SOURCE=== //
    // Determine the path of the projects.json file, the file which contains all the projects
    // to check for outdated packages.
    PROJECTS_PATH: pathUtils.getJoinPath({
        targetPath: __dirname,
        targetName: '../../sources/projects.json'
    }),

    // ===ROOT PATH=== //
    // Determine the application name used for some of the calculated paths.
    APPLICATION_NAME: 'auto-packages-updater',
    // Determine the path for the outer application, where other directories are located, such as backups, sources, etc...
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\').
    OUTER_APPLICATION_PATH: pathUtils.getJoinPath({
        targetPath: __dirname,
        targetName: '../../../'
    }),
    // Determine the inner application path where all the source of the application is located.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\auto-packages-updater\\').
    INNER_APPLICATION_PATH: pathUtils.getJoinPath({
        targetPath: __dirname,
        targetName: '../../'
    }),

    // ===DYNAMIC PATH=== //
    // All these paths will be calculated during runtime in the initial service.
    // DON'T REMOVE THE KEYS, THEY WILL BE CALCULATED TO PATHS DURING RUNTIME.
    // Determine the application path where all the source of the application is located.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\auto-packages-updater').
    APPLICATION_PATH: 'auto-packages-updater',
    // Determine the backups directory which all the local backups will be created to.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\backups').
    BACKUPS_PATH: 'backups',
    // Determine the dist directory path which there, all the outcome of the logs will be created.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\auto-packages-updater\\dist').
    DIST_PATH: 'dist',
    // Determine the directory path of the node_modules.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\auto-packages-updater\\node_modules').
    NODE_MODULES_PATH: 'node_modules',
    // Determine the directory of the package.json.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\auto-packages-updater\\package.json').
    PACKAGE_JSON_PATH: 'package.json',
    // Determine the path of the package-lock.json.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\auto-packages-updater\\package-lock.json').
    PACKAGE_LOCK_JSON_PATH: 'package-lock.json',
    // Determine the path of the temporary directory where the repository will be downloaded
    // and will be updated and pushed back to the git repository.
    TEMPORARY_DIRECTORY_PATH: 'temp',

    // ===BACKUP=== //
    // Determine the directories to ignore when a backup copy is taking place.
    // For example: 'dist'.
    IGNORE_DIRECTORIES: ['.git', 'dist', 'node_modules', 'sources'],
    // Determine the files to ignore when the back copy is taking place.
    // For example: 'back_sources_tasks.txt'.
    IGNORE_FILES: [],
    // Determine the files to force include when the back copy is taking place.
    // For example: '.gitignore'.
    INCLUDE_FILES: ['.gitignore'],
    // Determine the period of time in milliseconds to
    // check that files were created / moved to the target path.
    MILLISECONDS_DELAY_VERIFY_BACKUP_COUNT: 1000,
    // Determine the number of times in loop to check for version of a backup.
    // For example, if a backup name 'test-test-test-1' exists, it will check for 'test-test-test-2',
    // and so on, until the current maximum number.
    BACKUP_MAXIMUM_DIRECTORY_VERSIONS_COUNT: 50,

    // ===VALIDATION=== //
    // Determine the link address to test the internet connection.
    VALIDATION_CONNECTION_LINK: 'google.com'
};

module.exports = settings;