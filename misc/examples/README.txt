Please note,
projects.json - This file is an example of the file that should be provided (it's path) to the 'PROJECTS_PATH' parameter in the settings.js file.
It can contain multiple projects, but the limit is in the 'MAXIMUM_PROJECTS_COUNT' parameter in the settings.js file. When the limit is exceeded, the first
projects will be processed.
Each project in the projects.json structure:
'name'                      - (Required) The project's name, like it appears on the git repository.
'display-name'              - (Required) The project's display name. Will appear in the console and in the log file.
'update-type'               - (Required) The project's update type. There are 2 types of updates: 'full' / 'custom'. Other strings will cause an error.
                              'full' - Take all the packages in the package.json file and check all of them for updates.
                              'custom' - Take only specific package names that are found in the 'custom-packages-path' file. Without any value in the
                              'custom-packages-path' field will cause an error.
'packages-path'             - (Required) The project's root path, which must contain the package.json file which must contain at least one package. Note that duplicate paths to the same
                              package.json file will be ignored. An example for the standard package.json file included in this directory ('package.json').
'parent-project-path'       - (Optional) The project's parent root path. If the project contains sub-projects, place the root path here, in order to update each sub-project included.
'git-root-path'             - (Required) The project's exact location of the .git hidden directory and the package.json file inside the git repository.
'custom-packages-path'      - (Optional) The project's custom packages file path, in case the entered update type is 'custom' (ignored if set to 'full ').
                              This file should contain only the packages (which included in the package.json file) that wish to check for updates. The result
                              of the packages will be ignored. An example for standard custom packages text file included in this
                              directory ('custom_packages.txt').
'exclude-packages-list'     - (Optional) The project's exclude packages. In this array, regardless if the project's update type is 'full' or custom', will be
                              listed all the packages that must be ignored. For example, if in the package.json file contains package named 'eslint', and
                              this array will include 'eslint', there will be no check for updates on the 'eslint' package.
'include-dev-dependencies'  - (Required) Determine if to include the devDependencies section in the package.json file. If set to false, all the
                              devDependencies will be ignored and all the packages that listed there will not be checked for updates.
'is-packages-update'        - (Required) Determine if to auto-update the outdated packages of this project (not to update the git repository).
'is-git-update'             - (Required) Determine if to update the git repository after the packages have been updated locally.