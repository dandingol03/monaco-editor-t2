
import {
    URI_UPDATE,
    TAB_ACTIVATE,
    TAB_ADD,
    TAB_CHANGED,
    TAB_UNCHANGED,
    TAB_DELETE,
    TAB_CLOSE,
    LAST_TAB_ACTIVATE
} from '../constants/tabConstants';

//选中tab
export const activeTab=(payload)=>{
    return {
        type:TAB_ACTIVATE,
        payload
    }
}


//更新model
export const updateUri=(payload)=>{
    return {
        type:URI_UPDATE,
        payload:payload
    }
}

//新建tab
export const addTab=(payload)=>{
    return {
        type:TAB_ADD,
        payload:payload
    }
}

//删除tab
export const closeTab=(path)=>{
     return {
        type:TAB_CLOSE,
        payload:{
            path:path
        }
    }
}


//对应编辑器内容改变，设置tab为changed
export const makeTabChanged=(payload)=>{
    return {
        type:TAB_CHANGED,
        payload:payload
    }
}

//编辑器内容通过undo回复到origin value
export const makeTabUnChanged=(payload)=>{
      return {
        type:TAB_UNCHANGED,
        payload:payload
    }
}

//选中最后一个tab页
export const makeLastTabActive=()=>{
       return {
        type:LAST_TAB_ACTIVATE,
        payload:{}
    }
}