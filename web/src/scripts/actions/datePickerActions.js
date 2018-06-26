import _ from 'lodash'

import {
    ON_DATE_PICKER_INIT,
    ON_DATE_PICKER_DESTROY,
    MAKE_BACK_DROP_VISIBLE,
    MAKE_BACK_DROP_UNVISIBLE,
    MAKE_DATE_PICKER_MODAL_VISIBLE,
    MAKE_DATE_PICKER_MODAL_INVISIBLE
} from '../constants/datePickerConstants'

const _onDatePickerInit=(payload)=>{
    return {
        type: ON_DATE_PICKER_INIT,
        payload: payload
    }
}

//datePicker实例回调
export const onDatePickerInit=(ref,haff)=>{
    return (dispatch,getState)=>{
        dispatch(_onDatePickerInit({ref,haff}))
    }
}

const _onActionSheetDestroy=(payload)=>{
    return {
        type: ON_DATE_PICKER_DESTROY,
        payload: payload
    }
}

//取消datePicker的登记
export const onDatePickerDestroy=(ref,haff)=>{
    return (dispatch,getState)=>{
        dispatch(_onActionSheetDestroy({ref,haff}))
    }
}

const _makeDatePickerModalVisible=(payload)=>{
    return {
        type:MAKE_DATE_PICKER_MODAL_VISIBLE,
        payload
    }
}

//显示datePickerModal
export const makeDatePickerModalVisible=(payload)=>{
    return (dispatch,getState)=>{
        dispatch(_makeDatePickerModalVisible(payload))
    }
}

//隐藏datePickerModal
export const makeDatePickerModalInvisible=()=>{
    return (dispatch,getState)=>{
        dispatch({
            type:MAKE_DATE_PICKER_MODAL_INVISIBLE,
            payload:null
        })
    }
}