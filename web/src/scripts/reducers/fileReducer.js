
import _ from 'lodash'
import {
    SET_TOP_DIR,
} from '../actions/fileActions'
import {
    DIRECTORY_FOLD,
    ON_ROOT_PATH_UPDATE,
    ON_FILE_CLICK,
    ON_PROJ_PATH_SET,
    BACK_TO_PREV,
} from '../constants/fileConstants'



const initialState = {
    paths: {},
    rootPath: null,
    tree: {},
    selected: null,
    filesById: {},
    files: [
    ],
    stack: []
}

const fileReducer = (state = initialState, action) => {
    switch (action.type) {

        case SET_TOP_DIR:

            return Object.assign({}, state, {
                rootPath: action.rootPath,
                rootName: action.rootName,
            })
        case DIRECTORY_FOLD:
            var _files = _.cloneDeep(state.files)
            var node = _files
            var { path } = action.payload
            path.map((pa, i) => {
                node = node[pa]
            })
            if (node.collapsed == true)
                node.collapsed = false
            else
                node.collapsed = true
            return Object.assign({}, state, {
                files: _files
            })
        case ON_FILE_CLICK:
            var _files = _.cloneDeep(state.files)
            var { path } = action.payload
            var node = _files
            path.map((pa, i) => {
                node = node[pa]
            })
            var prev = _files
            if (state.selected) {
                state.selected.map((pa, i) => {
                    prev = prev[pa]
                })
                prev.activate = false
            }

            if (node.activate == true)
            { }
            else
                node.activate = true

            var _stack = _.cloneDeep(state.stack)
            _stack.push(path)
            return Object.assign({}, state, {
                files: _files,
                selected: path,
                stack: _stack
            })

        case ON_ROOT_PATH_UPDATE:
            var { files, haff } = action.payload

            if (haff == null) {
                return Object.assign({}, state, {
                    files: files
                })
            } else {

                var _files = _.cloneDeep(state.files)
                node = _files
                haff.map((pa, i) => {
                    node = node[pa]
                })
                node.children = files
                node.cached = true
                return Object.assign({}, state, {
                    files: _files
                })

            }
        case ON_PROJ_PATH_SET:
            var { path } = action.payload
            return Object.assign({}, state, {
                rootPath: path
            })
        case BACK_TO_PREV:
            debugger
            var _files = _.cloneDeep(state.files)

            var prev = _files
            if (state.selected) {
                state.selected.map((pa, i) => {
                    prev = prev[pa]
                })
                prev.activate = false
            }
            var node = _files
            var _stack = _.cloneDeep(state.stack)
            _stack.pop()//去除文件栈的最后一个
            var path = _stack.pop()
            if(path&&path.length>0)
            {
                path.map((pa, i) => {
                    node = node[pa]
                })
                if (node.activate)
                { }
                else {
                    node.activate = true
                }
            }
           
            return Object.assign({}, state, {
                files: _files,
                selected: path,
                stack: _stack
            })


        default:
            return state
    }
}

export default fileReducer
