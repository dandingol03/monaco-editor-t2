import _ from 'lodash'
import Utils from '../utils/ArrayUtils'
import Config from '../../../../config'
import request from '../ipc/Request'
import {
    INQUIRE_SWITCH_TO_NEW_PROJECT
} from '../constants/projectConstants'

//获取工程根路径
export const getProjPath=()=>{
    return Config.proj
}

function _inquireSwitchToNewProject(projPath) {
    return {
        type: INQUIRE_SWITCH_TO_NEW_PROJECT,
        projPath
    }
}

//询问是否切入新的工程
export const inquireSwitchToNewProject = (projPath) => {
    return (dispatch) => {
        return new Promise((resolve, reject) => {

            request(_inquireSwitchToNewProject(projPath)).then((json) => {
                resolve(json)
            })

        })
    }
}