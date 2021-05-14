## Instructions

===================
FAST & BASIC START.
===================
1. Open the project in IDE (Current to 04/18/2021 I'm using VSCode).
2. Open the following file in the src/settings/settings.js file.
3. Search for the first setting - 'DIST_FILE_NAME' - Set your dist result TXT file name.
4. Set your projects.json path in the 'PROJECTS_PATH' parameter setting.
5. Make sure to read and follow the instructions on how to create the projects.json file -
   Found in 'misc/examples/README.txt' path.
6. Once you setup the project.json file, it's time to the next step - Time to install the NPM packages. In the terminal run 'npm run i'.
7. You are ready to start the outdated process.
8. In the terminal run 'npm start'. If everything goes well, you will start to see the console status line appear.
9. If you see any error - Need to check what's changed. Current to 04/18/2021, It works fine.
10. If you see the console status line but the 'WORKING' not changing the project name - Need to check what's wrong.
11. If no errors and the progress works OK, make sure to check the 'dist' directory that all TXT files created successfully.
12. Successful running application on production/development should look like this:

/* cSpell:disable */
===IMPORTANT SETTINGS===
DIST_FILE_NAME: outdated
MAXIMUM_PROJECTS_COUNT: 100
PROJECTS_PATH: C:\\projects.json
========================
OK to run? (y = yes)
y
===INITIATE THE SERVICES===
===VALIDATE GENERAL SETTINGS===
===WORKING: auto-packages-updater 2/2 | 100.00%===
===EXIT: FINISH===

13. Example of the result TXT file:

===crawler 05/24===
ansi-escapes: ^4.3.2 => ^5.0.0
micromatch: ^4.0.3 => ^4.0.4
mongoose: ^5.12.3 => ^5.12.4
slice-ansi: ^4.0.0 => ^5.0.0
wrap-ansi: ^7.0.0 => ^8.0.0

===auto-packages-updater 00/05===
success | All packages up to date.

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverFlow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag