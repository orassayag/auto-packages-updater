# Instructions

## Setup Instructions

1. Open the project in your IDE (VSCode recommended)
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Main Settings

Edit `src/settings/settings.js` to configure the application:

#### General Settings
- `GITHUB_URL`: Base URL for GitHub repositories (default: `https://github.com/orassayag`)

#### Log Settings
- `DIST_OUTDATED_FILE_NAME`: Output filename for outdated packages report (default: `outdated`)
- `DIST_UPDATED_FILE_NAME`: Output filename for updated packages report (default: `updated`)

#### Count & Limit Settings
- `MAXIMUM_PROJECTS_COUNT`: Maximum number of projects to check (default: 100)
- `MAXIMUM_PROJECTS_UPDATE_COUNT`: Maximum number of projects to auto-update (default: 100)
- `MILLISECONDS_TIMEOUT_EXIT_APPLICATION`: Timeout before exiting (default: 1000)
- `MAXIMUM_URL_VALIDATION_COUNT`: Number of URL validation retries (default: 5)
- `MILLISECONDS_TIMEOUT_URL_VALIDATION`: Delay between URL validation retries (default: 1000)
- `MAXIMUM_RETRIES_COUNT`: Number of retries for package updates per project (default: 1)
- `MILLISECONDS_TIMEOUT_UPDATE_PROJECT`: Delay between project updates (default: 10000)
- `MILLISECONDS_TIMEOUT_GIT_COMMANDS_EXECUTION`: Delay between git command executions (default: 2000)
- `MAXIMUM_DELETE_TEMPORARY_DIRECTORY_RETRIES_COUNT`: Retries for temporary directory deletion (default: 5)
- `MILLISECONDS_TIMEOUT_DELETE_TEMPORARY_DIRECTORY`: Delay before deleting temporary directory (default: 1000)

#### Flag Settings
- `IS_AUTO_UPDATE`: Enable/disable auto-update step (default: true)
- `IS_LOG_ONLY_UPDATES`: Log only projects with updates available (default: true)
- `IS_SIMULATE_UPDATE_MODE`: Simulate updates without making actual changes (default: false)

#### Source Settings
- `PROJECTS_PATH`: Path to the projects.json file (default: `../../sources/projects.json`)

#### Path Settings
- `APPLICATION_NAME`: Application name (default: `auto-packages-updater`)
- `OUTER_APPLICATION_PATH`: Path to outer application directory
- `INNER_APPLICATION_PATH`: Path to inner application directory

### Projects Configuration File

Create a `sources/projects.json` file with your project configurations. See `misc/examples/projects.json` for reference.

Each project entry requires:

```json
{
  "name": "project-name",
  "display-name": "Optional Display Name",
  "update-type": "full",
  "project-path": "C:\\path\\to\\project",
  "git-root-path": "relative-git-path",
  "parent-project-path": null,
  "custom-packages-path": null,
  "exclude-packages-list": null,
  "include-dev-dependencies": true,
  "is-packages-update": true,
  "is-git-update": true
}
```

#### Field Descriptions

- `name` (required): Project identifier name
- `display-name` (optional): Friendly display name for console output
- `update-type` (required): Either `"full"` or `"custom"`
  - `"full"`: Check all packages
  - `"custom"`: Check only packages listed in custom-packages-path file
- `project-path` (required): Absolute path to the project directory containing package.json
- `git-root-path` (required): Relative path within the Git repository
- `parent-project-path` (optional): Path to parent project for monorepo structures
- `custom-packages-path` (optional): Path to TXT file with custom package names (one per line)
- `exclude-packages-list` (optional): Array of package names to exclude from checks
- `include-dev-dependencies` (required): Boolean to include devDependencies in checks
- `is-packages-update` (required): Boolean to enable auto-update for this project
- `is-git-update` (required): Boolean to push updates to Git repository

## Running Scripts

### Check for Outdated Packages
Scans all projects and generates outdated packages report:
```bash
npm start
```

**What it does:**
1. Validates internet connection
2. Loads projects from projects.json
3. Checks each project for outdated packages
4. Generates report in `dist/outdated-[timestamp].txt`
5. Optionally auto-updates packages if `IS_AUTO_UPDATE` is enabled

### Auto-Update Flow
When auto-update is enabled:
1. Clones Git repository to temporary directory
2. Updates package.json with new versions
3. Runs `npm install`
4. Validates updates
5. Commits and pushes changes to Git (if `is-git-update` is true)
6. Copies updated files to original project directory
7. Generates report in `dist/updated-[timestamp].txt`

### Create Backup
Creates a backup of the application:
```bash
npm run backup
```

**What it does:**
- Creates timestamped backup in `backups/` directory
- Excludes: `.git`, `dist`, `node_modules`, `sources`
- Includes: `.gitignore` and all source files

### Sandbox Testing
Run sandbox tests for development:
```bash
npm run sand
```

## Output Files

### Outdated Packages Report
Located in `dist/outdated-[timestamp].txt`:
```
===project-name 05/24===
package-name: ^1.0.0 => ^2.0.0
another-package: ^3.1.0 => ^3.2.0

===another-project 00/05===
success | All packages up to date.
```

Format: `===ProjectName OutdatedCount/TotalCount===`

### Updated Packages Report
Located in `dist/updated-[timestamp].txt`:
- Lists successfully updated projects
- Shows packages that were updated
- Reports any failures or retries

## Error Handling

All errors include unique error codes (1000001-1000038) for easy troubleshooting.

Common issues:
- `(1000019)`: Invalid fileDataResultModel - Check file paths in settings
- `(1000020)`: Invalid projects.json array - Verify JSON syntax
- `(1000022)`: Duplicate project path - Remove duplicate entries
- `(1000036)`: Temporary directory not cleanable - Close applications using temp directory
- `(1000037)`: Temporary directory not removable - Check file permissions

## Important Notes

### Internet Connection
- Required for checking outdated packages
- Validates connection to google.com before starting
- Retries validation up to `MAXIMUM_URL_VALIDATION_COUNT` times

### Git Operations
- Requires Git to be installed and configured
- GitHub credentials must be set up for push operations
- Uses `GITHUB_URL` setting to construct repository URLs

### Temporary Directory
- Created at runtime for Git operations
- Automatically cleaned after each project update
- Located at `temp/` relative to application root

### Simulate Mode
- Set `IS_SIMULATE_UPDATE_MODE: true` to test without making changes
- Runs entire flow but skips Git push and file copying
- Useful for testing configurations

### Project Order
- Projects with `parent-project-path` are processed first
- Helps optimize Git clone operations for monorepos
- Random selection when exceeding `MAXIMUM_PROJECTS_UPDATE_COUNT`

## Workflow Example

1. Configure settings in `src/settings/settings.js`
2. Create `sources/projects.json` with your projects
3. Run `npm start` to check for outdated packages
4. Review output in `dist/outdated-[timestamp].txt`
5. If auto-update is enabled, review `dist/updated-[timestamp].txt`
6. Check your project directories for updated package files
7. Verify changes in Git repositories (if enabled)

## Confirmation Prompt

Before execution, the application displays important settings:
```
===IMPORTANT SETTINGS===
DIST_FILE_NAME: outdated
MAXIMUM_PROJECTS_COUNT: 100
PROJECTS_PATH: C:\projects.json
========================
OK to run? (y = yes)
```

Type `y` to proceed or any other key to abort.

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag
