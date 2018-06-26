import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import _ from 'lodash'
import ItemTypes from '../../constants/ItemTypes';
import update from 'react/lib/update';
import TouchableOpacity from './TouchableOpacity';
import Text from './Text';
import SimulatorCalculate from '../../utils/SimulatorCalculate'

import {
    switchComponent,
    onTemplateInsert,
    _cacheDoc,
    computeLogicHaff,
    onComponentReplace,
    makeComponentStatusDirty,
    makeComponentHaffDirty
} from '../../actions/editorActions';

import {
    fetchLibraryTemplate,
    fetchLibraryTpl,
    cacheLibraryTemplate,
    cacheLibraryTpl
} from '../../actions/libraryActions';

import {
    setComponentSelected
} from '../../actions/paletteActions';

const rowTarget = {
    drop(props, monitor, component) {

        var re = monitor.getDropResult()
        //if component has been droped,current item skip to handle it 
        if (monitor.didDrop()) {
            return;
        }
        const item = monitor.getItem();

        //拖入新的组件
        if (item.index == undefined || item.index == null) {
            if (item.type) {
                //var itemIndex = 0
                var itemIndex = component.props.children ? component.props.children.length : 0
                var parentHaff = _.cloneDeep(props.haff)
                debugger


                //根据dragType以及需要插入的代码得出attributes
                var componentType = null
                switch (item.type) {
                    case ItemTypes.COMPONENT_TEXT:
                        componentType = ItemTypes.TEXT
                        break;
                    case ItemTypes.COMPONENT_VIEW:
                        componentType = ItemTypes.VIEW
                        break;
                }

                props.dispatch(fetchLibraryTemplate(componentType)).then((json) => {

                    if (json.re == 1) {
                        var { template, attributes, childLineBegin, content } = json.data
                        debugger
                        //更新该组件的模板代码
                        //todo:采用缓冲优化
                        props.dispatch(cacheLibraryTemplate(componentType, template))
                        //更新组件树，显示新添加的结点
                        props.dispatch(onTemplateInsert(parentHaff, itemIndex, template, attributes, componentType, childLineBegin, content))
                        props.dispatch(makeComponentHaffDirty(parentHaff.concat('children').concat(itemIndex)))
                        //设置新增结点默认选中
                        props.dispatch(setComponentSelected(parentHaff.concat('children').concat(itemIndex)))
                    }
                })
            }

        }


        //done!!
        return { droped: true };
    },
    hover(props, monitor, component) {
        //当前悬停的元素
        const dragType = monitor.getItem().type;
        const hoverIndex = props.index;
        //拖拽的东西
        const dragIndex = monitor.getItem().index;
        var draggedHaff = monitor.getItem().haff

        //只有当hover处于当前组件表面时才返true,用于嵌套的判断
        var isOver = monitor.isOver({ shallow: true })

    }
}


@DropTarget([ItemTypes.COMPONENT_VIEW, ItemTypes.COMPONENT_LISTVIEW, ItemTypes.COMPONENT_TEXT,
ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER, ItemTypes.COMPONENT_ACTIONSHEET, ItemTypes.COMPONENT_IMAGE],
    rowTarget, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
    }))
