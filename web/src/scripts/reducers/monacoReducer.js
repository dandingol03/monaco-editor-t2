/**
 * Created by danding on 17/5/8.
 */
var _ = require('lodash')
import ArrayUtils from '../utils/ArrayUtils'
import {
    UPDATE_CODE_EDITOR_INSTANCE,
    SET_CURRENT_DOC,
    UPDATE_MONACO_DECORATIONS,
    SWITCH_COMPONENT,
    UPDATE_CURRENT_CODE_EDITOR_INSTANCE,
    DISPOSE_EDITOR,
    UPDATE_DOC_STYLE,
    UPDATE_DOC_CUSTOM_PROPERTY,
    UPDATE_CURSOR_DECORATION,
    ON_TEMPLATE_INSERT,
    ON_CLASS_METHOD_INSERT,
    ON_COMPONENT_TREE_APPEND,
    ON_COMPONENT_REPLACED,
    ON_COMPONENT_EXCHANGED,
    MAKE_COMPONENT_STATUS_DIRTY,
    MAKE_COMPONENT_STATUS_CLEAN,
    MAKE_CLASSMETHOD_DIRTY,
    MAKE_CLASSMETHOD_CLEAN,
    MAKE_COMPONENT_HAFF_DIRTY,
    MAKE_COMPONENT_HAFF_DELETED,
    MAKE_COMPONENT_HAFF_ALL_CLEAN,
    MAKE_EDITOR_DRAGGED,
    MAKE_EDITOR_UNDRAGGED
} from '../constants/monacoConstants';

import {
    CACHE_DOC
} from '../actions/editorActions';

import {
    MAKE_NODE_FOLDED,
    MAKE_NODE_SPREAD,
    MAKE_NODE_IN_CLASSMETHOD_SPREAD,
    MAKE_NODE_IN_CLASSMETHOD_FOLDED,
    MAKE_NODE_VISIBLE
} from '../constants/ComponentTreeConstants'

const initialState = {
    _IStandaloneCodeEditor: null,
    uri: null,
    editors: [],
    dirtyMap: {},
    componentStatus: 'clean',
    dirtyHaff: [],
    deletedHaff: [],
    dirtyMethods: {},
    docCache: {},
    decorationsMap: null,
    cursorDecoration: null
};

