/**
 * 处理编辑器发出的请求
 */

import _ from 'lodash'
import request from '../ipc/Request'
import FileConstants from '../../../../public/constants/ipc/fileConstants'
const {
    GET_FILE_DATA,
  FETCH_FILE_SYNTAX_TREE
} = FileConstants

import {
  UPDATE_CODE_EDITOR_INSTANCE,
  UPDATE_MONACO_DECORATIONS,
  SWITCH_COMPONENT,
  UPDATE_CURRENT_CODE_EDITOR_INSTANCE,
  UPDATE_CURSOR_DECORATION,
  DISPOSE_EDITOR,
  ON_TEMPLATE_INSERT,
  ON_CLASS_METHOD_INSERT,
  ON_COMPONENT_TREE_APPEND,
  ON_COMPONENT_REPLACED,
  ON_COMPONENT_EXCHANGED,
  MAKE_COMPONENT_STATUS_DIRTY,
  MAKE_COMPONENT_STATUS_CLEAN,
  MAKE_COMPONENT_HAFF_DIRTY,
  MAKE_COMPONENT_HAFF_DELETED,
  MAKE_COMPONENT_HAFF_CLEAN,
  MAKE_COMPONENT_HAFF_ALL_CLEAN,
  MAKE_COMPONENT_DELETED_HAFF_ALL_CLEAN,
  MAKE_CLASSMETHOD_DIRTY,
  MAKE_CLASSMETHOD_CLEAN,
  MAKE_EDITOR_DRAGGED,
  MAKE_EDITOR_UNDRAGGED,
  SEARCH_IN_PROJ
} from '../constants/monacoConstants';

import { loadMetadata } from './metadataActions'
import MonacoMiddleware from '../middleware/monaco/MonacoMiddleware'
import Calculate from '../utils/Calculate'

//更新编辑器的修饰
export const updateMonacoDecorations = (decorationsMap) => {
  return {
    type: UPDATE_MONACO_DECORATIONS,
    data: decorationsMap,
  }
}



//设定当前文件选中
export const SET_CURRENT_DOC = 'SET_CURRENT_DOC'
export const setCurrentDoc = (id) => {
  return {
    type: SET_CURRENT_DOC,
    id: id,
  }
}

//缓存文件
export const CACHE_DOC = 'CACHE_DOC'
export const _cacheDoc = (payload, ranges, imports, components, dictionary, classMethods) => {
  return {
    type: CACHE_DOC,
    id: payload.id,
    data: payload.utf8Data,
    ranges,
    imports,
    components,
    dictionary,
    classMethods
  }
}

//更新编辑器实例
export const updateCodeEditorInstance = (payload) => {
  return {
    type: UPDATE_CODE_EDITOR_INSTANCE,
    payload: payload
  }
}


export function cacheDoc(payload) {
  return (dispatch, getState) => {


    return new Promise((resolve, reject) => {

      const cache = getState().monaco.docCache;
      const dirtyList = getState().monaco.dirtyList


      //区别json文件
      var jsonReg = /(.*?)\.json$/
      if (jsonReg.exec(payload.absolutePathArray[payload.absolutePathArray.length - 1]) != null
        && jsonReg.exec(payload.absolutePathArray[payload.absolutePathArray.length - 1])[1] != null) {
        dispatch(_cacheDoc(payload))
        resolve({ re: 1 })
        return
      }


      //payload.utf8Data is the content from the file which you open
      dispatch(loadMetadata(payload.id)).then((metadata) => {
        //加载完元数据后  

        const { ranges, body, imports, dictionary, classMethods } = metadata;

        //dispatch(setLiveValues(payload.id, liveValueIds, liveValuesById))
        dispatch(_cacheDoc(payload, ranges, imports, body, dictionary, classMethods))
        resolve({ re: 1 });
        //dispatch(createHistory(payload.id))
      }).catch((err) => {

        //TODO:get what makes err happen
        if (err.code === 'ENOENT') {
          dispatch(_cacheDoc(payload))
          dispatch(createHistory(payload.id))
        } else {
          console.error(`Error reading metadata for ${payload.id}`)
        }
        reject(err);
      })

    });
  }
}


