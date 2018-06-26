import _ from 'lodash'

import {
    ON_ACTION_SHEET_INIT,
    ON_ACTION_SHEET_DESTROY,
    MAKE_BACK_DROP_UNVISIBLE
} from '../constants/actionSheetConstants'

const _onActionSheetInit=(payload)=>{
    return {
        type: ON_ACTION_SHEET_INIT,
        payload: payload
    }
}

//actionsheet实例回调
export const onActionSheetInit=(ref,haff)=>{
    return (dispatch,getState)=>{
        dispatch(_onActionSheetInit({ref,haff}))
    }
}

const _onActionSheetDestroy=(payload)=>{
    return {
        type: ON_ACTION_SHEET_DESTROY,
        payload: payload
    }
}

//取消actionsheet的登记
export const onActionSheetDestroy=(ref,haff)=>{
    return (dispatch,getState)=>{
        dispatch(_onActionSheetDestroy({ref,haff}))
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