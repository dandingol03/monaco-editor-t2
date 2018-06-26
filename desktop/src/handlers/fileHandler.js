
'use strict'
var _fs = require('fs')

var child_process = require('child_process')
var shellJs = require('shelljs')
var path = require('path')
var mkdirp = require('mkdirp')
var _ = require('lodash')
var sane = require('sane')
const { shell, dialog } = require('electron')

var fs = require('fs-plus')
var FileSystem = require('../fs/fileSystem')
var FileOperator = require('../fs/FileOperator')
var bridge = require('../bridge')
var Logger = require('../log/logger')
var parser = require('../parser/es6Parser');
var git = require('simple-git');
var GitHub = require('github-api');

const {
  onFileData,
  onFileMetadata,
  onFileCreated,
  onTextSearchInProj
} = require('../actions/fileActions')

var FileConstants = require('../../../public/constants/ipc/fileConstants')

const {
  WATCH_PATH,
  FETCH_SUB_PATH,
  WRITE_FILE_DATA,
  WRITE_FILE_METADATA,
  DELETE_FILE_METADATA,
  DELETE,
  SHOW_IN_FINDER,
  CREATE_DIRECTORY,
  RENAME,
  CREATE_FILE,
  GET_FILE_DATA,
  GET_JSON_DATA,
  GET_FILE_METADATA,
  INQUIRE_SWITCH_TO_NEW_PROJECT,
  SHARE_SAVE_STATUS,
  UPDATE_JSON_FILE,
  FETCH_FILE_SYNTAX_TREE,
  SEARCH_IN_PROJ,
  FETCH_GIT_STATUS,
  ADD_TO_GIT_INDEX,
  FETCH_GIT_DIFF_STAGED,
  COMMIT_TO_LOCAL_REPO,
  PUSH_TO_REMOTE,
  LS,
  GET_MONACO_EDITOR_PACKAGES,
  NEW_PROJECT_BY_CONFIG_INFO,
  INTERGRATE_REDUX,
  INTERGRATE_WITH_LIBRARY,
  INTERGRATE_WITH_LIBRARY_IN_BATCH,
  INQUIRE_LIBRARY_INSTALLED,
  SEARCH_REPO,
  DELETE_FILE,
  DELETE_FOLDER
} = FileConstants

var LibraryConstants = require('../../../public/constants/ipc/libraryConstants')

const {
  BACKUP_MONACO_DIR,
} = LibraryConstants



let _watcher = null
let watchedPath = null

const pathList = {}


function verifyPayload(payload) {
  if (!payload.path) {
    throw 'payload path is required, but found missing'
  }

  return true
}

function formatPayloadPath(payloadPath) {
  //assuming its an array, shipped back from renderer
  if (typeof payloadPath != 'string') {
    return [''].concat(payloadPath).join(path.sep)
  }
  return payloadPath
}


function createMetadataDir(filepath) {

  return new Promise((resolve, reject) => {
    try {
      _fs.stat(path.dirname(filepath), (err) => {
        if (err) {
          //assume it's because it doesn't exist
          mkdirp(path.dirname(filepath), (err) => {
            if (err) {
              Logger.error(err)
              reject(err)
            } else {
              resolve({ re: 1 })
            }
          })
        } else {
          resolve({ re: 1 })
        }
      })
    } catch (e) {
      Logger.error(e)
      reject(error);
    }
  });
}

function buildPathObjects(absolutePath) {
  const buffer = new Buffer(absolutePath);
  const id = buffer.toString('hex');
  //Logger.info('basename='+baseName);
  const baseName = path.basename(absolutePath)
  const pathArray = absolutePath.split(path.sep)
  //slice the first argument which is
  return {
    absolutePathArray: pathArray.slice(1, pathArray.length),
    baseName: baseName,
    id: id,
  }
}

