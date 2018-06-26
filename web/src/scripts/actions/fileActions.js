
import Proxy from '../utils/Proxy';
import Config from '../../../../config';
import request from '../ipc/Request'
import { openDocument } from '../actions/editorActions'
import {
  DIRECTORY_EXPAND,
  DIRECTORY_FOLD,
  FETCH_SUB_PATH,
  ON_ROOT_PATH_UPDATE,
  ON_PROJ_PATH_SET,
  ON_FILE_CLICK,
  BACK_TO_PREV,
  CREATE_FILE,
  SAVE_FILE,
  WRITE_FILE_DATA,
  DELETE_FILE,
  DELETE_FOLDER
} from '../constants/fileConstants';
import {
  _getFileMetadata
} from '../actions/metadataActions';


const path = Electron.remote.require('path')
function getPathRoot(absolutePath) {
  return path.basename(absolutePath)
}


export const SET_TOP_DIR = 'SET_TOP_DIR'
export const _setTopDir = (rootPath) => {
  return {
    type: SET_TOP_DIR,
    rootPath: rootPath,
    rootName: getPathRoot(rootPath),
  }
}

export function setTopDir(rootPath) {
  return (dispatch) => {
    //const setProject = () => {
    dispatch(_setTopDir(rootPath))
    //   dispatch(fetchSubPath({
    //     absolutePath: rootPath
    //   }))
    //}

    // request(_watchPath(rootPath)).then(() => {
    //   setProject()
    // }).catch(() => {
    //   request(_watchPath(rootPath)).then(() => {
    //     setProject()
    //   })
    // })
  }
}




//创建文件
export const createFile = (path, data) => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {

      request(_createFile(path, data)).then((json) => {

        resolve(json)
      })

    })
  }
}


//打开文件
export const openFile = (file) => (dispatch, getState) => {
  dispatch(openDocument(file)).then(() => {
    //this branch work
    dispatch(addTab(CONTENT_PANES.CENTER, file.id))
    dispatch(clearSelections())
    //TODO:make this file added to navigate stack
    dispatch(navigateForward({ id: file.id }));
    dispatch(selectFile(file.id))
  }).catch(() => {

    dispatch(addTab(CONTENT_PANES.CENTER, file.id))
    dispatch(clearSelections())
    dispatch(navigateForward({ id: file.id }));
    dispatch(selectFile(file.id))
  })
}




const _saveFile = (path, data) => {
  return {
    type: WRITE_FILE_DATA,
    path,
    data
  }
}

//读取文件语法生成树 信息
export const getFileMetadata = (path) => {

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {

      const rootPath = getState().directory.rootPath
      var buf = new Buffer(path);
      var fileId = buf.toString('hex');
      request(_getFileMetadata(fileId, rootPath)).then((payload) => {

        //payload.utf8Data是文件数据
        //alert('data of file ='+payload.utf8Data);

        const json = JSON.parse(payload.utf8Data)
        // const output = {
        //   liveValues: LiveValueUtils.normalizeLiveValueMetadata(json.liveValues)
        // }
        resolve(json)
      }).catch((e) => {
        reject(e)
      })

    })
  }

}


//保存文件
export const saveFile = (path, data) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {

      request(_saveFile(path, data)).then((payload) => {

        resolve(payload)

      }).catch((e) => {
        reject(e)
      })
    })
  }
}


const _foldDir = (haff) => {
  return {
    type: DIRECTORY_FOLD,
    payload: {
      path: haff
    }
  }
}

//文件夹折叠
export const foldDir = (haff) => (dispatch, getState) => {
  dispatch(_foldDir(haff))
}

const _expandDir = (haff) => {
  return {
    type: DIRECTORY_EXPAND,
    payload: {
      path: haff
    }
  }
}

//文件夹展开
export const expandDir = (haff) => (dispatch, getState) => {
  dispatch(_expandDir(haff))
}

//当前结点的子路径内容更新
const _onRootPathUpdate = (files, haff) => {
  return {
    type: ON_ROOT_PATH_UPDATE,
    payload: {
      files,
      haff
    }
  }
}

const _onProjPathSet = (path) => {
  return {
    type: ON_PROJ_PATH_SET,
    payload: {
      path
    }
  }
}

//设定工程的根路径
export const setProjPath = (path) => (dispatch, getState) => {
  dispatch(_onProjPathSet(path))
}


const _activateFile = (payload) => {
  return {
    type: ON_FILE_CLICK,
    payload: payload
  }
}

//文件选中
export const activateFile = (haff) => (dispatch, getState) => {
  dispatch(_activateFile({ path: haff }))
}

function _fetchSubPath(path) {
  return {
    type: FETCH_SUB_PATH,
    path,
  }
}

function _createFile(path, data) {
  return {
    type: CREATE_FILE,
    path,
    data
  }
}

//读取路径数据
export const fetchSubPath = (fileInfo) => {
  return (dispatch) => {

    return new Promise((resolve, reject) => {
      request(_fetchSubPath(fileInfo.absolutePath)).then((json) => {

        if (json.re == 1) {
          var { files } = json.data
          var { haff } = fileInfo
          dispatch(_onRootPathUpdate(files, haff))
        }
        resolve(json)
      })
    })

  }
}

//返回上个文件选中
export const backToPrev = () => {
  return (dispatch) => {
    dispatch({
      type: BACK_TO_PREV,
      payload: {
      }
    })
  }
}

//删除文件夹
export const deleteFolder=(directoryPath)=>{
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        request({
          type:DELETE_FOLDER,
          directoryPath
        }).then((payload)=>{
          resolve(payload)
        })
    })
  }
}

//删除文件
export const deleteFile=(filePath)=>{
  return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
          request({
              type: DELETE_FILE,
              filePath,
          }).then((payload) => {

              resolve(payload)
          })
      })
  }
}
