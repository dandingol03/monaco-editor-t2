import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import _ from 'lodash'
import ItemTypes from '../../constants/ItemTypes';
import update from 'react/lib/update';

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


const rowTarget = {
    drop(props, monitor, component) {

        var re = monitor.getDropResult()
        //if component has been droped,current item skip to handle it 
        if (monitor.didDrop()) {
            return;
        }
        const item = monitor.getItem();
        
        //todo:1.firstly,i want to handle with one dragged item,
        //so i make the dragged component item to be my target which has no configuration
        if (item.index == undefined || item.index == null) {
            if (item.type) {
                var itemIndex = 0
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
                        var { template, attributes, childLineBegin , content  } = json.data
                        debugger
                        //更新该组件的模板代码
                        //todo:采用缓冲优化
                        props.dispatch(cacheLibraryTemplate(componentType, template))
                        //更新组件树，显示新添加的结点
                        props.dispatch(onTemplateInsert(parentHaff, itemIndex, template, attributes, componentType, childLineBegin , content))
                        props.dispatch(makeComponentHaffDirty(parentHaff.concat('children').concat(itemIndex)))
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
    ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER, ItemTypes.COMPONENT_ACTIONSHEET],
        rowTarget, (connect, monitor) => ({
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver({ shallow: true }),
        }))
class Image  extends Component {
    
    
        constructor(props) {
            super(props)
    
            this.state = {
                tag: props.tag ? props.tag : null,
                index: props.index ? props.index : null
            }
        }
    
    
    
        render() {
    
        
            var state = this.state;
            var props = this.props;
            //以json格式存放style属性
            var styleMap = props.styleMap;
            var { styleMap, device, connectDropTarget, isOver ,resizeMode ,source } = this.props
            //do filering
            var className = 'column';
            var style = {};
    
            if (styleMap.flex)
                style.flex = styleMap.flex + ' 1 auto'
            if (styleMap.flexDirection)
                className = styleMap.flexDirection
            //高亮显示
            if (props.clicked == true || isOver == true)
                className += ' clicked'
    
            if (props.children && props.children.length > 0)
                className += ' children'
            if (styleMap.width && styleMap.height) {
                style.width = styleMap.width;
                style.height = styleMap.height;
                style.flex = '0 0 auto'
            } else if (styleMap.width) {
                style.width = styleMap.width;
                style.flex = '0 1 auto'
    
            } else if (styleMap.height) {
                style.height = styleMap.height;
                if (styleMap.flex)
                { }
                else
                    style.flex = '0 1 auto'
            } else {
                //不限制宽度也不限制高度的view
                if (styleMap.flex)
                { }
                else {
                    style.flex = '0 1 auto'
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
    
            try {
                if (borderRadius == "" || borderRadius == undefined || borderRadius == null)
                    style.borderRadius = null
                else {
                    var borderRadius = parseInt(styleMap.borderRadius)
                    if (borderRadius >= 0)
                        style.borderRadius = borderRadius
                }
            } catch (e) {
                console.log('error -> in the value of border-radius')
            }
    
    
            return (
    
                connectDropTarget(<div className={'Image ' + className}
                    style={style}
                    onClick={(event) => {
                        this.props.onClick();
                        event = event || window.event;
                        event.preventDefault();
                        event.stopPropagation()
                    }}
                >
    
                    {props.children}
                </div>)
    
            )
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
    
    export default connect(mapStateToProps)(Image);