//元数据按照原有路径生成新的路径存放,以后缀monaco结尾
function buildMetadataFilePath(filePath, rootPath) {


  return new Promise((resolve, reject) => {

    const metadataPath = path.join(formatPayloadPath(rootPath), '.monaco', 'metadata', formatPayloadPath(filePath).replace(rootPath, '') + '.monaco')

    //检查该路径的目录是否存在,不存在则创建
    createMetadataDir(metadataPath).then(() => {
      resolve({ re: 1, data: metadataPath });
    });
  });
}

//接收过来的id是以hex编码的路径,需要转换成String
function getPathFromId(id) {
  const buf = new Buffer(id, 'hex')
  return buf.toString()
}

//建立metalist.json和各个代码片文件
function backupMonacoFiles(payload) {
  return new Promise((resolve, reject) => {

    try {
      var metalist = payload.metalist
      var pass = true
      var _metalist = _.cloneDeep(metalist)
      metalist.map((component, i) => {
        var template = component.template
        var buf = null
        if (!Buffer.isBuffer(template)) {
          buf = new Buffer(template, 'utf8');
        }
        _fs.writeFileSync(path.resolve(payload.path, component.path), buf);
      })

      //去除template键,并保存metalist.json文件
      _metalist.map((component, i) => {
        delete component.template
      })

      if (pass == true) {
        var metalistStr = JSON.stringify(_metalist)
        FileOperator.writeFile(path.resolve(payload.path, 'metalist.json'), metalistStr).then((json) => {
          resolve(json)
        })
      } else {
        resolve({ re: -1 })
      }
    } catch (e) {
      reject(e)
    }

  })
}

//宽度搜索的非递归实现
function breadthFirstSearch(text, rootPath, statistics) {

  var regStr = '(\s?.*?)(' + text + ')(.*\s?)'
  var _stack = []
  _stack.push(rootPath)
  while (_stack.length != 0) {
    var filePath = _stack.pop()
    //如果该路径是文件夹
    if (fs.isDirectorySync(filePath)) {
      //读取子文件夹
      var files = _fs.readdirSync(filePath)
      files.map((file, i) => {
        if (file != 'node_modules')
          _stack.push(path.resolve(filePath, file))
      })


    } else {
      //如果是文件,进行文件的读入,可能会出现文件编码的问题
      //TODO:进行文件类型的区别
      var reg = /.*\.(.*)?/
      var contentText = null
      if (reg.exec(filePath) && reg.exec(filePath)[1]) {
        var suffix = reg.exec(filePath)[1]
        switch (suffix) {
          case 'js':
            contentText = _fs.readFileSync(filePath, 'utf-8').toString()
            break;
          case 'jsx':
            contentText = _fs.readFileSync(filePath, 'utf-8').toString()

            break;
          default:
            break;
        }
      }

      if (contentText) {
        var hits = []
        //正则多分组匹配
        var reg = new RegExp(regStr, "g")
        var re = null
        while (re = reg.exec(contentText)) {
          var snippet = re[0]
          var strPrefix = re[1]
          var range = {}
          range.start = re.index + strPrefix.length
          range.end = range.start + text.length
          hits.push({ range, snippet })
        }
        //进行结果的存储
        if (hits.length > 0)
          statistics.data.push({ filePath, hits })
      }

    }

  }
}


//安装redux
const npmInstallRedux = (projPath) => {

  return new Promise((resolve, reject) => {

    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['install', 'redux@^3.7.2', '--save'], { cwd: projPath });
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'child process eixt ,exit:' + code)
      resolve({ re: 1 })
    });
  })

}

//安装react-redux
const npmInstallReactRedux = (projPath) => {

  return new Promise((resolve, reject) => {

    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['install', 'react-redux@^5.0.7', '--save'], { cwd: projPath });
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'child process eixt ,exit:' + code)
      resolve({ re: 1 })
    });
  })

}

//redux-logger
const npmInstallReduxLogger = (projPath) => {
  return new Promise((resolve, reject) => {

    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['install', 'redux-logger@^3.0.6', '--save'], { cwd: projPath });
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'child process eixt ,exit:' + code)
      resolve({ re: 1 })
    });
  })
}