//读取文件内容，请查看是否支持离线模式
export function _getFileData(path, rootPath) {
  return {
    type: GET_FILE_DATA,
    path,
    rootPath
  }
}


export function _getFileSyntaxTree(path) {
  return {
    type: FETCH_FILE_SYNTAX_TREE,
    path
  }
}

//读取文件的语法生成树信息
export function fetchFileComponentInfo(absolutePath) {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {

      request(_getFileSyntaxTree(absolutePath)).then((payload) => {
        //payload:{ id: ,absolutePathArray,utf8Data}
        //the behavious below wastes much time,so we just set it to promise syntax
        resolve(payload)
      })
    })
  }
}

export function openDocument(fileInfo) {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {


      const state = getState()
      if (state.monaco.docCache && state.monaco.docCache[fileInfo.id]) {
        //dispatch(setCurrentDoc(fileInfo.id))
        resolve()
      } else {

        console.log('time begin=>' + new Date().getMilliseconds())
        //fileInfo.absolutePath is <Array>
        request(_getFileData(fileInfo.absolutePath, state.directory.rootPath)).then((payload) => {
          //payload:{ id: ,absolutePathArray,utf8Data}
          //the behavious below wastes much time,so we just set it to promise syntax


          dispatch(cacheDoc(payload)).then((json) => {

            dispatch(setCurrentDoc(payload.id))
            resolve(payload);
          })

        })
      }
    });
  }
}

const _switchComponent = (docId, haff1, haff2, loc1, loc2) => {
  return {
    type: SWITCH_COMPONENT,
    payload: {
      docId: docId,
      haff1: haff1,
      haff2: haff2,
      loc1,
      loc2
    }
  }
}

//组件交换
export const switchComponent = (docId, haff1, haff2, loc1, loc2) => {
  return (dispatch, getState) => {

    const state = getState()
    if (state.monaco.docCache && docId) {
      var cache = state.monaco.docCache;
      if (cache[docId]) {
        dispatch(_switchComponent(docId, haff1, haff2, loc1, loc2))
      }
    }

  }
}

//设置当前编辑器示例
export const updateCurrentCodeEditorInstance = (editor) => {
  return {
    type: UPDATE_CURRENT_CODE_EDITOR_INSTANCE,
    payload: {
      editor
    }
  }
}

//设置当前编辑器的cursor decoration
export const updateCursorDecoration = (docId, decoration) => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_CURSOR_DECORATION,
      payload: {
        docId,
        decoration
      }
    })
  }
}

//销毁editor实例
export const disposeEditor = (path) => {
  return (dispatch, getState) => {
    dispatch({
      type: DISPOSE_EDITOR,
      payload: {
        path
      }
    })
  }
}

//代码插入
export const onTemplateInsert = (haff, itemIndex, template, attributes, dragType, childLineBegin, content) => {
  return (dispatch, getState) => {
    dispatch({
      type: ON_TEMPLATE_INSERT,
      payload: {
        template,
        attributes,
        haff,
        itemIndex,
        dragType,
        childLineBegin,
        content
      }
    })
  }
}

//类方法插入
export const onClassMethodInsert = (methodHaff, template, attributes, dragType, childLineBegin, content) => {
  return (dispatch, getState) => {
    dispatch({
      type: ON_CLASS_METHOD_INSERT,
      payload: {
        template,
        attributes,
        methodHaff,
        dragType,
        childLineBegin,
        content
      }
    })
  }
}


//组件树的结点替换
export const onComponentReplace = (placeHolderHaff, itemIndex, haff) => {
  return (dispatch, getState) => {
    dispatch({
      type: ON_COMPONENT_REPLACED,
      payload: {
        placeHolderHaff,
        itemIndex,
        draggedHaff: haff,
      }
    })
  }
}

//组件树的结点交换
export const onComponentExchange = (haff1, haff2) => {
  return (dispatch, getState) => {
    dispatch({
      type: ON_COMPONENT_EXCHANGED,
      payload: {
        haff1,
        haff2
      }
    })
  }
}


