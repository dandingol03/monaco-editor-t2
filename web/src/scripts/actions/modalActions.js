import _ from 'lodash'

import {
    ON_MODAL_INIT,
    ON_MODAL_DESTROY,
    MAKE_BACK_DROP_UNVISIBLE
} from '../constants/modalConstants'

const _onModalInit=(payload)=>{
    return {
        type: ON_MODAL_INIT,
        payload: payload
    }
}

//modal实例回调
export const onModalInit=(ref,haff)=>{
    return (dispatch,getState)=>{
        dispatch(_onModalInit({ref,haff}))
    }
}

const _onModalDestroy=(payload)=>{
    return {
        type: ON_MODAL_DESTROY,
        payload: payload
    }
}

//取消modal的登记
export const onModalDestroy=(ref,haff)=>{
    return (dispatch,getState)=>{
        dispatch(_onModalDestroy({ref,haff}))
    }
}

//设置backdrop消失
export const makeBackDropUnVisible = () => {
    return (dispatch, getState) => {
        dispatch({
            type: MAKE_BACK_DROP_UNVISIBLE
        })
    }
}