//redux-thunk
const npmInstallReduxThunk = (projPath) => {
  return new Promise((resolve, reject) => {

    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['install', 'redux-thunk@^2.2.0', '--save'], { cwd: projPath });
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'child process eixt ,exit:' + code)
      resolve({ re: 1 })
    });
  })
}

const installLibrary = (payload) => {
  return new Promise((resolve, reject) => {

    var { projPath, npmName } = payload

    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['install', npmName, '--save'], { cwd: projPath });
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      Logger.error('npm ->' + data)
      global.win.webContents.send('console', '' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      //global.win.webContents.send('console', 'child process eixt ,exit:' + code)
      resolve({ re: 1 })
    });

  })
}

//确认该库是否安装
const libraryInstalled = (payload) => {
  try {

    var { projPath, libraryName } = payload

    var nodeModulePath = path.resolve(projPath, 'node_modules')

    var exists = _fs.existsSync(nodeModulePath)
    if (exists) {
      var filePath = path.resolve(nodeModulePath, libraryName)
      exists = _fs.existsSync(filePath)

      if (exists) {
        //读取package.json -> 获取version属性

        filePath = path.resolve(filePath, 'package.json')
        var _content = _fs.readFileSync(filePath)
        var packageJSON = JSON.parse(_content)
        return [true, packageJSON.version]
      }
      else
        return [false, null]
    }
    else
      return [false, null]
  } catch (e) {
    return [false, null]
  }

}

//react-native-deprecated-custom-components
const npmInstallRNDeprecatedCustomComponents = (projPath) => {
  return new Promise((resolve, reject) => {

    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['install', 'react-native-deprecated-custom-components', '--save'], { cwd: projPath });
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'child process eixt ,exit:' + code)
      resolve({ re: 1 })
    });
  })
}

//create react-native project
const createProject=(payload)=>{
  return new Promise((resolve, reject) => {

    var { projName, projPath } = payload;
    var spawn = require('child_process').spawn;
    var free = spawn('react-native', ['init', projName, '--version', '0.44.0'], { cwd: projPath });

    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', '' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'child process eixt ,exit:' + code)
      resolve({re:1})
    });

  })
}


function onError(message) {
  return {
    type: 'error',
    data: message
  }
}

const makeFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.open(filePath, 'w+', '0755', function (err, fd) {
      if (err)
        reject(err)
      resolve({ re: 1 })
    })
  })
}


class FileHandler {

  getWatchedPath() {
    return watchedPath
  }

  register() {

    bridge.on(GET_FILE_DATA, this.readFileData)
    bridge.on(GET_FILE_METADATA, this.readFileMetadata)//获取本地工程文件的元数据
    bridge.on(FETCH_FILE_SYNTAX_TREE, this.readFileSyntaxTree)//获取本地工程文件的语法生成树信息
    bridge.on(FETCH_SUB_PATH, this.asyncListSubPaths)//读取子目录的路径数据
    bridge.on(BACKUP_MONACO_DIR, this.backupMonacoDirectory)//备份monaco的组件库信息
    bridge.on(CREATE_FILE, this.createFile)//创建文件
    bridge.on(WRITE_FILE_DATA, this.writeFileData)
    bridge.on(SEARCH_IN_PROJ, this.searchInProj)//工程范围的搜索
    bridge.on(FETCH_GIT_STATUS, this.fetchGitStatus)//获取工程的git状态
    bridge.on(ADD_TO_GIT_INDEX, this.addToGitIndex)//加入git缓冲区
    bridge.on(FETCH_GIT_DIFF_STAGED, this.fetchGitDiffStaged)//获取index与版本库的区别
    bridge.on(COMMIT_TO_LOCAL_REPO, this.commitToLocalRepo)//加入本地仓库
    bridge.on(PUSH_TO_REMOTE, this.pushToRemote)//推送至远程仓库
    bridge.on(LS, this.ls)//执行ls命令
    bridge.on(GET_MONACO_EDITOR_PACKAGES, this.fetchAllPackageInNPM)//获取所有在npm上可供monaco-editor使用的库
    bridge.on(NEW_PROJECT_BY_CONFIG_INFO, this.newProjectByConfigInfo)//配置并新建工程
    bridge.on(CREATE_DIRECTORY, this.createDirectory)//创建文件夹
    bridge.on(INTERGRATE_REDUX, this.intergrateRedux)//配置redux
    bridge.on(INTERGRATE_WITH_LIBRARY, this.intergrateWithLibrary)//开源库安装
    bridge.on(INTERGRATE_WITH_LIBRARY_IN_BATCH, this.intergrateWithLibraryInBatch)//批量开源库安装
    bridge.on(INQUIRE_LIBRARY_INSTALLED, this.inquireLibraryInstalled)//询问该库是否安装
    bridge.on(INQUIRE_SWITCH_TO_NEW_PROJECT,this.inquireSwitchToNewProject)
    bridge.on(SEARCH_REPO,this.searchRepo)//搜索github仓库
    bridge.on(DELETE_FILE, this.deleteFile)//删除文件
    bridge.on(DELETE_FOLDER, this.deleteFolder)//删除文件夹
  }

