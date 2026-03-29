# Contributing

Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE).

Everyone is welcome to contribute to this project. Contributing doesn't just mean submitting pull requests—there are many different ways for you to get involved, including answering questions, reporting issues, improving documentation, or suggesting new features.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:
1. Check if the issue already exists in the [GitHub Issues](https://github.com/orassayag/auto-packages-updater/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment details (OS, Node version)
   - Sample projects.json configuration (if relevant)

### Submitting Pull Requests

1. Fork the repository
2. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the code style guidelines below
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork and submit a pull request

### Code Style Guidelines

This project uses:
- **JavaScript (ES6+)** with Node.js
- **ESLint** for code quality
- **Modular architecture** with services, models, and utilities

Before submitting:
```bash
# Check for linting errors
npm run lint

# Test the outdated packages check
npm start

# Test the backup functionality
npm run backup
```

### Coding Standards

1. **Modular design**: Keep services, models, and utilities separate
2. **Error handling**: Use descriptive error messages with error codes
3. **Validation**: Validate all input data thoroughly
4. **Clear naming**: Use descriptive names for variables and functions
5. **Documentation**: Add comments for complex logic

### Project Structure

When contributing, understand the structure:
```
src/
├── core/
│   ├── models/        # Data models
│   └── enums/         # Enumerations and constants
├── services/          # Business logic services
├── logics/            # Main application logic
├── scripts/           # Entry point scripts
├── utils/             # Utility functions
└── settings/          # Configuration settings
```

### Adding New Features

When adding new features:
1. Create appropriate models in `src/core/models/`
2. Add service logic in `src/services/`
3. Update enums if needed in `src/core/enums/`
4. Add utility functions in `src/utils/`
5. Update settings in `src/settings/settings.js`
6. Document changes in relevant files
7. Test thoroughly with various project configurations

### Configuration Changes

When modifying settings:
1. Update `src/settings/settings.js`
2. Document new settings in INSTRUCTIONS.md
3. Ensure backward compatibility where possible
4. Test with different configurations

### Testing Guidelines

Test your changes with:
1. Single project configurations
2. Multiple project configurations
3. Projects with and without devDependencies
4. Custom package lists
5. Exclude package lists
6. Both full and custom update types
7. Projects with parent repositories
8. Git update enabled and disabled scenarios

## Questions or Need Help?

Please feel free to contact me with any question, comment, pull-request, issue, or any other thing you have in mind.

* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag

Thank you for contributing! 🙏
