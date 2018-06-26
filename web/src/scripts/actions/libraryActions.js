
import Proxy from '../utils/Proxy';
import Config from '../../../../config';
import request from '../ipc/Request'
import {
    ON_LIBRARY_METALIST_FETCHED,
    FETCH_LIBRARY_METALIST,
    BACKUP_MONACO_DIR,
    CACHE_LIBRARY_TEMPLATE,
    CACHE_LIBRARY_TPL,
    CACHE_ALL_LIBRARY_TPL
} from '../constants/libraryConstants';


export const onLibraryMetalistFetched = (metalist) => {
    return (dispatch, getState) => {
        dispatch({
            type: ON_LIBRARY_METALIST_FETCHED,
            payload: {
                metalist
            }
        })
    }
}


export const fetchLibraryMetalist = (payload) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            Proxy.postes({
                url: Config.server + '/fetchReactNativeMetalist',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                }
            }).then((json) => {
                if (json.re == 1) {
                    resolve(json)
                }
            }).catch((e) => {
                reject(e)
            })
        })
    }
}

//获取组件库的特定组件代码文本
export const fetchLibraryTemplate = (type) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            Proxy.postes({
                url: Config.server + '/fetchReactNativeLibrary',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    request: type
                }
            }).then((json) => {
                if (json.re == 1) {
                    resolve(json)
                }
            }).catch((e) => {
                reject(e)
            })
        })
    }
}

//拉取特定组件的编译模板文件
export const fetchLibraryTpl = (type) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            Proxy.postes({
                url: Config.server + '/fetchReactNativeTpl',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    request: type
                }
            }).then((json) => {
                if (json.re == 1) {
                    resolve(json)
                }
            }).catch((e) => {
                reject(e)
            })
        })
    }
}

//获取所有组件的模板文件
export const fetchAllLibraryTpls = (type) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            Proxy.postes({
                url: Config.server + '/fetchAllLibraryTpls',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    request: type
                }
            }).then((json) => {
                if (json.re == 1) {
                    resolve(json)
                }
            }).catch((e) => {
                reject(e)
            })
        })
    }
}


//缓存特定组件的模板代码
export const cacheLibraryTemplate = (name, template, childLineBegin) => {
    return (dispatch, getState) => {
        dispatch({
            type: CACHE_LIBRARY_TEMPLATE,
            payload: {
                name,
                template,
                childLineBegin
            }
        })
    }
}

//缓存特定组件的编译模板
export const cacheLibraryTpl = (name, tpl) => {
    return (dispatch, getState) => {
        dispatch({
            type: CACHE_LIBRARY_TPL,
            payload: {
                name,
                tpl,
            }
        })
    }
}

//缓存所有组件的编译模板
export const cacheAllLibraryTpl = ( tpls) => {
    return (dispatch, getState) => {
        dispatch({
            type: CACHE_ALL_LIBRARY_TPL,
            payload: {
                tpls
            }
        })
    }
}

export const fetchPageTemplate = (type, name) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {


            var filename=name
            if(filename.indexOf('.js')!=-1)
                filename=filename.replace('.js','')

            Proxy.postes({
                url: Config.server + '/fetchRNPageTemplate',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    type,
                    className: filename
                }
            }).then((json) => {
                if (json.re == 1) {
                    resolve(json)
                }
            }).catch((e) => {
                reject(e)
            })
        })
    }
}



//备份monaco组件库信息
function _backupMonacoDir(metalist, rootPath) {
    return {
        type: BACKUP_MONACO_DIR,
        metalist,
        rootPath
    }
}

export function backupMonacoDirectory(metalist) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            const state = getState()

            request(_backupMonacoDir(metalist, state.directory.rootPath)).then((payload) => {

                resolve(payload);
            })

        });
    }
}