  //询问工程路径以配置redux
  inquireProjPathForReduxIntergration() {
    global.win.webContents.send('config', 'redux')
  }

  //组件集成
  intergreteComponents() {
    global.win.webContents.send('config', 'components')
  }

  //开源库安装
  intergrateWithLibrary(payload, respond) {

    installLibrary(payload).then((json) => {
      respond({ type: INTERGRATE_WITH_LIBRARY, re: 1 })
    }).catch((e) => {
      respond({ type: INTERGRATE_WITH_LIBRARY, re: -1 })
    })
  }

  //批量开源库安装
  intergrateWithLibraryInBatch(payload, respond) {
    var { npmNames, projPath } = payload
    var statistics = {
      count: 0,
      target: npmNames.length
    }
    for (var i = 0; i < npmNames.length; i++) {
      var npmName = npmNames[i]
      installLibrary({ projPath, npmName }).then((json) => {
        statistics.count++
        if (statistics.count == statistics.target)
          respond({ type: INTERGRATE_WITH_LIBRARY_IN_BATCH, re: 1 })
      }).catch((e) => {
        respond({ type: INTERGRATE_WITH_LIBRARY_IN_BATCH, re: -1 })
      })
    }
  }

  //redux集成
  intergrateRedux(payload, respond) {
    var { projPath } = payload

    //是否集成redux，总共检查3个库,如果皆有，用户可以选择覆盖安装

    npmInstallRedux(projPath).then((json) => {
      return npmInstallReactRedux(projPath)
    }).then((json) => {
      return npmInstallReduxLogger(projPath)
    }).then((json) => {
      return npmInstallReduxThunk(projPath)
    }).then((json) => {


      //todo:建立初始化的reducer文件夹、和相应的store等文件

      respond({ type: INTERGRATE_REDUX, re: 1 })
    }).catch((e) => {
      respond({ type: INTERGRATE_REDUX, re: -1 })
    })
  }

  //按作者搜索github repo
  searchRepo(payload, respond) {
    var { username } = payload
    var gh = new GitHub({
      username: 'dandingol03',
      password: 'kobebra03'
    })
    var search = gh.search({
      q: 'user:'+username+' fork:true'
    })
    var options;
    search.forRepositories(options)
      .then(function ({ data }) {
        respond({
          type: SEARCH_REPO,
          data:data,
        })
      }).catch((e)=>{
        respond({ type: SEARCH_REPO, re: -1 ,error:e})
      })

  }

