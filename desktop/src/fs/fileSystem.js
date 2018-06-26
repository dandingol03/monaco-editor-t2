

var fs = require('fs');
var path = require('path');
var app = require('electron').app;

var _ = require('lodash');
var fsPlus = require('fs-plus');

var Logger = require('../log/logger.js');

var FileSystem = function () {
    // don't write to the same path twice
    this.writingLog = {

    };
};

var getPath = function (pathType, relativePath) {
    var userPath = app.getPath(pathType);
    //Logger.info('userPath='+userPath);
    return path.join(userPath, relativePath);
};

var getRelativePath = function (relativePath) {
    return path.join(__dirname, relativePath);
};

FileSystem.prototype.getAppPath = getPath.bind(this, 'appData');
FileSystem.prototype.getTmpPath = getPath.bind(this, 'temp');
FileSystem.prototype.getHomePath = getPath.bind(this, 'home');

//检测文件是否存在
FileSystem.prototype.exists = (path) => {
    return new Promise((resolve, reject) => {
        try{
            fs.exists(path, function (exists) {
                if (exists)
                    resolve({ re: 1 });
                else
                    resolve({ re: -1 });
            });
        }catch(e)
        {
            Logger.error(e)
        }
    });
}



FileSystem.prototype.readFile = function (absolutePath, callbacks) {
    fs.readFile(absolutePath, function (err, data) {
        if (err) {
            if (callbacks.error) {
                callbacks.error(err);
            }
        } else {
            if (callbacks.success) {
                callbacks.success(data);
            }
        }
    });
};

FileSystem.prototype.writeFile = function (absolutePath, data, callbacks) {
    if (this.writingLog[absolutePath]) {
        callbacks.error('CANNOT_SIMULTANEOUSLY_WRITE');
        return;
    }
    this.writingLog[absolutePath] = 1;
    var localLog = this.writingLog;
    var onComplete = (function (callbacks) {
        return function (err) {
            delete localLog[absolutePath];
            if (err) {
                if (callbacks.error) {
                    Logger.error('Failed to write file', err);
                    callbacks.error(err);
                }
            } else {
                if (callbacks.success) callbacks.success();
            }
        };
    })(callbacks);
    var buf = data;
    if (!Buffer.isBuffer(data)) {
        buf = new Buffer(data, 'utf8');
    }
    fs.writeFile(absolutePath, buf, onComplete);
};

FileSystem.prototype.deleteFile = function (absolutePath, callbacks) {
    fs.unlink(absolutePath, function (err) {
        // If file doesn't exist, consider the deletion successful
        if (err && err.code !== 'ENOENT') {
            Logger.error('Failed to delete file', err);
            if (callbacks.error) {
                callbacks.error(err);
            }
        } else {
            if (callbacks.success) callbacks.success();
        }
    });
};


FileSystem.prototype.makeDir = (absolutePath) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(absolutePath, '775', function (err) {
            if (err) {
                if (err.code == 'EEXIST') {
                   resolve({re:1})
                }else{
                    resolve({re:-1})
                }
                
            }else{
                resolve({re:1})
            }
        });
    })
}




FileSystem.prototype.createDirectory = function (absolutePath, callbacks) {
    fs.mkdir(absolutePath, '775', function (err) {
        if (err) {
            if (err.code == 'EEXIST') {
                callbacks.success();
                return;
            }
            Logger.error('Failed to create directory', err);
            callbacks.error(err);
            return;
        }
        callbacks.success();
    });
};

FileSystem.prototype.deleteDirectoryRecursivelySync = function (absolutePath, saveRoot) {
    var rmdir = function (dir) {
        var list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
            var filename = path.join(dir, list[i]);
            var stat = fs.statSync(filename);

            if (filename == "." || filename == "..") {
                // pass these files
            } else if (stat.isDirectory()) {
                // rmdir recursively
                rmdir(filename);
            } else {
                // rm filename
                fs.unlinkSync(filename);
            }
        }
        if (dir == absolutePath && saveRoot) {
            return; //don't delete the root folder
        }
        fs.rmdirSync(dir);
    };

    return rmdir(absolutePath);
};

FileSystem.prototype.copyDirectorySync = function (copyAbsolutePath, pasteAbsolutePath) {
    var recursiveCopy = (copyDir, pasteDir) => {
        // make the new directory
        try {
            fs.mkdirSync(pasteDir, '775');
        } catch (err) {
            if (err.code == "EEXIST") {
                //do nothing
            } else {
                throw err;
            }
        }

        // copy its files
        var list = fs.readdirSync(copyDir);
        for (var i = 0; i < list.length; i++) {
            var filename = path.join(copyDir, list[i]);
            var copyFilename = path.join(pasteDir, list[i]);
            var stat = fs.statSync(filename);

            if (filename == "." || filename == "..") {
                // pass these files
            } else if (stat.isDirectory()) {
                // recurse into directories
                recursiveCopy(filename, copyFilename);
            } else {
                // copy over files
                try {
                    fs.statSync(copyFilename).isFile();

                    // overwrite existing files if no error is thrown
                    fs.unlinkSync(copyFilename);
                } catch (err) {
                    // do nothing
                } finally {
                    fs.createReadStream(filename).pipe(fs.createWriteStream(copyFilename));
                }
            }
        }
    };

    return recursiveCopy(copyAbsolutePath, pasteAbsolutePath);
}

FileSystem.prototype.lsFilesInDirSync = function (dir) {
    var list = fs.readdirSync(dir);
    var fileList = [];
    for (var i = 0; i < list.length; i++) {
        fileList.push(path.join(dir, list[i]));
    }
    return fileList;
}


FileSystem.prototype.copyFileSync = function (file, copyFile) {
    try {
        fs.statSync(copyFile).isFile();
        // overwrite existing files if no error is thrown
        fs.unlinkSync(copyFile);
    } catch (err) {
        //do nothing
    } finally {
        fs.createReadStream(file).pipe(fs.createWriteStream(copyFile));
    }
};

FileSystem.prototype.statAppData = function (relativePath) {
    return fs.statSync(getPath('appData', relativePath));
};

FileSystem.prototype.createAppDataDirectory = function (relativePath, callbacks) {
    fs.mkdir(getPath('appData', relativePath), '775', callbacks);
};

FileSystem.prototype.statTmpData = function (relativePath) {
    return fs.statSync(getPath('temp', relativePath));
};

FileSystem.prototype.createTmpDataDirectory = function (relativePath, callbacks) {
    fs.mkdir(getPath('temp', relativePath), '775', callbacks);
};

FileSystem.prototype.readAppData = function (relativePath, callbacks) {
    this.readFile(getPath('appData', relativePath), callbacks);
};

FileSystem.prototype.writeAppData = function (relativePath, data, callbacks) {
    this.writeFile(getPath('appData', relativePath), data, callbacks);
};

FileSystem.prototype.readFromRelativePath = function (relativePath, callbacks) {
    this.readFile(getRelativePath(relativePath), callbacks);
};

FileSystem.prototype.writeToRelativePath = function (relativePath, data, callbacks) {
    this.writeFile(getRelativePath(relativePath), data, callbacks);
};

module.exports = new FileSystem();