//标记特定组件的路径编码为脏
export const makeComponentHaffDirty = (haff) => {
  return (dispatch, getStatus) => {
    dispatch({
      type: MAKE_COMPONENT_HAFF_DIRTY,
      payload: {
        haff
      }
    })
  }
}

//标记特定组件的路径编码为脏且需要删除
export const makeComponentHaffDeleted = (haff, childLocIndex) => {
  return (dispatch, getStatus) => {
    dispatch({
      type: MAKE_COMPONENT_HAFF_DELETED,
      payload: {
        haff,
        childLocIndex
      }
    })
  }
}

//清除所有脏路径标记
export const makeComponentHaffAllClean = () => {
  return (dispatch, getStatus) => {
    dispatch({
      type: MAKE_COMPONENT_HAFF_ALL_CLEAN,
      payload: {
      }
    })
  }
}

//清除所有待删除路径标记
export const makeComponentDeletedHaffAllClean = () => {
  return (dispatch, getStatus) => {
    dispatch({
      type: MAKE_COMPONENT_DELETED_HAFF_ALL_CLEAN,
      payload: {
      }
    })
  }
}


//标记特定类方法为脏
export const makeClassMethodDirty = (methodName, haff, componentTree) => {
  return (dispatch, getState) => {
    dispatch({
      type: MAKE_CLASSMETHOD_DIRTY,
      payload: {
        methodName,
        haff,
        componentTree
      }
    })
  }
}

//删除该ui结点所标记的所有脏的类方法
export const makeClassMethodClean=(haff)=>{
  return (dispatch,getState) =>{
    dispatch({
      type:MAKE_CLASSMETHOD_CLEAN,
      payload: {
        haff
      }
    })
  }
} 


//设置组件树状态为脏
export const makeComponentStatusDirty = () => {
  return (dispatch, getStatus) => {
    dispatch({
      type: MAKE_COMPONENT_STATUS_DIRTY,
      payload: {}
    })
  }
}

//设置组件树状态为干净
export const makeComponentStatusClean = () => {
  return (dispatch, getStatus) => {
    dispatch({
      type: MAKE_COMPONENT_STATUS_CLEAN,
      payload: {}
    })
  }
}

