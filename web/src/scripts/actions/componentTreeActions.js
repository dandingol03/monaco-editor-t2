import _ from 'lodash'

import {
    MAKE_NODE_SPREAD,
    MAKE_NODE_FOLDED,
    MAKE_NODE_IN_CLASSMETHOD_SPREAD,
    MAKE_NODE_IN_CLASSMETHOD_FOLDED,
    MAKE_NODE_VISIBLE
} from '../constants/ComponentTreeConstants'
import ArrayUtils from '../utils/ArrayUtils'

const _makeNodeFolded = (payload) => {
    return {
        type: MAKE_NODE_FOLDED,
        payload: payload
    }
}

const _makeNodeInClassMethodFolded=(payload)=>{
    return {
        type:MAKE_NODE_IN_CLASSMETHOD_FOLDED,
        payload
    }
}

//折叠文件树结点
export const makeNodeFolded = (haff) => {
    return (dispatch, getState) => {
        if(haff.indexOf('classMethods')!=-1)
            dispatch(_makeNodeInClassMethodFolded({haff}))
        else
            dispatch(_makeNodeFolded({ haff: haff }))
    }
}

const _makeNodeSpread = (payload) => {
    return {
        type: MAKE_NODE_SPREAD,
        payload: payload
    }
}

const _makeNodeInClassMethodSpread=(payload)=>{
    return {
        type:MAKE_NODE_IN_CLASSMETHOD_SPREAD,
        payload
    }
}

//展开文件树结点
export const makeNodeSpread = (haff) => {
    return (dispatch, getState) => {
        if(haff.indexOf('classMethods')!=-1)
            dispatch(_makeNodeInClassMethodSpread({haff}))
        else
            dispatch(_makeNodeSpread({ haff: haff }))
    }

}

export const makeNodeVisible = (haff) => {
    return (dispatch, getState) => {
        dispatch({
            type: MAKE_NODE_VISIBLE,
            payload: {
                haff
            }
        })
    }
}



//dfs
const _convertHaff2VerticalIndex = (node, haff, selectedHaff, statistics) => {
    //visit this node
    statistics.count++
    if (ArrayUtils.compare(haff, selectedHaff))
        return true
    else {
        if (node.children && node.children.length > 0 && node.folded != true) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i]
                if (_convertHaff2VerticalIndex(child, haff.concat('children').concat(i), selectedHaff, statistics))
                    return true
            }
        }
    }

}


//转换特定haff -> 垂直下标          (每个单位为26高度)
export const  convertHaff2VerticalIndex=(components, haff)=>{
    var statistics = {
        count: 0
    }
    if (components) {
        _convertHaff2VerticalIndex(components['View'], ['View'], haff, statistics)
    }
    return statistics.count
}

export const convertVerticalIndex2YOffset=(verticalIndex)=>{
    return (verticalIndex-1)*26
}
