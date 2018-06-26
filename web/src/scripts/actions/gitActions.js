
import _ from 'lodash'
import request from '../ipc/Request'
import {
  FETCH_GIT_STATUS,
  ADD_TO_GIT_INDEX,
  FETCH_GIT_DIFF_STAGED,
  SYNC_NODES_MODIFIED,
  SYNC_GIT_STATUS,
  COMMIT_TO_LOCAL_REPO,
  PUSH_TO_REMOTE,
  SET_GIT_STATUS_BUSY,
  SET_GIT_STATUS_IDLE
} from '../constants/gitConstants';


function _fetchGitStatus(rootPath) {
  return {
    type: FETCH_GIT_STATUS,
    rootPath
  }
}


//获取git status
export function fetchGitStatus(rootPath) {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {

      request(_fetchGitStatus(rootPath)).then((payload) => {
        if(payload.data)
          resolve({ re: 1, data: payload.data })
        else
          resolve({ re: -1})
      })
    })
  }
}

function _fetchGitDiffInStaged(rootPath) {
  return {
    type: FETCH_GIT_DIFF_STAGED,
    rootPath
  }
}

//获取gitDiffInStaged
export function fetchGitDiffInStaged(rootPath) {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {

      request(_fetchGitDiffInStaged(rootPath)).then((payload) => {
        resolve(payload)
      })
    })
  }
}

function _addToGitIndex(filePath) {
  return {
    type: ADD_TO_GIT_INDEX,
    filePath
  }
}

//加入git缓冲区
export function addToGitIndex(filePath) {
  return new Promise((resolve, reject) => {

    request(_addToGitIndex(filePath)).then((payload) => {
      //TODO:将其状态改为绿色
      resolve(payload)
    })
  })
}

function _commitToLocalRepo(rootPath) {
  return {
    type: COMMIT_TO_LOCAL_REPO,
    rootPath
  }
}

//commit至本地repo
export function commitToLocalRepo() {

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      var rootPath = getState().directory.rootPath
      request(_commitToLocalRepo(rootPath)).then((payload) => {
        debugger
        //TODO:将其状态改为绿色
        resolve(payload)
      })
    })
  }
}

function _pushToRemote(rootPath) {
  return {
    type: PUSH_TO_REMOTE,
    rootPath
  }
}

//push本地repo至远程
export function pushToRemote() {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      var rootPath = getState().directory.rootPath
      dispatch(setGitStatusBusy())
      request(_pushToRemote(rootPath)).then((payload) => {
        dispatch(setGitStatusIdle())
        resolve(payload)
      })
    })
  }
}


//设置文件基于git标记为已改动
export const syncGitStatus = (modified, not_added, staged) => {
  return (dispatch) => {
    dispatch({
      type: SYNC_GIT_STATUS,
      payload: {
        modified,
        not_added,
        staged
      }
    })
  }
}

//设置git业务忙
export const setGitStatusBusy = () => {
  return (dispatch) => {
    dispatch({
      type: SET_GIT_STATUS_BUSY,
      payload: {
      }
    })
  }
}

export const setGitStatusIdle=()=>{
  return (dispatch) => {
    dispatch({
      type: SET_GIT_STATUS_IDLE,
      payload: {
      }
    })
  }
}


