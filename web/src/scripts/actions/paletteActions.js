/**
 * Created by danding on 17/5/11.
 */
import _ from 'lodash'
import Utils from '../utils/ArrayUtils'
import {
    COMPONENT_SELECTED,
    COMPONENT_UNSELECTED,
    MAKE_COMPONENT_SWITCHED,
    COMPONENT_NODE_SELECTED,
    PANEL_SWITCH,
    UPDATE_SELECTED_HAFF,
    STORE_SWITCH_OP
} from '../constants/paletteConstants';

import {
    UPDATE_DOC_STYLE,
    UPDATE_DOC_CUSTOM_PROPERTY
} from '../constants/monacoConstants';

import {
    MAKE_BACK_DROP_VISIBLE
} from '../constants/actionSheetConstants';


//设置无组件选中
export const setComponentUnSelected=()=>{
    return (dispatch, getState) => {
        dispatch({
            type:COMPONENT_UNSELECTED,
            payload:{}
        })
    }
}

//设置组件结点选中
export const selectComponentNode=(haff)=>{
    return(dispatch,getState)=>{
        dispatch({
            type:COMPONENT_NODE_SELECTED,
            payload:{haff}
        })
    }
}

const _setComponentSelected = (component, haff) => {
    return {
        type: COMPONENT_SELECTED,
        payload: {
            component: component,
            haff: haff
        }
    }
}

//选中layoutInflater的某个组件
export const setComponentSelected = (haff) => {
    return (dispatch, getState) => {
        var cache = getState().monaco.docCache;
        var docId = getState().monaco.openDocId;
        var components = cache[docId].components;
        var classMethods=cache[docId].classMethods


        var component = null;
        var parent=null
        if(haff[0]=='classMethods')
            parent= classMethods
        else 
            parent = components;

        
        if(haff[0]=='classMethods')
        {
            for(var i=1;i<haff.length;i++)
            {
                var pa=haff[i]
                component=parent[pa];
                parent=component
            } 
        }else{
            haff.map((pa, i) => {
                component = parent[pa];
                parent = component;
            });
        }

        //actionSheet的点中逻辑
        var flag = false
        var uiInstance = getState().actionSheet.instance
        var keys = _.keys(uiInstance)
        
        if (keys && keys.length > 0) {
            keys.map((refName, i) => {
                var ref = uiInstance[refName]
                if (Utils.compare(ref.haff, haff))
                    flag = true
            })
        }

        //todo:check instance in datepicker 


        dispatch(_setComponentSelected(component, haff));
        if (flag)
            dispatch(makeBackDropVisible())
        
    }
}

//设置组件结点处于交换状态
export const makeComponentSwitched=(haff)=>{
    return (dispatch, getState) => {
        dispatch({
            type:MAKE_COMPONENT_SWITCHED,
            payload:{
                haff
            }})
    }
}

//存储组件交换的操作时序
export const storeSwitchOp=(haff1,haff2)=>{
    return (dispatch, getState) => {
        dispatch({
            type:STORE_SWITCH_OP,
            payload:{
                haff1,
                haff2
            }}) 
    }
}

const _switchPanel = (detail) => {
    return {
        type: PANEL_SWITCH,
        data: detail,
    }
}

export const switchPanel = (detail) => {
    return (dispatch, getState) => {
        dispatch(_switchPanel(detail));
    }
}

const _updateDocStyle = (haff, style) => {
    return {
        type: UPDATE_DOC_STYLE,
        payload: {
            haff,
            style
        }
    }
}

//更新面板样式属性
export const updateDocStyle = (haff, style) => {
    return (dispatch, getState) => {
        dispatch(_updateDocStyle(haff, style))
    }
}

//更新面板的自定义属性
export const updateCustomProperty = (haff, property) => {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_DOC_CUSTOM_PROPERTY,
            payload: {
                haff,
                property
            }
        })
    }
}


//更新选中的haff
export const updateSelectedHaff = (haff) => {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_SELECTED_HAFF,
            payload: {
                haff
            }
        })
    }
}


//设置backdrop显示
const makeBackDropVisible = () => {
    return (dispatch, getState) => {
        dispatch({
            type: MAKE_BACK_DROP_VISIBLE
        })
    }
}

