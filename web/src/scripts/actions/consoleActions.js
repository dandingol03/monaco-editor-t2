
import _ from 'lodash'
import request from '../ipc/Request'
import {
    ON_GET_NEW_LOG,
    MAKE_CONSOLE_VISIBLE,
    MAKE_CONSOLE_UNVISIBLE
} from '../constants/consoleConstants';

//显示控制台
export const makeConsoleVisible = ()=>{
    return (dispatch, getState) => {
        dispatch({
            type:MAKE_CONSOLE_VISIBLE,
            payload:{}
        })
    }
}

//关闭控制台
export const makeConsoleUnvisible=()=>{
    return (dispatch, getState) => {
        dispatch({
            type:MAKE_CONSOLE_UNVISIBLE,
            payload:{}
        })
    }
}

//有新的log记录
export function onGetNewLog(log) {
  return (dispatch, getState) => {
    
      dispatch({
            type:ON_GET_NEW_LOG,
            payload:{log}
      })
  }
}

