
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
  SAVE_SUCCESSFUL,
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
  DELETE_FILE,
  DELETE_FOLDER
} = FileConstants

var LibraryConstants = require('../../../public/constants/ipc/libraryConstants')

const {
  BACKUP_MONACO_DIR
} = LibraryConstants



let _watcher = null
let watchedPath = null

const pathList = {}


class NpmHandler {

}

const handler = new NpmHandler()
module.exports = handler;