  //询问该组件是否有安装
  inquireLibraryInstalled(payload, respond) {
    var [installed, version] = libraryInstalled(payload)
    Logger.info('version-> ' + version)
    if (installed) {
      respond({
        type: INQUIRE_LIBRARY_INSTALLED,
        data: { version },
        re: 1
      })
    } else {
      respond({ type: INQUIRE_LIBRARY_INSTALLED, re: -1 })
    }
  }

  inquireSwitchToNewProject(payload, respond) {
    var [installed, version] = libraryInstalled(payload)
    Logger.info('version-> ' + version)
    if (installed) {
      respond({
        type: INQUIRE_LIBRARY_INSTALLED,
        data: { version },
        re: 1
      })
    } else {
      respond({ type: INQUIRE_LIBRARY_INSTALLED, re: -1 })
    }
  }



  //使前台显示所有可用npm可配置库
  configProjePathAndName() {
    global.win.webContents.send('config', 'project')
  }


  //配置并新建工程
  newProjectByConfigInfo(payload, respond) {

    var { projName, projPath } = payload;

    //检查该路径底下有没有project
    FileSystem.exists(path.resolve(projPath, projName)).then((json) => {
      if (json.re == 1)//该路径已经存在
      {
        respond({
          type: 'NEW_PROJECT_BY_CONFIG_INFO',
          data: {
            existed: true
          }
        })
      } else {

        createProject(payload).then((json)=>{
          respond({
            type: 'NEW_PROJECT_BY_CONFIG_INFO',
            data: {
              status: 'finish'
            }
          })
        })

      }
    })

  }


  //使前台显示所有可用npm可配置库
  configNPMPackagesInFront() {
    global.win.webContents.send('config', 'packages')
  }

  //显示github repos
  configTPLInRepo() {
    global.win.webContents.send('config', 'tpl in repo')
  }

  //获取所有在npm上可供monaco-editor使用的库
  fetchAllPackageInNPM() {
    var author = 'danding'
    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['search', '=' + author, '--registry=https://registry.npmjs.org'], { cwd: '/users/danding/Documents/WebstormProj/react-native-proj/rnLifeMuseum' });


    free.stdout.on('data', function (data) {
      // 数据->打印到控制台
      global.win.webContents.send('search', { data: data + '' })
    });

