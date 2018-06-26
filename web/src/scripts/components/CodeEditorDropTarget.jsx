

/**
 * DropTarget(type, spec, collect)(component);
 * type,只有在 type 相同的情况下，DragSource 才能放到 DropTarget 中
 *
 *
 * 1>.spec,让你的组件响应dnd相关事件,支持以下方法:
 * drop(props, monitor, component) 可选，响应 drop 事件
 * hover(props, monitor, component) 可 选
 * canDrop(props, monitor) 可选
 * --props,组件当前的props
 * --monitor,用来查询drag state 的信息
 * --component表示当前组件
 *
 * 2>.collect(connect,monitor),这个函数可以帮助组件的属性注入
 * --connect,connect.dragSource()可以用来封装组件
 * --monitor,用来查询当前拖拽的信息
 *
 *
 */


import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom';
import { DropTarget } from 'react-dnd'
import _ from 'lodash'
//import TextUtils from '../../utils/editor/TextUtils'
import CodeEditor from './CodeEditor'
import CodeEditorWrapper from './CodeEditorWrapper';
import {
    updateCursorDecoration,
    makeEditorDragged
} from '../actions/editorActions'
import {
    inquireLibraryInstalled
} from '../actions/npmActions'
import {
    getProjPath
} from '../actions/projectActions'
import {
    makeLibraryWarningVisible
} from '../actions/rodalActions'

const target = {
    drop(props, monitor, component) {

        var { monaco } = props.middleware
        var range = null
        if (props.cursorDecoration) {
            //获取代码片插入初的位置
            range = monaco.getRangeFromDecorationId(props.cursorDecoration)
            //代码片拽入后取消cursor的decoration
            props.dispatch(updateCursorDecoration(props.docId, null))
            monaco.cancelCursorDecoration(props.cursorDecoration)

        }
        var item = monitor.getItem()
        var { type, template, npmName } = item

        //插入代码片,检查前面是否是开标签
        monaco.insertCodeTemplate(range, template)
        props.dispatch(makeEditorDragged())
        //检查是否安装该组件
        if (npmName && npmName != '')
            props.dispatch(inquireLibraryInstalled(getProjPath(), npmName)).then((json) => {
                if(json.re==1)//已安装
                {
                }else{
                    props.dispatch(makeLibraryWarningVisible(npmName))
                }
            })

    },
    hover(props, monitor, component) {
        //get the clinetOffset info
        const { x, y } = monitor.getClientOffset()
        const componentRect = findDOMNode(component).getBoundingClientRect();

        var { monaco } = props.middleware
        //TODO:obtain the cursor decoration
        var decoration = monaco.updateCursorDecoration(props.cursorDecoration, x, y)

        if (decoration) {
            props.dispatch(updateCursorDecoration(props.docId, decoration))
        }

    }
}





@DropTarget(['CODE_TEMPLATE'], target, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
}))
class CodeEditorDropTarget extends Component {
    constructor(props) {
        super(props)
        this.state = {
            offset: null,
        }
    }
    focus() {
        this.refs.editor.focus()
    }
    render() {
        const { isOver, connectDropTarget, middleware, display, visible } = this.props
        const { offset } = this.state

        // Enhance any middleware that have a setHover method
        _.each(middleware, (m) => {
            if (m.setHover) {
                m.setHover(isOver, offset)
            }
        })

        if (display == true) {
            //TODO:将visible属性上游
            if (visible == false) {
                return connectDropTarget(
                    <div style={{
                        flexDirection: 'column',
                        flex: '1 1 auto',
                        alignItems: 'stretch',
                        display: 'none',
                    }} className>
                        <CodeEditorWrapper ref={'editor'} {...this.props} />
                    </div>
                )
            } else {
                return connectDropTarget(
                    <div style={style} className>
                        <CodeEditorWrapper ref={'editor'} {...this.props} />
                    </div>
                )
            }
        } else {
            return connectDropTarget(
                <div style={{
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    alignItems: 'stretch',
                    display: 'none',
                }} className >
                    <CodeEditorWrapper ref={'editor'} {...this.props} />
                </div>
            )
        }

    }
}

const style = {
    flexDirection: 'column',
    flex: '1 1 auto',
    alignItems: 'stretch',
    display: 'flex',
}


const mapStateToProps = (state, ownProps) => {

    const props = {
        cursorDecoration: state.monaco.cursorDecoration
    }

    return props
}

export default connect(mapStateToProps)(CodeEditorDropTarget)


