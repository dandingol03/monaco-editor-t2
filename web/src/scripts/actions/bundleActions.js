import _ from 'lodash'
import request from '../ipc/Request'
import {
    LS
} from '../../../../public/constants/ipc/fileConstants'



export function getLs(absolutePath) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        request({
            type: LS
        }).then((payload) => {
            debugger
            resolve(payload)
          }).catch((e)=>{
              console.error(e)
          })
      })
    }
}