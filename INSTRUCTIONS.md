# Setup and Usage Instructions

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Configuration](#configuration)
4. [Available Commands](#available-commands)
   - [Running Scripts](#running-scripts)
   - [Development Commands](#development-commands)
5. [Troubleshooting](#troubleshooting)
6. [Extending the Application](#extending-the-application)
7. [Best Practices](#best-practices)
8. [Documentation](#documentation)
9. [External Resources](#external-resources)

## Prerequisites

### System Requirements

- **Node.js**: Version 14 or higher
- **Git**: Installed and configured with global credentials
- **Memory**: 512MB RAM minimum
- **Disk Space**: 100MB for application and temporary files
- **Internet Access**: Required for package scanning and Git operations

## Initial Setup

### 1. Install Dependencies

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

## Available Commands

### Running Scripts

#### Check for Outdated Packages

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

#### Auto-Update Flow

When auto-update is enabled:

1. Clones Git repository to temporary directory
2. Updates package.json with new versions
3. Runs `npm install`
4. Validates updates
5. Commits and pushes changes to Git (if `is-git-update` is true)
6. Copies updated files to original project directory
7. Generates report in `dist/updated-[timestamp].txt`

### Development Commands

**Sandbox Testing:**
Run sandbox tests for development:

```bash
npm run sand
```

**Backups:**
Creates a backup of the application:

```bash
npm run backup
```

**What it does:**

- Creates timestamped backup in `backups/` directory
- Excludes: `.git`, `dist`, `node_modules`, `sources`
- Includes: `.gitignore` and all source files

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

## Troubleshooting

All errors include unique error codes (1000001-1000038) for easy troubleshooting.

### Common Issues and Solutions

- **Error (1000019)**: Invalid fileDataResultModel.
  - _Solution_: Check your file paths in `src/settings/settings.js`. Ensure all paths exist and are accessible.
- **Error (1000020)**: Invalid projects.json array.
  - _Solution_: Verify the JSON syntax in `sources/projects.json`. Ensure it's a valid JSON array.
- **Error (1000036/37)**: Temporary directory issues.
  - _Solution_: Ensure no other applications are using the `temp/` directory. Check file permissions and try manually deleting the folder.
- **Internet Connection Failures**:
  - _Solution_: The application requires a stable connection to validate packages. Ensure you can reach `google.com` from your terminal.
- **Git Push Failures**:
  - _Solution_: Verify that your SSH keys or HTTPS credentials are correctly configured for automated Git operations.

## Extending the Application

The application is designed to be modular and easy to extend:

- **Adding New Services**: Create a new service file in `src/services/files/` and export it through `src/services/index.js`.
- **Defining New Models**: Add new data structure definitions in `src/core/models/files/`.
- **Creating Utilities**: Place shared helper functions in `src/utils/files/`.
- **Configuration**: Add new system-wide settings in `src/settings/settings.js`.

## Best Practices

- **Simulate First**: Always run with `IS_SIMULATE_UPDATE_MODE: true` before performing real updates.
- **Incremental Updates**: Use `MAXIMUM_PROJECTS_UPDATE_COUNT` to limit the scope of automated changes.
- **Regular Backups**: Use `npm run backup` before making significant configuration or code changes.
- **Report Review**: Always review the reports in the `dist/` directory after each execution.
- **Git Monitoring**: Check the automated commits in your repositories to ensure they meet your quality standards.

## Documentation

- **README.md**: Overview, features, and high-level architecture.
- **INSTRUCTIONS.md**: Detailed setup, configuration, and usage guide.
- **CHANGELOG.md**: Track version history and significant changes.

## External Resources

- [NPM Check Updates](https://www.npmjs.com/package/npm-check-updates) - The core engine for package scanning.
- [Node.js Documentation](https://nodejs.org/docs/) - Official runtime documentation.
- [Git Documentation](https://git-scm.com/doc) - Reference for Git operations.

## Last Updated

2026-05-12

## Version

1.1.0

## Author

- **Or Assayag** - _Initial work_ - [orassayag](https://github.com/orassayag)
- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag
