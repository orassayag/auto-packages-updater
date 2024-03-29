const fs = require('fs-extra');
const pathUtils = require('./path.utils');

class FileUtils {
  constructor() {}

  async read(targetPath) {
    return await fs.readFile(targetPath, 'utf-8');
  }

  async isPathExists(targetPath) {
    // Check if the path parameter was received.
    if (!targetPath) {
      throw new Error(`targetPath not received: ${targetPath} (1000040)`);
    }
    // Check if the path parameter exists.
    try {
      return await fs.stat(targetPath);
    } catch (error) {
      return false;
    }
  }

  async removeDirectoryIfExists(targetPath) {
    if (await this.isPathExists(targetPath)) {
      await fs.remove(targetPath);
    }
  }

  async createDirectoryIfNotExists(targetPath) {
    if (!(await this.isPathExists(targetPath))) {
      await fs.mkdir(targetPath);
    }
  }

  async copyFile(data) {
    const { sourcePath, targetPath } = data;
    await fs.copy(sourcePath, targetPath);
  }

  async copyDirectory(data) {
    const { sourcePath, targetPath, filterFunction } = data;
    await fs.copy(sourcePath, targetPath, { filter: filterFunction });
  }

  async cleanDirectory(targetPath) {
    if (await this.isPathExists(targetPath)) {
      fs.emptyDirSync(targetPath);
    }
  }

  createDirectory(targetPath) {
    if (!targetPath) {
      return;
    }
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }

  async appendFile(data) {
    const { targetPath, message } = data;
    if (!targetPath) {
      throw new Error(`targetPath not found: ${targetPath} (1000041)`);
    }
    if (!message) {
      throw new Error(`message not found: ${message} (1000042)`);
    }
    if (!(await this.isPathExists(targetPath))) {
      await fs.promises.mkdir(pathUtils.getDirName(targetPath), { recursive: true }).catch();
    }
    // Append the message to the file.
    await fs.appendFile(targetPath, message);
  }

  async removeFile(targetPath) {
    if (await this.isPathExists(targetPath)) {
      await fs.unlink(targetPath);
    }
  }

  isDirectoryPath(path) {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  }

  isDirectoryEmpty(path) {
    return fs.readdirSync(path).length === 0;
  }

  isFilePath(path) {
    const stats = fs.statSync(path);
    return stats.isFile();
  }
}

module.exports = new FileUtils();
