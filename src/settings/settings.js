const { pathUtils } = require('../utils');

const settings = {
    // ===LOG=== //
    // Determine the name of the resulting comments in the new TXT file in the 'dist' directory.
    DIST_FILE_NAME: 'outdated',

    // ===COUNT & LIMIT=== //
    // Determine the maximum number of projects to check for outdated packages.
    // If the limit exceeded, will take the first projects in the JSON file by the original order.
    MAXIMUM_PROJECTS_COUNT: 100,
    // Determine the milliseconds count timeout to wait before exiting the application.
    MILLISECONDS_TIMEOUT_EXIT_APPLICATION: 1000,
    // Determine the number of retries to validate the URLs.
    MAXIMUM_URL_VALIDATION_COUNT: 5,
    // Determine the milliseconds count timeout to wait between URL validation retry.
    MILLISECONDS_TIMEOUT_URL_VALIDATION: 1000,

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
    // Determine the path for the outer application, where other directories located, such as backups, sources, etc...
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
    // Determine the backups directory which all the local backup will be created to.
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
    // ===GENERAL=== //
/*     // Determine the maximum characters count of the package name.
    MAXIMUM_PACKAGE_NAME_CHARACTERS_COUNT: 300,
    // Determine the maximum characters count of the package version.
    MAXIMUM_PACKAGE_VERSION_CHARACTERS_COUNT: 300, */
/*     // Determine if to auto update the package.json / package-lock.json files in each project.
    IS_AUTO_UPDATE: false, */

/* const { Mode } = require('../core/enums');
const { courseUtils, pathUtils } = require('../utils');

const innerSettings = {
    // ===FLAG=== //
    // Determine if to run for a long time. Settings this to true, will set automatically
    // the COURSES_DATES_VALUE to the current date subtract one day.
    IS_LONG_RUN: false
};

const settings = {
    // ===GENERAL=== //
    // Determine the mode of the application. STANDARD/SESSION/SILENT.
    MODE: Mode.STANDARD,
    // Determine the URL of the courses to get the courses URLs from.
    COURSES_BASE_URL: 'https://www.idownloadcoupon.com',
    // Determine the URL of Udemy site to purchase the courses by the URLs.
    UDEMY_BASE_URL: 'https://www.udemy.com',
    // Determine if the init of the link to the single course on Udemy.
    SINGLE_COURSE_INIT: 'https://click.linksynergy.com/deeplink?',
    // Determine the courses date value. The options are: single date, array of dates,
    // or range of dates, and the daily limit will be on each date.
    // SINGLE - Single date to scan, the default is the current date. If not, use 'yyyy/mm/dd' format. Example: '2020/12/13'.
    // ARRAY - List of dates to scan. Example: ['2020/12/13', '2020/12/14'].
    // RANGE - Range of dates to scan. Example: { from: '2020/12/13', to: '2020/12/14' }.
    // If empty/null/undefined - Will get the current date automatically.
    COURSES_DATES_VALUE: innerSettings.IS_LONG_RUN ? courseUtils.getLongRunTime() :
        courseUtils.getCourseTime({ from: '2021/04/08', to: '2021/04/11' }),
    // Determine the specific courses page (in the pagination) to crawl. If null,
    // will scan all the courses pages until reaching the maximum number (MAXIMUM_PAGES_NUMBER).
    SPECIFIC_COURSES_PAGE_NUMBER: null,
    // Determine which courses to purchase that contain the specific keywords.
    // If empty, will purchase all courses available.
    KEYWORDS_FILTER_LIST: [],

    // ===FLAG=== //
    // Determine if to load Udemy account of development (=false) or production (=true).
    IS_PRODUCTION_ENVIRONMENT: true,
    // Determine if to perform the create courses method.
    IS_CREATE_COURSES_METHOD_ACTIVE: true,
    // Determine if to perform the update courses method.
    IS_UPDATE_COURSES_METHOD_ACTIVE: true,
    // Determine if to perform the purchase courses method.
    IS_PURCHASE_COURSES_METHOD_ACTIVE: true,

    // ===LOG=== //
    // Determine if to log the create valid courses (create courses method).
    IS_LOG_CREATE_COURSES_METHOD_VALID: true,
    // Determine if to log the create invalid courses (create courses method).
    IS_LOG_CREATE_COURSES_METHOD_INVALID: true,
    // Determine if to log the update valid courses (update courses method).
    IS_LOG_UPDATE_COURSES_METHOD_VALID: true,
    // Determine if to log the update invalid courses (update courses method).
    IS_LOG_UPDATE_COURSES_METHOD_INVALID: true,
    // Determine if to log the purchase valid courses (purchase courses method).
    IS_LOG_PURCHASE_COURSES_METHOD_VALID: true,
    // Determine if to log the purchase invalid courses (purchase courses method).
    IS_LOG_PURCHASE_COURSES_METHOD_INVALID: true,

    // ===COUNT & LIMIT=== //
    // Determine the maximum courses count to purchase per date.
    MAXIMUM_COURSES_PURCHASE_COUNT: 3000,
    // Determine the milliseconds count timeout to wait for an answer to get to the page or engine source.
    MILLISECONDS_TIMEOUT_SOURCE_REQUEST_COUNT: 60000,
    // Determine the maximum number of pagination for courses on the main page of the courses URL.
    MAXIMUM_PAGES_NUMBER: 20,
    // Determine the maximum sessions counts to run in order to retry purchase failed courses.
    MAXIMUM_SESSIONS_COUNT: 5,
    // Determine how much milliseconds interval to calculate the time of the
    // status line in the console.
    MILLISECONDS_INTERVAL_COUNT: 500,
    // Determine the milliseconds count timeout to wait for between course's creation.
    MILLISECONDS_TIMEOUT_BETWEEN_COURSES_CREATE: 200,
    // Determine the milliseconds count timeout to wait for between main pagination.
    MILLISECONDS_TIMEOUT_BETWEEN_COURSES_MAIN_PAGES: 200,
    // Determine the milliseconds count timeout to wait for between update courses data.
    MILLISECONDS_TIMEOUT_BETWEEN_COURSES_UPDATE: 200,
    // Determine the maximum characters count to display the course name on the console status.
    MAXIMUM_COURSE_NAME_CHARACTERS_DISPLAY_COUNT: 150,
    // Determine the maximum characters count to display URL (courses or Udemy) on the console status.
    MAXIMUM_URL_CHARACTERS_DISPLAY_COUNT: 150,
    // Determine the maximum characters count to display the result details on the console status.
    MAXIMUM_RESULT_CHARACTERS_DISPLAY_COUNT: 150,
    // Determine the maximum Udemy login attempts before exit.
    MAXIMUM_UDEMY_LOGIN_ATTEMPTS_COUNT: 5,
    // Determine the milliseconds count timeout to wait after any Udemy crawling action.
    MILLISECONDS_TIMEOUT_UDEMY_ACTIONS: 1000,
    // Determine the milliseconds count timeout to wait for between Udemy course purchase.
    MILLISECONDS_TIMEOUT_BETWEEN_COURSES_PURCHASE: 5000,
    // Determine the milliseconds count timeout to wait after any Udemy page to load.
    MILLISECONDS_TIMEOUT_UDEMY_PAGE_LOAD: 5000,
    // Determine the number of create and update processes errors in a row, which after exceeding this count the program will exit.
    MAXIMUM_CREATE_UPDATE_ERROR_IN_A_ROW_COUNT: 5,
    // Determine the number of purchase process errors in a row, which after exceeding this count the program will exit.
    MAXIMUM_PURCHASE_ERROR_IN_A_ROW_COUNT: 5,
    // Determine the milliseconds count timeout to wait before exiting the application.
    MILLISECONDS_TIMEOUT_EXIT_APPLICATION: 1000,
    // Determine the number of retries to validate the URLs.
    MAXIMUM_URL_VALIDATION_COUNT: 5,
    // Determine the milliseconds count timeout to wait between URL validation retry.
    MILLISECONDS_TIMEOUT_URL_VALIDATION: 1000,
    // Determine the maximum courses dates count to display the course date value console status.
    MAXIMUM_COURSES_DATES_DISPLAY_COUNT: 3,

    // ===ROOT PATH=== //
    // Determine the application name used for some of the calculated paths.
    APPLICATION_NAME: 'auto-packages-updater',
    // Determine the path for the outer application, where other directories located, such as backups, sources, etc...
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
    // Determine the path of the JSON file from which the Udemy account will be fetched. Must be a JSON file.
    ACCOUNT_FILE_PATH: pathUtils.getJoinPath({
        targetPath: __dirname,
        targetName: '../../../../../../Users/Or/Dropbox/accounts/udemy/'
    }),

    // ===DYNAMIC PATH=== //
    // All these paths will be calculated during runtime in the initial service.
    // DON'T REMOVE THE KEYS, THEY WILL BE CALCULATED TO PATHS DURING RUNTIME.
    // Determine the application path where all the source of the application is located.
    // (Working example: 'C:\\Or\\Web\\auto-packages-updater\\auto-packages-updater').
    APPLICATION_PATH: 'auto-packages-updater',
    // Determine the backups directory which all the local backup will be created to.
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

    // ===INNER SETTINGS=== //
    // A copy of all the inner settings declared on top in order to do validation.
    INNER_SETTINGS: innerSettings
};

module.exports = settings; */