let monaco = (state = initialState, action) => {
    let cache = state.docCache || {}
    let dirtyList = Object.assign({}, state.dirtyList)



    switch (action.type) {

        case UPDATE_CURRENT_CODE_EDITOR_INSTANCE:

            var { editor } = action.payload
            return Object.assign({}, state, {
                _IStandaloneCodeEditor: editor,
            })


        case UPDATE_CODE_EDITOR_INSTANCE:

            var { editor, uri, path, active } = action.payload;

            var exist = false
            if (state.editors && state.editors.length > 0) {
                state.editors.map((item, i) => {
                    if (item.path == path)
                        exist = true
                })
            }
            if (!exist)//如果不存在
            {
                state.editors.push({
                    editor: editor,
                    active: active,
                    path: path,
                    uri: uri
                })
            }
            return Object.assign({}, state)

        case DISPOSE_EDITOR:
            var { path } = action.payload;
            if (state.editors && state.editors.length > 0) {
                for (var i = 0; i < state.editors.length; i++) {
                    var item = state.editors[i]
                    if (item.path == path) {

                        item.editor.getModel().dispose()
                        item.editor.dispose()
                        window.uri[path] = null
                        state.editors.splice(i, 1)
                    }
                }
            }
            return Object.assign({}, state)


        case SET_CURRENT_DOC:
            return Object.assign({}, state, {
                openDocId: action.id,
            });
        case CACHE_DOC:

            if (cache[action.id]) {
                cache[action.id] = Object.assign(cache[action.id], {
                    id: action.id,
                    data: action.data,
                    type: 'jsx',
                    ranges: action.ranges,
                    imports: action.imports,
                    components: action.components,
                    dictionary: action.dictionary,
                    classMethods: action.classMethods
                })
            } else {
                cache[action.id] = {
                    id: action.id,
                    data: action.data,
                    type: 'jsx',
                    ranges: action.ranges,
                    imports: action.imports,
                    components: action.components,
                    dictionary: action.dictionary,
                    classMethods: action.classMethods
                };

            }
            return Object.assign({}, state, {
                docCache: cache
            });
        case UPDATE_MONACO_DECORATIONS:
            if (state._IStandaloneCodeEditor && state.openDocId) {
                //TODO:
                //存储到该cache中
                var doc = cache[state.openDocId]
                var _doc = _.cloneDeep(doc)
                _doc.decorationsMap = action.data
                return Object.assign({}, state, {
                    docCache: Object.assign(cache, { [state.openDocId]: _doc })
                });
            }
        case UPDATE_DOC_STYLE:
            if (state._IStandaloneCodeEditor && state.openDocId) {

                //更新cache中的components信息
                var doc = cache[state.openDocId]
                var _doc = _.cloneDeep(doc)
                var { haff, style } = action.payload
                var component = null
                if (haff[0] == 'classMethods')
                    component = _doc
                else
                    component = _doc.components
                haff.map((pa, i) => {
                    if (i != haff.length - 1)
                        component = component[pa]
                })
                component[haff[haff.length - 1]] = style

                return Object.assign({}, state, {
                    docCache: Object.assign(cache, { [state.openDocId]: _doc })
                });
            }
        case UPDATE_DOC_CUSTOM_PROPERTY:

            if (state._IStandaloneCodeEditor && state.openDocId) {

                //更新cache中的components信息
                var doc = cache[state.openDocId]
                var _doc = _.cloneDeep(doc)
                var { haff, property } = action.payload
                var component = null
                if (haff[0] == 'classMethods')
                    component = _doc
                else
                    component = _doc.components
                haff.map((pa, i) => {
                    if (i != haff.length - 1)
                        component = component[pa]
                })
                component[haff[haff.length - 1]] = property

                return Object.assign({}, state, {
                    docCache: Object.assign(cache, { [state.openDocId]: _doc })
                });
            }

        case SWITCH_COMPONENT:
            var { docId, haff1, haff2, loc1, loc2 } = action.payload
            var doc = cache[docId]
            var _components = _.cloneDeep(doc.components)
            if (doc && haff1 && haff2) {
                var component1 = _components
                var component2 = _components
                var prefix1 = null
                var prefix2 = null
                var temp = null
                haff1.map((pa, i) => {
                    if (i == haff1.length - 1)
                        prefix1 = component1
                    component1 = component1[pa]
                })
                haff2.map((pa, i) => {
                    if (i == haff2.length - 1)
                        prefix2 = component2
                    component2 = component2[pa]
                })
                component1.loc = loc1
                component2.loc = loc2
                prefix1[haff1[haff1.length - 1]] = component2
                prefix2[haff2[haff2.length - 1]] = component1
                var _doc = Object.assign(doc, { components: _components })

                return Object.assign({}, state, {
                    docCache: Object.assign(cache, { docId: _doc })
                });


            }

        case UPDATE_CURSOR_DECORATION:

            var { docId, decoration } = action.payload
            if (cache[docId]) {
                return Object.assign({}, state, {
                    cursorDecoration: decoration
                });
            } else {
                return state
            }
        case ON_CLASS_METHOD_INSERT:

            var { template, methodHaff, attributes, dragType, childLineBegin, content } = action.payload
            var doc = cache[state.openDocId]
            var _classMethods = _.cloneDeep(doc.classMethods)
            var currentMethod = _classMethods
            var _haff = _.cloneDeep(methodHaff)
            _haff.shift()
            _haff.map((pa, i) => {
                currentMethod = currentMethod[pa]
            })
            currentMethod.ui = {
                attributes: attributes,
                name: dragType,
                childLoc: null,
                content: content,
                loc: null,
                childLineBegin
            }

            var _doc = Object.assign(doc, { classMethods: _classMethods })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });


        case ON_TEMPLATE_INSERT:

            var { template, haff, attributes, dragType, itemIndex, childLineBegin, content } = action.payload
            var doc = cache[state.openDocId]
            var _components = _.cloneDeep(doc.components)
            var currentComponent = _components
            haff.map((pa, i) => {
                currentComponent = currentComponent[pa]
            })
            //TODO:更新props.doc.components
            if (currentComponent.children) { }
            else {
                currentComponent.children = []
            }
            if (itemIndex) {
                currentComponent.children.splice(itemIndex, 0, {
                    attributes: attributes,
                    name: dragType,
                    childLoc: null,
                    content: content,
                    loc: null,
                    childLineBegin
                })
            } else {
                currentComponent.children.splice(0, 0, {
                    attributes: attributes,
                    name: dragType,
                    childLoc: null,
                    content: content,
                    loc: null,
                    childLineBegin
                })
            }

            var _doc = Object.assign(doc, { components: _components })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });


        case ON_COMPONENT_TREE_APPEND:


            var { haff, itemIndex, componentTree } = action.payload
            var doc = cache[state.openDocId]
            var _components = _.cloneDeep(doc.components)
            var currentComponent = _components
            haff.map((pa, i) => {
                currentComponent = currentComponent[pa]
            })
            //TODO:更新props.doc.components
            if (currentComponent.children) { }
            else {
                currentComponent.children = []
            }
            if (itemIndex) {
                currentComponent.children.splice(itemIndex, 0, componentTree)
            } else {
                currentComponent.children.splice(0, 0, componentTree)
            }



            var _doc = Object.assign(doc, { components: _components })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });

        case ON_COMPONENT_REPLACED:
            var { placeHolderHaff, itemIndex, draggedHaff } = action.payload
            var doc = cache[state.openDocId]
            var _components = _.cloneDeep(doc.components)

            //获取被拖拽结点的父结点路径编码
            var _haff = _.cloneDeep(draggedHaff)
            _haff.splice(_haff.length - 1, 1)
            _haff.splice(_haff.length - 1, 1)

            //获取被拖拽的结点
            var draggedNode = _components
            var draggedPNode = null
            draggedHaff.map((pa, i) => {
                draggedPNode = draggedNode
                draggedNode = draggedNode[pa]
            })

            //插入位置的父结点 
            var pNode = _components
            placeHolderHaff.map((pa, i) => {
                pNode = pNode[pa]
            })

            if (itemIndex !== undefined && itemIndex !== null) {
                debugger
                //判断插入位置与被拖拽结点是否具有相同父结点
                if (ArrayUtils.compare(placeHolderHaff, _haff) == true) {
                    //被拖拽结点位于其下，插入位置位于其上
                    if (parseInt(draggedHaff[draggedHaff.length - 1]) > parseInt(itemIndex)) {
                        //先进行删除，再进行插入
                        if (draggedPNode)
                            draggedPNode.splice(draggedHaff[draggedHaff.length - 1], 1)
                        pNode.children.splice(itemIndex, 0, draggedNode)
                    } else {
                        //先进行插入再进行删除
                        pNode.children.splice(itemIndex + 1, 0, draggedNode)
                        if (draggedPNode)
                            draggedPNode.splice(draggedHaff[draggedHaff.length - 1], 1)

                    }

                } else {
                    //插入结点数据
                    pNode.children.splice(itemIndex, 0, draggedNode)
                    debugger
                    //删除原结点
                    if (draggedPNode)
                        draggedPNode.splice(draggedHaff[draggedHaff.length - 1], 1)
                }

            }



            var _doc = Object.assign(doc, { components: _components })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });

        case ON_COMPONENT_EXCHANGED:

            var { haff1, haff2 } = action.payload
            var doc = cache[state.openDocId]
            var _components = _.cloneDeep(doc.components)

            //获取haff1的父路径编码
            var _haff1 = _.cloneDeep(haff1)
            _haff1.splice(_haff1.length - 1, 1)
            _haff1.splice(_haff1.length - 1, 1)
            var _haff2 = _.cloneDeep(haff2)
            _haff2.splice(_haff2.length - 1, 1)
            _haff2.splice(_haff2.length - 1, 1)

            //pnode1
            var node1 = _components
            var pnode1 = node1
            _haff1.map((pa, i) => {
                pnode1 = pnode1[pa]
            })

            //node1
            haff1.map((pa, i) => {
                node1 = node1[pa]
            })


            var node2 = _components
            var pnode2 = node2
            //node2
            haff2.map((pa, i) => {
                node2 = node2[pa]
            })
            //pnode2
            _haff2.map((pa, i) => {
                pnode2 = pnode2[pa]
            })


            //代表2个结点具有祖宗关系
            if (ArrayUtils.includes(haff1, haff2) || ArrayUtils.includes(haff2, haff1)) {
            } else {

                var index1 = haff1[haff1.length - 1]
                var index2 = haff2[haff2.length - 1]
                //先进行插入
                pnode1.children.splice(index2 + 1, 0, node2)
                pnode2.children.splice(index1 + 1, 0, node1)
                //删除旧结点
                pnode1.children.splice(index2, 1)
                pnode2.children.splice(index1, 1)
            }

            var _doc = Object.assign(doc, { components: _components })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });

        case MAKE_NODE_VISIBLE:


            var { haff } = action.payload
            var doc = cache[state.openDocId]
            var _components = _.cloneDeep(doc.components)
            var currentComponent = _components
            haff.map((pa, i) => {
                currentComponent = currentComponent[pa]
                if (pa >= 0 && pa <= 20) {
                    currentComponent.folded = false//设置祖先结点展开
                }
            })


            var _doc = Object.assign(doc, { components: _components })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });

        case MAKE_NODE_IN_CLASSMETHOD_SPREAD:
            var { haff } = action.payload
            var doc = cache[state.openDocId]
            var _classMethods = _.cloneDeep(doc.classMethods)
            var currentComponent = _classMethods
            var _haff = _.cloneDeep(haff)
            _haff.shift()
            _haff.map((pa, i) => {
                currentComponent = currentComponent[pa]
            })
            //设置该结点为展开状态
            currentComponent.folded = false
            var _doc = Object.assign(doc, { classMethods: _classMethods })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });
        case MAKE_NODE_IN_CLASSMETHOD_FOLDED:
            var { haff } = action.payload
            var doc = cache[state.openDocId]
            var _classMethods = _.cloneDeep(doc.classMethods)
            var currentComponent = _classMethods
            var _haff = _.cloneDeep(haff)
            _haff.shift()
            _haff.map((pa, i) => {
                currentComponent = currentComponent[pa]
            })
            //设置该结点为折叠状态
            currentComponent.folded = true
            var _doc = Object.assign(doc, { classMethods: _classMethods })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });

        case MAKE_NODE_SPREAD:
            var { haff } = action.payload
            var doc = cache[state.openDocId]
            var _components = _.cloneDeep(doc.components)
            var currentComponent = _components
            haff.map((pa, i) => {
                currentComponent = currentComponent[pa]
            })
            //设置该结点为展开状态
            currentComponent.folded = false
            var _doc = Object.assign(doc, { components: _components })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });

        case MAKE_NODE_FOLDED:
            var { haff } = action.payload
            var doc = cache[state.openDocId]
            var _components = _.cloneDeep(doc.components)
            var currentComponent = _components
            haff.map((pa, i) => {
                currentComponent = currentComponent[pa]
            })
            //设置该结点为折叠状态
            currentComponent.folded = true
            var _doc = Object.assign(doc, { components: _components })

            return Object.assign({}, state, {
                docCache: Object.assign(cache, { docId: _doc })
            });
        case MAKE_COMPONENT_STATUS_DIRTY:

            return Object.assign({}, state, {
                componentStatus: 'dirty'
            });
        case MAKE_COMPONENT_STATUS_CLEAN:
            return Object.assign({}, state, {
                componentStatus: 'clean'
            });
        case MAKE_CLASSMETHOD_DIRTY:
            var { methodName, haff, componentTree } = action.payload
            var _dirtyMethods = _.cloneDeep(state.dirtyMethods)
            if (_dirtyMethods[methodName]) {
                _dirtyMethods[methodName].dirty = true
                //仅针对listview
                _dirtyMethods[methodName].haff = haff
                _dirtyMethods[methodName].componentTree = componentTree
            } else {
                _dirtyMethods[methodName] = {
                    haff,
                    dirty: true,
                    componentTree
                }
            }
            return Object.assign({}, state, {
                dirtyMethods: _dirtyMethods
            });
        case MAKE_CLASSMETHOD_CLEAN:
            var { haff } = action.payload
            var _dirtyMethods = _.cloneDeep(state.dirtyMethods)
            var methods = _.keys(_dirtyMethods)
            if (methods && methods.length > 0) {
                methods.map((methodName, i) => {
                    var dirtyMethod = _dirtyMethods[methodName]
                    if (ArrayUtils.compare(dirtyMethod.haff, haff)) {
                        delete _dirtyMethods[methodName]
                    }
                })
            }
            return Object.assign({}, state, {
                dirtyMethods: _dirtyMethods
            });

        case MAKE_COMPONENT_HAFF_DIRTY:
            var { haff } = action.payload
            var _dirtyHaff = _.cloneDeep(state.dirtyHaff)
            var flag = true
            _dirtyHaff.map((item, i) => {
                //如果将要标志的脏haff为当前记录的子结点，则跳过
                if (ArrayUtils.includes(haff, item))
                    flag = false
            })
            if (flag)
                _dirtyHaff.push(haff)
            return Object.assign({}, state, {
                dirtyHaff: _dirtyHaff
            });
        case MAKE_COMPONENT_HAFF_DELETED:
            var { haff, childLocIndex } = action.payload
            var _deletedHaff = _.cloneDeep(state.deletedHaff)
            var flag = true
            //如果将要标志的脏haff为当前记录的子结点，则跳过
            _deletedHaff.map((item, i) => {
                if (ArrayUtils.includes(item.haff, haff))
                    flag = false
            })
            if (flag) {
                _deletedHaff.push({ haff, childLocIndex })
            }

            return Object.assign({}, state, {
                deletedHaff: _deletedHaff
            });

        case MAKE_COMPONENT_HAFF_ALL_CLEAN:
            //所传入的haff必为合并的二叉树路径
            return Object.assign({}, state, {
                dirtyHaff: []
            });
        case MAKE_EDITOR_DRAGGED:
            var doc = cache[state.openDocId]
            var _doc = _.cloneDeep(doc)
            _doc.dragged = true
            return Object.assign({}, state, {
                docCache: Object.assign(cache, { [state.openDocId]: _doc })
            });
        case MAKE_EDITOR_UNDRAGGED:
            var doc = cache[state.openDocId]
            var _doc = _.cloneDeep(doc)
            _doc.dragged = false
            return Object.assign({}, state, {
                docCache: Object.assign(cache, { [state.openDocId]: _doc })
            });

        default:
            return state;
    }
}

export default monaco;
