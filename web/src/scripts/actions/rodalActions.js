
import request from '../ipc/Request'
import Proxy from '../utils/Proxy';
import Config from '../../../../config';
import {
    MAKE_RODAL_VISIBLE,
    MAKE_RODAL_UNVISIBLE,
    MAKE_NPM_PACKAGES_VISIBLE,
    MAKE_NPM_PACKAGES_UNVISIBLE,
    MKAE_GITHUB_REPOS_VISIBLE,
    MAKE_GITHUB_REPOS_UNVISIBLE,
    MAKE_PROJECT_CONFIG_VISIBLE,
    MAKE_PROJECT_CONFIG_UNVISIBLE,
    NEW_PROJECT_BY_CONFIG_INFO,
    MAKE_DIRECTORY_RODAL_VISIBLE,
    MAKE_DIRECTORY_RODAL_UNVISIBLE,
    MAKE_FIELDS_RODAL_UNVISIBLE,
    MAKE_FIELDS_RODAL_VISIBLE,
    MAKE_RENDER_ROW_RODAL_VISIBLE,
    MAKE_RENDER_ROW_RODAL_UNVISIBLE,
    MAKE_LISTVIEW_TEMPLATE_RODAL_VISIBLE,
    MAKE_LISTVIEW_TEMPLATE_RODAL_UNVISIBLE,
    MAKE_COMPONENTS_INSTALL_VISIBLE,
    MAKE_COMPONENTS_INSTALL_UNVISIBLE,
    MAKE_SAVE_FILE_UNVISIBLE,
    MAKE_SAVE_FILE_VISIBLE,
    CREATE_DIRECTORY,
    MAKE_LIBRARY_WARNING_UNVISIBLE,
    MAKE_LIBRARY_WARNING_VISIBLE
} from '../constants/rodalConstants';

//open listview-template modal
export const makeListViewTemplateRodalVisible = (haff) => {
    return {
        type: MAKE_LISTVIEW_TEMPLATE_RODAL_VISIBLE,
        payload: {
            haff
        }
    }
}

//close listview-template modal
export const makeListViewTemplateRodalUnVisible = () => {
    return {
        type: MAKE_LISTVIEW_TEMPLATE_RODAL_UNVISIBLE,
        payload: {}
    }
}

//open fields modal
export const makeFieldsRodalVisible = (haff) => {
    return {
        type: MAKE_FIELDS_RODAL_VISIBLE,
        payload: {
            haff
        }
    }
}

//close fields modal
export const makeFieldsRodalUnVisible = () => {
    return {
        type: MAKE_FIELDS_RODAL_UNVISIBLE,
        payload: {}
    }
}

//open renderRow modal
export const makeRenderRowRodalVisible = (haff) => {
    return {
        type: MAKE_RENDER_ROW_RODAL_VISIBLE,
        payload: {
            haff
        }
    }
}

//close renderRow modal
export const makeRenderRowRodalUnVisible = () => {
    return {
        type: MAKE_RENDER_ROW_RODAL_UNVISIBLE,
        payload: {}
    }
}



//rodal open
export const makeRodalVisible = (payload) => {
    return {
        type: MAKE_RODAL_VISIBLE,
        payload: {
        }
    }
}

//rodal close
export const makeRodalUnVisible = (payload) => {
    return {
        type: MAKE_RODAL_UNVISIBLE,
        payload: {}
    }
}

//directory rodal open
export const makeDirectoryRodalVisible = () => {
    return {
        type: MAKE_DIRECTORY_RODAL_VISIBLE,
        payload: {
        }
    }
}

//directory rodal close
export const makeDirectoryRodalUnVisible = (payload) => {
    return {
        type: MAKE_DIRECTORY_RODAL_UNVISIBLE,
        payload: {
        }
    }
}

//创建文件夹
export const createDirectory = (directoryPath) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            
            const state = getState()
            var projPath=state.directory.rootPath

            request({
                type: CREATE_DIRECTORY,
                directoryPath,
                projPath
            }).then((payload) => {

                resolve(payload)
            })
        })
    }
}

//打开工程配置面板
export const makeProjectConfigVisible = () => {
    return {
        type: MAKE_PROJECT_CONFIG_VISIBLE,
        payload: {}
    }
}

//关闭工程配置面板
export const makeProjectConfigUnVisible = () => {
    return {
        type: MAKE_PROJECT_CONFIG_UNVISIBLE,
        payload: {}
    }
}

//创建工程
export const newProjectByConfigInfo = (projName, projPath) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            request({
                type: NEW_PROJECT_BY_CONFIG_INFO,
                projName,
                projPath
            }).then((payload) => {

                resolve(payload)
            })
        })
    }
}

//打开保存文件对话框
export const makeSaveFileVisible=()=>{
    return {
        type:MAKE_SAVE_FILE_VISIBLE
    }
}

//关闭保存文件对话框
export const makeSaveFileUnVisible=()=>{
    return {
        type:MAKE_SAVE_FILE_UNVISIBLE
    }
}

//打开常用组件的安装面板
export const makeComponentsInstallVisible=()=>{
    return {
        type: MAKE_COMPONENTS_INSTALL_VISIBLE,
        payload: {}
    }
}

//关闭常用组件的安装面板
export const makeComponentsInstallUnVisible=()=>{
    return {
        type: MAKE_COMPONENTS_INSTALL_UNVISIBLE,
        payload: {}
    }
}

//打开库自动安装警告
export const makeLibraryWarningVisible=(npmName)=>{
    return {
        type:MAKE_LIBRARY_WARNING_VISIBLE,
        payload:{
            npmName
        }
    }
}

//关闭库自动安装警告
export const makeLibraryWarningUnVisible=()=>{
    return {
        type:MAKE_LIBRARY_WARNING_UNVISIBLE,
        payload:{}
    }
}

//打开npm库配置面板
export const makeNPMPackagesVisible = () => {
    return {
        type: MAKE_NPM_PACKAGES_VISIBLE,
        payload: {}
    }
}

//关闭npm库面板
export const makeNPMPackagesUnVisible = () => {
    return {
        type: MAKE_NPM_PACKAGES_UNVISIBLE,
        payload: {}
    }
}

//打开github repos 面板
export const makeGithubReposVisible=()=>{
    return {
        type:MKAE_GITHUB_REPOS_VISIBLE,
        payload:{}
    }
}

//关闭github repos面板
export const makeGithubReposUnvisible=()=>{
    return {
        type:MAKE_GITHUB_REPOS_UNVISIBLE,
        payload:{}
    }
}

//获取特定npm库的信息
export const fetchNPMPackageInfo = (name) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {


            Proxy.postes({
                url: Config.server + '/fetchNPMPackageInfo',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    name,
                }
            }).then((json) => {

                resolve(json)
            }).catch((e) => {
                reject(e)
            })
        })
    }
}

//提交特定npm库的配置信息
export const applyNPMPackageConfigInfo = (payload) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {


            Proxy.postes({
                url: Config.server + '/applyNPMPackageConfigInfo',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: payload
            }).then((json) => {

                resolve(json)
            }).catch((e) => {
                reject(e)
            })
        })
    }
}


//获取模板-组件树
export const fetchTemplateComponentTree = (name) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            Proxy.postes({
                url: Config.server + '/fetchTemplateComponentTree',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    name
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