    free.stderr.on('data', function (data) {
      // 错误->打印到控制台
      global.win.webContents.send('search', { error: data + '' })
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('search', { terminate: 'child process eixt ,exit:' + code })
    });

  }

  //异步搜索目前dingol03发布的组件 
  searchAllPackageByName() {
    var author = 'dandingol03'
    var spawn = require('child_process').spawn;
    var free = spawn('npm', ['search', '=' + author, '--registry=https://registry.npmjs.org'], { cwd: '/users/danding/Documents/WebstormProj/react-native-proj/rnLifeMuseum' });


    free.stdout.on('data', function (data) {
      // 数据->打印到控制台
      global.win.webContents.send('console', '\n' + data)
    });

    free.stderr.on('data', function (data) {
      // 错误->打印到控制台
      global.win.webContents.send('console', '\n' + data)
    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'std:\n' + 'child process eixt ,exit:' + code)
    });

  }

  //安装依赖
  installNpmByPackageJS() {

    var spawn = child_process.spawn;
    var free = spawn('npm', ['install', 'react-native-actionsheet'], { cwd: '/users/danding/Documents/WebstormProj/react-native-proj/sportsApp' });

    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', '\n' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', '\n' + data)

    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', '\n' + 'child process eixt ,exit:' + code)
    });

  }

  //打离线android包
  packageAndroidOffline() {
    var spawn = child_process.spawn;
    var free = spawn('react-native', ['bundle', '--platform', 'android', '--dev', 'false', '--entry-file', 'index.android.js', '--bundle-output',
      'android/app/src/main/assets/index.android.bundle', '--assets-dest',
      'android/app/src/main/res/'],
      { cwd: '/users/danding/Documents/WebstormProj/react-native-proj/rnLifeMuseum' });

    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
      global.win.webContents.send('console', 'std:\n' + data)
    });
    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
      global.win.webContents.send('console', 'std:\n' + data)

    });
    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
      global.win.webContents.send('console', 'std:\n' + 'child process eixt ,exit:' + code)
    });

  }

  //执行ls命令
  ls(payload, respond) {
    try {
      var spawn = child_process.spawn
      var free = spawn('ls', [], { cwd: '/users/danding/Documents/WebstormProj/react-native-proj/rnLifeMuseum' });

      // 捕获标准输出并将其打印到控制台
      free.stdout.on('data', function (data) {
        console.log('standard output:\n' + data);
      });
      // 捕获标准错误输出并将其打印到控制台
      free.stderr.on('data', function (data) {
        console.log('standard error output:\n' + data);
        Logger.error(e)
        respond(onError(err))
      });
      // 注册子进程关闭事件
      free.on('exit', function (code, signal) {
        console.log('child process eixt ,exit:' + code);
      });

      respond({ type: 'LS', data: null })

    } catch (e) {
      Logger.error(e)
      respond(onError(err))
    }
  }

  //创建文件夹
  createDirectory(payload, respond) {

    var { directoryPath } = payload
    //检查是否文件夹已存在
    FileSystem.exists(directoryPath).then((json) => {
      if (json.re == 1)//如果已经存在
      {
        respond({ type: CREATE_DIRECTORY, re: 2 })
      } else {
        //进行创建
        FileSystem.makeDir(directoryPath).then((json) => {
          if (json.re == 1)//创建成功
          {
            respond({ type: CREATE_DIRECTORY, re: 1 })
          } else {
            respond({ type: CREATE_DIRECTORY, re: -1 })
          }
        })

      }

    }).catch((e) => {
      Logger.error(e)
      respond(onError(err))
    })

  }

  //创建文件(业务性质)
  createFile(payload, respond) {

    const filePath = payload.path

    makeFile(filePath).then((json) => {
      if (json.re == 1) {
        //写入文件
        _fs.writeFile(filePath, payload.data, {
          mode: '0755'
        }, (err) => {
          if (err) {
            Logger.error(err)
            respond(onError('Failed to create new file'))
            return
          }
          const pathObj = buildPathObjects(filePath)
          respond(onFileCreated(pathObj, payload.data))
        })
      } else {
        Logger.error(err)
        respond(onError('Failed to create new file'))
      }
    })
  }

  //删除文件
  deleteFile(payload, respond) {
    var { filePath } = payload

    fs.unlink(filePath, (err) => {
      if (err) {
        Logger.error(err)
        respond(onError('Failed to delete file'))
        return
      }
      respond({ type: DELETE_FILE, re: 1 })
    })
  }

  //删除文件夹
  deleteFolder(payload, respond) {
    var { directoryPath } = payload
    fs.remove(directoryPath, (err) => {
      if (err) {
        Logger.error(err)
        respond(onError("Failed to delete folder"))
        return
      }
      respond({ type: DELETE_FOLDER, re: 1 })

    })
  }




  //写入文件内容
  writeFileData(payload, respond) {
    try {
      if (!payload.path) return
      var absolutePath = payload.path
      FileSystem.writeFile(absolutePath, payload.data, {
        success: () => {
          respond({ type: WRITE_FILE_DATA })
        }, error: (err) => {
          Logger.error(err)
          respond({
            type: 'Error',
            data: err
          })
          return
        }
      })
    } catch (e) {
      Logger.error(e)
    }
  }


  //生成.monaco文件夹并存储library的组件信息
  backupMonacoDirectory(payload, respond) {
    try {

      //查看是否工程路径有.monaco文件夹
      FileSystem.exists(path.resolve(payload.rootPath, './.monaco')).then((json) => {
        if (json.re == 1)//如果已经存在
        {
          backupMonacoFiles({ metalist: payload.metalist, path: path.resolve(payload.rootPath, './.monaco') }).then((json) => {
            respond({
              type: 'ON_LIBRARY_BACKUP'
            })
          })
        }
        else {
          //TODO:创建目标文件夹
          FileSystem.makeDir(path.resolve(payload.rootPath, './.monaco')).then((json) => {
            if (json.re == 1)//创建成功
            {
              backupMonacoFiles({ metalist: payload.metalist, path: path.resolve(payload.rootPath, './.monaco') }).then((json) => {
                respond({
                  type: 'ON_LIBRARY_BACKUP'
                })
              })
            }
          })
        }
      })

    } catch (e) {
      Logger.error(e)
      respond(onError(e))
    }
  }

  searchInProj(payload, respond) {
    try {
      var { rootPath, searchText } = payload;
      //进行宽度搜索
      var statistics = {
        data: []
      }
      breadthFirstSearch(searchText, rootPath, statistics)
      respond(onTextSearchInProj(statistics.data))
    } catch (e) {
      Logger.error(e)
      respond(onError(e))
    }
  }

  //获取git信息
  fetchGitStatus(payload, respond) {
    try {
      var { rootPath } = payload;
      git(rootPath).status(function (err, data) {
        respond({
          type: FETCH_GIT_STATUS,
          data
        })
        Logger.info('git status->' + data)
      })
    } catch (e) {
      Logger.error(e)
      respond(onError(e))
    }
  }

  //加入本地仓库
  commitToLocalRepo(payload, respond) {
    try {
      var { rootPath } = payload;
      git(rootPath)
        .commit("danding commit!", function (err, data) {
          respond({
            type: COMMIT_TO_LOCAL_REPO,
            data
          })
        })

    } catch (e) {
      Logger.error(e)
      respond(onError(E))
    }
  }

  //推至远程仓库
  pushToRemote(payload, respond) {
    try {
      var { rootPath } = payload;
      git(rootPath)
        .push('origin', 'master', function (err, data) {
          respond({
            type: PUSH_TO_REMOTE,
            data
          })
        })

    } catch (e) {
      Logger.error(e)
      respond(onError(E))
    }
  }

  //获取最新commit和本地版本库的区别
  fetchGitDiffStaged(payload, respond) {
    try {
      var { rootPath } = payload;
      git(rootPath).diffSummary(['--staged'], function (err, data) {
        respond({
          type: FETCH_GIT_DIFF_STAGED,
          data
        })

      })
    } catch (e) {
      Logger.error(e)
      respond(onError(e))
    }
  }

  addToGitIndex(payload, respond) {
    try {
      var { filePath } = payload;
      git(rootPath).add([filePath], function (err, data) {
        respond({
          type: ADD_TO_GIT_INDEX,
          data
        })
        Logger.info('git status->' + data)
      })
    } catch (e) {
      Logger.error(e)
      respond(onError(e))
    }
  }


  //当WebContent发出GET_FILE_DATA时，bridge的响应函数
  //payload.path是字符串的数组,需要把它规范化后读出
  readFileData(payload, respond) {
    try {


      //verifyPayload,check if field 'path' is valid
      verifyPayload(payload);

      payload.path = formatPayloadPath(payload.path)
      if (!payload) return

      FileSystem.readFile(payload.path, {
        success: (data) => {
          //payload.path是规范后的路径
          const pathObj = buildPathObjects(payload.path)
          //将该文件的绝对路径存入pathList,TODO:判断是否该变量全局
          pathList[payload.path] = true

          var jsonReg = /(.*?)\.json$/
          if (jsonReg.exec(payload.path) != null && jsonReg.exec(payload.path)[1] != null) {
            respond(onFileData(pathObj, data.toString('utf8')))
          } else {
            //生成liveValues
            parser.parse(payload.path).then((json) => {

              var metadata = null;

              if (json.re == 1)
                metadata = json.data;//元数据=>{body,ranges}
              var rootPath = payload.rootPath;
              var metadataPath = path.join(formatPayloadPath(rootPath), '.monaco', 'metadata', formatPayloadPath(payload.path).replace(rootPath, '') + '.monaco')

              //创建元数据文件,已做是否新建检查
              buildMetadataFilePath(payload.path, rootPath).then((json) => {

                FileSystem.exists(metadataPath).then((re) => {
                  if (re == 1) {
                    //元数据文件已存在
                    //respond(onFileData(pathObj, data.toString('utf8')))
                  } else {
                  }
                  //写入元数据文件
                  FileSystem.writeFile(metadataPath, JSON.stringify(metadata), {
                    success: () => {
                      //再进行元数据文件的读取, 多此一举
                      respond(onFileData(pathObj, data.toString('utf8')))
                    },
                    error: (err) => {
                      Logger.error(err);
                      respond(onError(err))
                    }
                  })
                });
              })

            })
          }


        }, error: (err) => {
          respond(onError(err))
        },
      })
    } catch (e) {
      Logger.error(e)
    }
  }

  //读取该源代码文件的组件树信息
  readFileSyntaxTree(payload, respond) {
    try {


      //verifyPayload,check if field 'path' is valid
      verifyPayload(payload);

      payload.path = formatPayloadPath(payload.path)
      if (!payload) return

      FileSystem.readFile(payload.path, {
        success: (data) => {
          //payload.path是规范后的路径
          const pathObj = buildPathObjects(payload.path)
          //将该文件的绝对路径存入pathList,TODO:判断是否该变量全局
          pathList[payload.path] = true
          //生成liveValues
          parser.parse(payload.path).then((json) => {

            var metadata = null;
            if (json.re == 1)
              metadata = json.data;//元数据=>{body,ranges}

            respond({
              type: GET_FILE_DATA,
              data: {
                content: data,
                syntaxTree: metadata
              }
            })

          })
        }, error: (err) => {
          respond(onError(err))
        },
      })
    } catch (e) {
      Logger.error(e)
    }
  }



  readFileMetadata(payload, respond) {
    try {
      verifyPayload(payload)
      //函数buildMetadataFilePath主要用于搜索是否含.deco路径，有则获取元信息
      buildMetadataFilePath(getPathFromId(payload.path), payload.rootPath).then((json) => {
        if (json.re == 1) {
          payload.path = json.data;
          if (!payload) return
          //因为monaco支持直接讲元文件的位置格式化
          FileSystem.readFile(payload.path, {
            success: (data) => {
              const pathObj = buildPathObjects(payload.path)
              pathList[payload.path] = true

              respond(onFileMetadata(pathObj, data.toString('utf8')))
            }, error: (err) => {
              respond(onError(err))
            },
          })
        }
      });

    } catch (e) {
      Logger.error(e)
    }
  }

  //读取目录的子路径数据
  asyncListSubPaths(payload, respond) {
    try {
      verifyPayload(payload)
      payload.path = formatPayloadPath(payload.path)
      if (!payload) return // TODO: this will error. what's intended?



      const pathObj = buildPathObjects(payload.path)
      Logger.info('path->' + payload.path)
      if (fs.isDirectorySync(payload.path)) {
        //TODO:get fs stats info
        _fs.readdir(payload.path, function (err, files) {
          if (err) {
            Logger.error(e)
            respond(onError(err))
          }


          var dirs = []
          var docs = []
          files.map((file, i) => {
            var stat = _fs.statSync(path.resolve(payload.path, file))
            var reg = /^\..*$/
            if (reg.exec(file)) {
            } else {
              if (stat.isDirectory()) {
                dirs.push({ filename: file, type: 'folder', collapsed: true })
              } else {
                docs.push({ filename: file, type: 'file' })
              }
            }
          })

          respond({
            re: 1,
            data: {
              files: dirs.concat(docs)
            }
          })

        })

      } else {
        respond({

        })
      }
    } catch (e) {
      Logger.error(e)
    }
  }



}
const handler = new FileHandler()
module.exports.fileHandler = handler;

