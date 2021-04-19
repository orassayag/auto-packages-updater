Please note,
projects.json - This file is an example of the file that should be provided (it's path) to the 'PROJECTS_PATH' parameter in the settings.js file.
It can contains multuiply projects, but the limit is in the 'MAXIMUM_PROJECTS_COUNT' parameter in the settings.js file. When the limit exceeded, the first
projects will be processed.
projects.json structure:
'name'                      - (Required) The project's name, which will be display both in the console and in the result TXT file in the 'dist' directory.
'update-type'               - (Required) The project's update type. There are 2 types of updates: 'full' / 'custom'. Other strings will cause an error.
                              'full' - Take all the packages in the package.json file and check all of them for updates.
                              'cusom' - Take only specific package names that found in 'custom-packages-path' file. Without any value in the
                              'custom-packages-path' field will case an error.
'packages-path'             - (Required) The project's package.json file which must contain at least one package. Note that duplicate paths to the same
                              package.json file will be ignored. An example for standard package.json file included in this directory ('package.json').
'custom-packages-path'      - (Optional) The project's custom packages file path, in case the entered update type is 'custom' (ignored if set to 'full).
                              This file should contain only the packages (which included in the package.json file) that wish to check for updates. The result
                              of the packages will be ignored. An example for standard custom packages text file included in this
                              directory ('custom_packages.txt').
'exclude-packages-list'     - (Optional) The project's exclude packages. In this array, regardless if the project's update type is 'full' or custom', will be
                              listed all the packages that must be ignored. For exmaple, if in the package.json file contains package named 'eslint', and
                              this array will include 'eslint', there will be no check for updates on the 'eslint' package.
'include-dev-dependencies'  - (Required) Determine if to include the devDependencies section in the package.json file. If set to false, all the
                              devDependencies will be ignored and all the packages that listed there will not be checked for updates.