class ScrollableTabView extends Component {


    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null,
            initialPage:0
        }
    }

    getFlatWidth(width) {
        if (Object.prototype.toString.call(width) == '[object Object]') {
            var stack = []

            if (width.expression !== undefined && width.expression !== null) {



                stack.push(width.expression.right.value)
                stack.push(width.expression.operator)
                var left = width.expression.left
                if (left.name == 'width')
                    stack.push('width')
                else {
                    while (left.name != 'width') {

                        stack.push(left.right.value)
                        stack.push(left.operator)
                        left = left.left
                    }
                    stack.push('width')
                }
                //现在栈顶肯定为width,进行实值替换
                var widthCur = 300
                stack.pop()
                while (stack.length != 0) {
                    var operator = stack.pop()
                    var operand = stack.pop()
                    switch (operator) {
                        case '*':
                            widthCur = widthCur * parseInt(operand)
                            break;
                        case '/':
                            widthCur = widthCur / parseInt(operand)
                            break;
                        case '+':
                            widthCur = widthCur + parseInt(operand)
                            break;
                        case '-':
                            widthCur = widthCur - parseInt(operand)
                            break;
                        default:
                            break;
                    }
                }
                return widthCur

            }
        } else {
            return width
        }
    }

    render() {

        var state = this.state;
        var props = this.props;
        //以json格式存放style属性
        var styleMap = props.styleMap;
        var { styleMap, device, connectDropTarget, isOver, tabLabels } = this.props
        //do filering
        var className = 'column';
        var style = {};

        if (styleMap) {
            if (styleMap.flex)
                style.flex = styleMap.flex + ' 1 auto'

            if (styleMap.width && styleMap.height) {

                style.width = this.getFlatWidth(styleMap.width)
                style.height = styleMap.height;
                style.flex = '0 0 auto'
            } else if (styleMap.width) {
                style.width = this.getFlatWidth(styleMap.width)
                style.flex = '0 1 auto'

            } else if (styleMap.height) {
                style.height = styleMap.height;
                if (styleMap.flex) { }
                else
                    style.flex = '0 1 auto'
            } else {
                //不限制宽度也不限制高度的view
                if (styleMap.flex) { }
                else {
                    style.flex = '1 1 auto'
                }
            }

            if (styleMap.marginTop) {
                style.marginTop = styleMap.marginTop
            }

            if (styleMap.marginLeft !== undefined && styleMap.marginLeft !== null)
                style.marginLeft = styleMap.marginLeft
            if (styleMap.marginRight !== undefined && styleMap.marginRight !== null)
                style.marginRight = styleMap.marginRight

            if (styleMap.padding) {
                style.padding = styleMap.padding + 'px'
            }
            if (styleMap.paddingTop) {
                style.paddingTop = SimulatorCalculate.mapToSimulatorSize(device, styleMap.paddingTop)
            }
            if (styleMap.paddingBottom) {
                style.paddingBottom = SimulatorCalculate.mapToSimulatorSize(device, styleMap.paddingBottom)
            }


            if (styleMap.paddingHorizontal !== undefined && styleMap.paddingHorizontal !== null) {
                style.paddingLeft = styleMap.paddingHorizontal
                style.paddingRight = styleMap.paddingHorizontal
            }

            if (styleMap.backgroundColor && styleMap.backgroundColor != '')
                style.backgroundColor = styleMap.backgroundColor

            if (styleMap.justifyContent && styleMap.justifyContent != '')
                style.justifyContent = styleMap.justifyContent

            if (styleMap.alignItems && styleMap.alignItems != '')
                style.alignItems = styleMap.alignItems

            if (styleMap.borderBottomWidth || styleMap.borderWidth) {
                try {
                    if (styleMap.borderBottomWidth) {
                        style.borderBottomWidth = parseInt(styleMap.borderBottomWidth)
                        style.borderBottomStyle = 'solid'
                    }
                    if (styleMap.borderWidth) {
                        style.borderWidth = parseInt(styleMap.borderWidth)
                        style.borderStyle = 'solid'
                    }
                } catch (e) {
                }
            }

            if (styleMap.borderBottomColor && styleMap.borderBottomColor != '')
                style.borderBottomColor = styleMap.borderBottomColor
            if (styleMap.borderColor && styleMap.borderColor != '')
                style.borderColor = styleMap.borderColor

            if (styleMap.borderRadius && styleMap.borderRadius != '') {
                try {

                } catch (e) {
                    console.log('error -> in the value of border-radius')
                }
                var borderRadius = parseInt(styleMap.borderRadius)
                if (borderRadius >= 0)
                    style.borderRadius = borderRadius
            } else {
                style.borderRadius = null
            }

            if (style.height && style.height != '' && (style.height == 1 || style.height == 2))
                style.padding = 0

        }


        //高亮显示
        if (props.clicked == true || isOver == true)
            className += ' clicked'

        if (props.children && props.children.length > 0)
            className += ' children'

        //tabLabels
        var tabs = []
        if (tabLabels && tabLabels.length > 0) {
            tabLabels.map((tabLabel, i) => {
                tabs.push(
                    <div className='tabLabel' key={i} style={{ display: 'flex', flexDirection: 'column', flex: '1' }}
                        onClick={(event)=>{
                            this.setState({initialPage:i})
                            event = event || window.event;
                            event.preventDefault();
                            event.stopPropagation()
                        }}
                    >
                        <div style={{ display: 'flex', flex: '0 1 auto', height: 3 }}></div>
                        <span style={{ fontSize: '12px', textAlign: 'center' }}>{tabLabel}</span>
                        <div style={{ display: 'flex', flex: '0 1 auto', height: 9 }}></div>
                        {
                            i == this.state.initialPage ?
                                <div style={{ display: 'flex', flex: '0 1 auto', backgroundColor: '#e74040', height: 2 }}></div> :
                                null
                        }
                    </div>)
            })
        }


        return (

            connectDropTarget(<div className={'ScrollableTabView ' + className}
                style={style}
                onClick={(event) => {
                    this.props.onClick();
                    event = event || window.event;
                    event.preventDefault();
                    event.stopPropagation()
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#bbb', borderBottomStyle: 'solid' }}>
                    {tabs}
                </div>

                {props.children[this.state.initialPage]}
            </div>)

        )
    }

    componentDidMount(){
        console.log('scrolltab done')
    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '0 0 auto',
        width: '320px',
        height: '560px',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    row: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        alignItems: 'center'
    },
    body: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
    },
    item: {
        display: 'flex',
        flexDirection: 'row'
    }
}

const mapStateToProps = (state, ownProps) => {

    const props = {}
    const device = state.simulator.device
    props.device = device

    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.doc = doc
        }
    }

    return props
}

export default connect(mapStateToProps)(ScrollableTabView);
