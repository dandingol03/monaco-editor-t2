
import _ from 'lodash'
import request from '../ipc/Request'
import {
    GET_MONACO_EDITOR_PACKAGES,
    ON_NPM_SEARCH_DATA,
    ON_NPM_SEARCH_ERROR,
    INTERGRATE_REDUX,
    INTERGRATE_WITH_LIBRARY,
    INTERGRATE_WITH_LIBRARY_IN_BATCH,
    INQUIRE_LIBRARY_INSTALLED,
    SEARCH_REPO,
    ON_CACHE_REPO
} from '../constants/npmConstants';
import {
    getProjPath
} from '../actions/projectActions'
import { resolve } from 'url';
const { ipcRenderer } = require('electron')


export function makeNPMSeachBegin() {
    return (dispatch, getState) => {
        dispatch({
            type: GET_MONACO_EDITOR_PACKAGES,
            payload: {}
        })
    }
}

function _inquireLibraryInstalled(projPath, libraryName) {
    return {
        type: INQUIRE_LIBRARY_INSTALLED,
        projPath,
        libraryName

    }
}


//询问该库是否安装
export const inquireLibraryInstalled = (projPath, libraryName) => {
    return (dispatch) => {
        return new Promise((resolve, reject) => {

            request(_inquireLibraryInstalled(projPath, libraryName)).then((json) => {
                resolve(json)
            })

        })
    }
}

function _intergrateWithLibrary(projPath, npmName) {
    return {
        type: INTERGRATE_WITH_LIBRARY,
        projPath,
        npmName

    }
}

//安装特定库
export const intergrateWithLibrary = (projPath, npmName) => {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            request(_intergrateWithLibrary(projPath, npmName)).then((json) => {
                resolve(json)
            })
        })
    }
}

function _intergrateWithLibraryInBatch(projPath, npmNames) {
    return {
        type: INTERGRATE_WITH_LIBRARY_IN_BATCH,
        projPath,
        npmNames

    }
}

//批量安装特定库
export const intergrateWithLibraryInBatch = (npmNames) => {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            request(_intergrateWithLibraryInBatch(getProjPath(), npmNames)).then((json) => {
                resolve(json)
            })
        })
    }
}

function _searchRepo(username) {
    return {
        type: SEARCH_REPO,
        username
    }
}

//search github repo
export const searhRepo = (username) => {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            request(_searchRepo(username)).then((json) => {
                resolve(json)
            }).catch((e) => {
                reject(e)
            })
        })
    }
}

//cache github repo 
export const cacheRepos = (repos) => {
    return (dispatch, getState) => {
        dispatch({
            type: ON_CACHE_REPO,
            payload: {
                repos
            }
        })
    }
}



//发送项目路径以便配置redux
export function intergrateRedux(projPath) {
    return (dispatch, getState) => {

        request({ type: INTERGRATE_REDUX, projPath }).then((payload) => {
            debugger
        })
    }
}

//开始搜索可用库
export function getMonacoEditorPackages() {
    return (dispatch, getState) => {
        request({ type: GET_MONACO_EDITOR_PACKAGES, payload: {} }).then((payload) => {
        })
    }
}

//获取到搜索结果
export function onGetNPMSeachMessage(message) {
    return (dispatch, getState) => {

        if (message && message.data != null) {
            dispatch({
                type: ON_NPM_SEARCH_DATA,
                payload: {
                    data: message.data
                }
            })
        } else if (message && message.error != null) {
            dispatch({
                type: ON_NPM_SEARCH_ERROR,
                payload: {
                    data: message.error
                }
            })
        }

    }
}