//根据后序遍历进行代码生成,生成后的代码以根组件来说是缩进的
const postorder_generate_text = (node, indent, classMethods) => {
  return (dispatch, getState) => {
    var state = getState()
    var name = node.name


    //针对tpl文件进行模板编译
    debugger
    debugger
    var tpls = state.library.tpls
    var tpl = tpls[name]
    debugger
    debugger
    var compiled = _.template(tpl);
    var { size } = node.attributes
    if (size && size.length > 0) {
      if (size[0] == '{')
        size = parseInt(size.substring(1, size.length - 1))
    }

    var style = node.attributes.style
    if (Object.prototype.toString.call(style) == '[object String]') {
      if (style[0] == '{')
        style = JSON.parse(style.substring(1, style.length - 1))
    }


    var styleJSON = null
    if (style) {
      if (style.width && Object.prototype.toString.call(style.width) == '[object Object]') {

        if (style.width.type == 'BinaryExpression') {
          style.width = style.width.left + style.width.operator + style.width.right
        }
      }

      styleJSON = JSON.stringify(style)
      var styleWidthReg = /\:\"width\"/
      var widthReg1 = /\:\"width([\*|\/|\+\-]\d+){1,}\"/
      var widthReg2 = /\:\"width([\*|\/|\+\-]\d+){0,}([\*|\/|\+|\-]{1,})\"/
      if (styleWidthReg.exec(styleJSON) != null)
        styleJSON = styleJSON.replace(styleWidthReg, ':width')
      else if (widthReg1.exec(styleJSON) != null) {
        var matched = widthReg1.exec(styleJSON)[0]
        matched = matched.replace(/\"/g, '')
        styleJSON = styleJSON.replace(widthReg1, matched)
      }
      else if (widthReg2.exec(styleJSON) != null) {
        var matched = widthReg1.exec(styleJSON)[0]
        matched = matched.replace(/\"/g, '')
        styleJSON = styleJSON.replace(widthReg2, matched)
      }

      var styleHeightReg= /\:\"height\"/
      var heightReg1 = /\:\"height([\*|\/|\+\-]\d+){1,}\"/
      var heightReg2 = /\:\"height([\*|\/|\+\-]\d+){0,}([\*|\/|\+|\-]{1,})\"/
      if (styleHeightReg.exec(styleJSON) != null)
        styleJSON = styleJSON.replace(styleHeightReg, ':height')
      else if (heightReg1.exec(styleJSON) != null) {
        var matched = heightReg1.exec(styleJSON)[0]
        matched = matched.replace(/\"/g, '')
        styleJSON = styleJSON.replace(heightReg1, matched)
      }
      else if (heightReg2.exec(styleJSON) != null) {
        var matched = heightReg1.exec(styleJSON)[0]
        matched = matched.replace(/\"/g, '')
        styleJSON = styleJSON.replace(heightReg2, matched)
      }
    }


    debugger
    var compiledOptions =
      {
        renderRow: node.attributes.renderRow ?node.attributes.renderRow.methodName : null,
        isCustom: node.attributes.isCustom,
        row: node.attributes.row,
        column: node.attributes.column,
        dataSource: node.attributes.dataSource,
        size: size,
        color: '\'' + node.attributes.color + '\'',
        name: '\'' + node.attributes.name + '\'',
        content: node.attributes.content,
        placeholder:'\'' +node.attributes.placeholder+'\'',
        val:'null',
        onChangeText:'null',
        onPress:'null',
        refreshControl:'null'
      }
    //针对有样式的组件元素进行模板编译
    if (styleJSON)
      compiledOptions.styleJson = styleJSON
    else
      compiledOptions.styleJson = '{}'

    var template = compiled(compiledOptions, { escape: ['<'] });


    var childLineBegin = node.childLineBegin
    //进行上半部分代码和下半部分代码的分割
    var halfTop = ''
    var halfBottom = ''
    var lines = template.split('\n')
    if (childLineBegin)//开组件
    {
      for (var j = 0; j < childLineBegin; j++) {
        halfTop += indent + lines[j] + '\n'
      }

      for (var j = childLineBegin; j < lines.length; j++) {
        if (j != lines.length - 1)
          halfBottom += indent + lines[j] + '\n'
        else {
          if (lines[j] != '')
            halfBottom += indent + lines[j]
          else
            halfBottom += ''
        }

      }

    } else {
      //闭组件
      for (var j = 0; j < lines.length; j++) {
        if (lines[j] != '') {
          if (j != lines.length - 1)
            halfTop += indent + lines[j] + '\n'
          else
            halfTop += indent + lines[j]
        }
      }
    }


    var subText = ''
    //ListView的子结点用于在辅助界面上构筑renderRow的结果
    if (node.children && node.children.length > 0 && node.name != 'ListView') {
      node.children.map((component, i) => {
        subText += dispatch(postorder_generate_text(component, indent + '    '))
      })
    }

    if (subText != '')
      return halfTop + subText + halfBottom
    else
      return halfTop + halfBottom
  }
}


export const convertItemIndex2ChildLocIndex = (components, haff, deleted) => {
  var _components = _.cloneDeep(components)

  var pnode = _components
  var _haff = _.cloneDeep(haff)
  _haff.splice(_haff.length - 1, 1)
  _haff.splice(_haff.length - 1, 1)
  _haff.map((haffItem, i) => {
    pnode = pnode[haffItem]
  })

  //convert itemIndex to the index of childLoc
  //for example:
  //1.we want to insert a new ele in top of some ele's childNodes
  //2.then we pass 0
  //3.or we pass 6 ,then the new ele would be the 7th childNodes

  var itemIndex = haff[haff.length - 1]
  var childLocIndex = -1
  if (pnode.childLoc) {
    childLocIndex = 0


    var node = null
    if (deleted) {
      node = pnode['children'][itemIndex]
    } else {
      if (itemIndex == 0)
        node = pnode['children'][0]
      else
        node = pnode['children'][itemIndex - 1]
    }


    if (node.loc) {
      for (var i = 0; i < pnode.childLoc.length; i++) {
        if (pnode.childLoc[i].start.column == node.loc.start.column
          && pnode.childLoc[i].start.line == node.loc.start.line) {
          if (deleted) {
            childLocIndex = i
          } else {
            childLocIndex = i + 1//bug:if itemIndex=0，则导致新插入的元素位于第2子结点
          }
          break
        }
      }
    } else {
      childLocIndex = 0
    }

  }

  return childLocIndex
}



//根据路径编码生成代码文本和插入的对应位置
const generateInsertedCodeByHaff = (components, haff, deleted, passedChildLocIndex) => {
  return (dispatch, getState) => {
    var _components = _.cloneDeep(components)
    var node = null
    if (deleted == true) {
    } else {
      node = _components
      haff.map((haffItem, i) => {
        node = node[haffItem]
      })
    }

    //获取父结点
    var pnode = _components
    var _haff = _.cloneDeep(haff)
    _haff.splice(_haff.length - 1, 1)
    _haff.splice(_haff.length - 1, 1)
    _haff.map((haffItem, i) => {
      pnode = pnode[haffItem]
    })

    var childLocIndex = null
    if (passedChildLocIndex !== undefined && passedChildLocIndex !== null)
      childLocIndex = passedChildLocIndex
    else
      childLocIndex = convertItemIndex2ChildLocIndex(_components, haff)



    var text = ''
    if (node != null)
      text = dispatch(postorder_generate_text(node, ''))
    debugger
    //单一脏结点 代码生成 通过
    //进行多个脏结点 同层 代码生成 
    var loc = null
    var range = null
    //此处会发生下溢
    if (pnode.childLoc[childLocIndex]) {
      loc = pnode.childLoc[childLocIndex]
    }
    else {
      for (var i = itemIndex; i >= 0; i--) {
        if (pnode.childLoc[i]) {
          loc = pnode.childLoc[i]
          break
        }
      }
    }

    if (loc) {
      if (deleted == true)
        range = { startLineNumber: loc.start.line, startColumn: loc.start.column + 1, endLineNumber: loc.end.line, endColumn: loc.end.column + 1 }
      else
        range = { startLineNumber: loc.start.line, startColumn: loc.start.column + 1 }
    }
    var ploc = {
      pline: pnode.loc.start.line,
      pcolumn: pnode.loc.start.column + 1
    }

    return [ploc, range, text]
  }

}

//生成自定义的renderRow
const generatedRenderRowTemplateByHaff = (name, classMethods, haff) => {
  return (dispatch, getState) => {
    
    var method = classMethods[name]
    var node=method.ui

    debugger
    var text = dispatch(postorder_generate_text(node, ''))

    debugger
    var template = name + '(rowData, sectionId, rowId) {\n'
    template += "    " + "return (\n"
    var lines = text.split('\n')
    for (var i = 0; i < lines.length; i++) {
      let line = lines[i]
      if (line != '') {
        template += '    ' + '    ' + line + '\n'
      } else {
        if (text[text.length - 1] == '\n')
          template += '\n'
      }
    }
    template += '    ' + ')\n'
    template += '}\n'
    debugger
    return template
  }
}

const generateRenderRowTemplate = (name, fields) => {
  var template = name + '(rowData, sectionId, rowId) {\n'
  template += "    " + "return (\n" +
    "    " + "<View style={{ marginTop:2, flexDirection: 'column', alignItems: 'flex-start',borderWidth:1,borderColor:'#ddd'}}>\n"

  fields.map((field, i) => {
    template += "    " + "    " + "<View style={{ padding: 4, paddingHorizontal: 12 ,flexDirection:'row'}}>\n"
    template += "    " + "    " + "    " + "<Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}>\n"
    template += "    " + "    " + "    " + "    " + "{rowData." + field + "}\n"
    template += "    " + "    " + "    " + "</Text>\n"
    template += "    " + "    " + "</View>\n"
  })

  template += "    " + "</View>)\n"
  template += '}\n'
  return template
}

//为组件结点交换生成代码,此时组件树的结点内容已经更改，但loc没有变换
const generateSwitchedCodeByHaff = (components, replacedHaff, op) => {
  return (dispatch, getState) => {
    var _components = _.cloneDeep(components)
    var node = null
    var depositeNode = null
    var depositeHaff = op[replacedHaff]

    //将被替换的组件结点,该结点的内容当前被替换为最新
    node = _components
    replacedHaff.map((haffItem, i) => {
      node = node[haffItem]
    })

    //文本将被替换的组件结点
    depositeNode = _components
    depositeHaff.map((haffItem, i) => {
      depositeNode = depositeNode[haffItem]
    })

    var loc = null
    loc = depositeNode.loc


    //获取被替换文本结点的父结点
    var pnode = _components
    var _replacedHaff = _.cloneDeep(replacedHaff)
    _replacedHaff.splice(_replacedHaff.length - 1, 1)
    _replacedHaff.splice(_replacedHaff.length - 1, 1)
    _replacedHaff.map((haffItem, i) => {
      pnode = pnode[haffItem]
    })

    debugger
    var text = ''
    if (node != null)
      text = dispatch(postorder_generate_text(node, ''))
    debugger

    var range = null

    if (loc) {
      range = { startLineNumber: loc.start.line, startColumn: loc.start.column + 1, endLineNumber: loc.end.line, endColumn: loc.end.column+1  }

    }
    debugger
    //ploc用于辅助缩进确定
    var ploc = {
      pline: pnode.loc.start.line,
      pcolumn: pnode.loc.start.column + 1
    }

    return [ploc, range, text]
  }
}


//检查组件树的脏信息，并生成代码，保存到文本
export const makeComponentDirtyClean = () => {
  return (dispatch, getState) => {

    return new Promise((resolve, reject) => {
      const state = getState()

      const editor = state.monaco._IStandaloneCodeEditor
      var docId = state.monaco.openDocId
      debugger
      //脏的路径编码
      var {
        dirtyHaff,
        deletedHaff,
        docCache
      } = state.monaco

      var {
        switched
      } = state.palette

      if (docId && docCache) {
        var doc = docCache[docId]
        var components = doc.components
        if ((dirtyHaff && dirtyHaff.length > 0) || (switched.op && _.keys(switched.op).length > 0)) {

          var inserted = []

          //todo:进行基于组件结点交换的代码生成
          var ops = _.keys(switched.op)
          if (ops && ops.length > 0) {

            ops.map((opName, i) => {
              var haff = opName.split(',')
              var [ploc, range, text] = dispatch(generateSwitchedCodeByHaff(components, haff, switched.op))
              inserted.push({ ploc, range, text ,deleted:true })
            })

          }

          dirtyHaff.map((haff, i) => {
            var [ploc, range, text] = dispatch(generateInsertedCodeByHaff(components, haff))
            inserted.push({ ploc, range, text })
          })

          //遍历deletedHaff
          if (deletedHaff && deletedHaff.length > 0) {
            deletedHaff.map((item, i) => {

              var { haff, childLocIndex } = item
              var [ploc, range, text] = dispatch(generateInsertedCodeByHaff(components, haff, true, childLocIndex))
              inserted.push({ ploc, range, text, deleted: true })
            })
          }

          //遍历classMethods,就脏方法进行生成,方法中必须含有键去映射到组件的路径编码
          debugger
          var dirtyMethods = state.monaco.dirtyMethods
          var classMethods = doc.classMethods
          var methodNames = Object.keys(dirtyMethods)
          var renderLoc = null
          var renderIndent = 0
          if (classMethods.render && classMethods.render.loc) {
            renderLoc = classMethods.render.loc
            var { line, column } = renderLoc.start
          }

          var insertedMethods = []
          methodNames.map((name, i) => {
            var method = dirtyMethods[name]
            //已有方法
            if (classMethods && classMethods[name]&&classMethods[name].loc) {

            } else {
              //新方法
              //根据render的loc完成代码插入
              //如何知道方法的参数呢,由properties面板传入

              //生成代码，并在代码末尾加入换行
              var _node = components
              if (method.haff && method.haff != '') {
                method.haff.map((haff, j) => {
                  _node = _node[haff]
                })
                //根据组件属性生成代码
                var componentName = _node.name
                var template = null
                switch (componentName) {
                  case 'ListView':
                    var { row, column, fields, isCustom } = _node.attributes
                    if (isCustom == true) {
                      //分析classMethods中对应方法的ui属性去生成结点
                      var template = dispatch(generatedRenderRowTemplateByHaff(name, classMethods, method.haff))
                      debugger
                      debugger
                      debugger
                      if (renderLoc) {
                        insertedMethods.push({ range: { line: renderLoc.start.line, column: renderLoc.start.column + 1 }, template })
                      }
                    }
                    else {
                      template = generateRenderRowTemplate(name, fields)
                      if (renderLoc) {
                        insertedMethods.push({ range: { line: renderLoc.start.line, column: renderLoc.start.column + 1 }, template })
                      }
                    }
                    break;
                }

                console.log()
              }
            }
          })


          //更新editor内容
          var middleware = MonacoMiddleware(dispatch, editor)
          middleware.insertCodeTemplateInBatch(inserted)
          //生成类方法
          if (insertedMethods.length > 0)
            middleware.insertClassMethodsInBatch(insertedMethods)//是否能统一类方法的生成方式

        }

      }
      resolve({ re: 1 })

    })
  }
}

//先序遍历获得子结点插入的父结点,从根结点View开始，根节点的下标为0
//TODO:递归的先序遍历
const preorder_traverse = (components, haff, nodeIndex, statistics) => {


  var count = statistics.count++;

  if (count == nodeIndex)
    statistics.haff = haff
  else {
    if (components.children && components.folded != true && (statistics.haff == undefined || statistics.haff == null)) {
      components.children.map((component, i) => {
        preorder_traverse(component, haff.concat('children').concat(i), nodeIndex, statistics)
      })
    }
  }
}


const _dfs_traverse = (node,pnode, haff, statistics, nodeIndex,lastIndex) => {

  statistics.count++
  debugger
  if (statistics.count > nodeIndex)
    return
  if (statistics.count == Math.floor(nodeIndex)) {
    //如果命中结点为子树且展开，认定当作该结点的最后一个元素进行插入
    if (node.children && node.children.length > 0 && node.folded != true) {
      statistics.haff = haff
      statistics.itemIndex = node.children.length
    } else {

      var [itemIndex] = haff.splice(haff.length - 1, 1)
      haff.splice(haff.length - 1, 1)
      statistics.haff = haff
      statistics.itemIndex = pnode.children.length//作为父级结点的末结点插入
    }

  } else {
    //当前结点存在子树
    if (node.children && node.folded != true) {
      node.children.map((component, i) => {
        _dfs_traverse(component,node, haff.concat('children').concat(i), statistics, nodeIndex,lastIndex)
      })
    }else if(statistics.count==lastIndex)//当前结点为最末结点
    {
      debugger
      if(Calculate.canHold(node)&&node.folded==false)//当前结点具有容纳特性,且为展开
      {
        statistics.haff=haff
        statistics.itemIndex = 0
      }else{
        //作为父级结点的最末结点插入
        if(pnode)
        {
          var _haff=_.cloneDeep(haff)
          _haff.splice(_haff.length-1,1)
          _haff.splice(_haff.length-1,1)
          statistics.haff=_haff
          statistics.itemIndex = pnode.children.length
        }
      }
      return
    }
  }
}

//dfs,转换垂直下标成为对应结点haff
const dfs_traverse_ordinary = (components, haff, nodeIndex,lastIndex) => {

  var _stack = []
  _stack.push({ component: components.View, haff: haff })


  var ele = components.View
  var statistics = {
    count: -2
  }

  _dfs_traverse(ele,null, ['View'], statistics, nodeIndex,lastIndex)
  debugger
  return [statistics.haff, statistics.itemIndex]

}

//dfs,转换垂直下标成为对应结点haff
const preorder_traverse_ordinary = (components, haff, nodeIndex) => {

  var _stack = []
  _stack.push({ component: components.View, haff: haff })
  var count = -1;

  while (_stack.length != 0) {
    var ele = _stack.pop()
    //visit ele
    count++;
    if (count == nodeIndex) {
      if (ele.component.children && ele.component.children.length > 0 && ele.component.folded != true)//如果命中结点为子树，且展开
      {
        return [ele.haff, 0]
      } else {
        var [itemIndex] = ele.haff.splice(ele.haff.length - 1, 1)
        itemIndex++
        ele.haff.splice(ele.haff.length - 1, 1)
        return [ele.haff, itemIndex]
      }

    }


    if (ele.component.children && ele.component.folded != true) {
      ele.component.children.map((component, i) => {
        _stack.push({ component: component, haff: ele.haff.concat('children').concat(i) })
      })
    }
  }
}


//根据逻辑位置计算出插入的父结点
export const computeLogicHaff = (components, placeHolderIndex, type,lastIndex) => {
  var nodeIndex = placeHolderIndex + 1
  var haff = null
  var itemIndex = null
  if (type == 'ordinary')//普通位置插入
  {
    [haff, itemIndex] = dfs_traverse_ordinary(components, ['View'], nodeIndex-1,lastIndex)
  } else {
    //作为子结点插入
    var statistics = { count: 0 }
    preorder_traverse(components.View, ['View'], nodeIndex, statistics)
    haff = statistics.haff
  }

  return [haff, itemIndex]
}


export function _searchInProj(searchText, rootPath) {
  return {
    type: SEARCH_IN_PROJ,
    searchText,
    rootPath
  }
}

//全局搜索
export const searchInProj = (searchText) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {

      var state = getState()
      request(_searchInProj(searchText, state.directory.rootPath)).then((payload) => {
        resolve(payload)
      })
    })
  }
}

//按照后序遍历的顺序增加结点
let appendNode_In_postOrder = (node) => {
  return (dispatch, getState) => {


    var state = getState()
    var metalist = state.library.metalist
    //增加name和childLineBegin属性
    var name = node.name
    if (name) { }
    else {
      name = 'View'
    }
    node.name = name

    if (metalist && metalist.length > 0) {
      metalist.map((meta, j) => {
        if (meta.name == name)
          node.childLineBegin = meta.childLineBegin
      })
    }

    //访问子结点
    if (node.children && node.children.length > 0) {
      node.children.map((sub, j) => {
        dispatch(appendNode_In_postOrder(sub))
      })
    }

  }
}


const onComponentTreeAppend = (haff, itemIndex, componentTree) => {
  return (dispatch, getState) => {
    dispatch({
      type: ON_COMPONENT_TREE_APPEND,
      payload: {
        haff,
        itemIndex,
        componentTree
      }
    })
  }
}

//组件树做为结点-新增
export let appendComponentTreeAsComponentNode = (haff, componentTree, itemIndex) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      var state = getState()

      var metalist = state.library.metalist
      if (state.monaco.docCache && state.monaco.openDocId) {
        var doc = state.monaco.docCache[state.monaco.openDocId]
        if (doc) {

          var nodeTree = _.cloneDeep(componentTree)
          dispatch(appendNode_In_postOrder(nodeTree.View))

          dispatch(onComponentTreeAppend(haff, itemIndex, nodeTree.View))

        }
      }

    })
  }
}

//设置编辑器状态为被拽入
export const makeEditorDragged = () => {
  return (dispatch, getState) => {
    dispatch({
      type: MAKE_EDITOR_DRAGGED
    })
  }
}

//清除编辑器的拽入状态
export const makeEditorUnDragged = () => {
  return (dispatch, getState) => {
    dispatch({
      type: MAKE_EDITOR_UNDRAGGED
    })
  }
}
