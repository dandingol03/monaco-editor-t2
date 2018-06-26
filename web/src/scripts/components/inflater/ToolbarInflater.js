import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'
import SimulatorCalculate from '../../utils/SimulatorCalculate'


const OPTION_SHOW = 'OPTION_SHOW'
const OPTION_NEVER = 'OPTION_NEVER'


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
class ToolbarInflater extends Component {


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
        var { styleMap, height, title, actions, cancelIcon, connectDropTarget, isOver } = this.props;
        //do filering
        var className = 'row';
        var style = {
            height: 45,
            paddingTop: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: '#66CDAA',
            flex: '0 1 auto'
        };


        if (props.clicked == true || isOver==true)
            className += ' clicked'



        if (height) {
            style.height = height;
            style.flex = '0 1 auto'
        } else {
        }

        if (styleMap) {
            if (styleMap.marginTop) {
                style.marginTop = styleMap.marginTop
            }
            if (styleMap.padding) {
                style.padding = styleMap.padding
            }
            if (styleMap.paddingTop) {
                style.paddingTop = styleMap.paddingTop
            }
        }

        var menus = []
        var options = []
        var hiddenOptions = []
        if (actions && actions.length > 0) {
            actions.map((action, i) => {
                if (action.show == OPTION_SHOW) {

                    //区别按钮和图标渲染
                    if (action.value && action.value != '') {
                        if (action.backgroundColor && action.backgroundColor != '') {
                            var optionDefaultStyle = {
                                display: 'flex',
                                flex: '0 1 auto',
                                flexDirection: 'row',
                                alignItems: 'center',
                                color: '#fff',
                                borderRadius: 4,
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 3,
                                paddingBottom: 3,
                                fontSize: 10,
                                marginRight: 5
                            }

                            optionDefaultStyle.background = action.backgroundColor
                            menus.push(
                                <div style={optionDefaultStyle}
                                    key={i}>
                                    {action.value}
                                </div>
                            )
                        } else {
                            menus.push(
                                <div style={{ display: 'flex', flex: '0 1 auto', flexDirection: 'row', alignItems: 'center', fontSize: 10 }}
                                    key={i}>
                                    {action.value}
                                </div>
                            )
                        }
                    } else {
                        if (action.icon == 'ACTION_ADD') {
                            menus.push(
                                <div style={{ display: 'flex', flex: '0 1 auto', width: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                    key={i}>
                                    <Ionicons name='md-add' size={24} color="#fff" />
                                </div>
                            )
                        } else {
                            menus.push(
                                <div style={{ display: 'flex', flex: '0 1 auto', width: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                    key={i}>
                                    <Ionicons name={action.icon} size={24} color="#fff" />
                                </div>
                            )
                        }
                    }

                } else if (action.show == OPTION_NEVER) {
                    hiddenOptions.push(
                        <div style={{ display: 'flex', flex: '0 1 auto', flexDirection: 'row', alignItems: 'center' }} key={i}>
                            {action.value}
                        </div>
                    )
                }
            })
        }


        return (

            connectDropTarget(<div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                <div className={'Toolbar ' + className}
                    style={style}
                    onClick={(event) => {
                        this.props.onClick();
                        event = event || window.event;
                        event.preventDefault();
                        event.stopPropagation()
                    }}
                >
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>

                        {
                            cancelIcon && cancelIcon != '' ?
                                <Ionicons name={cancelIcon} size={24} color="#fff" style={{ paddingLeft: 15 }} /> :
                                <Ionicons name='md-arrow-back' size={24} color="#fff" style={{ paddingLeft: 15 }} />
                        }

                        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 25 }}>
                            <span style={{ fontSize: 14, color: '#fff' }}>{title}</span>
                        </div>

                        {menus}

                        {
                            hiddenOptions.length > 0 ?
                                <div style={{
                                    display: 'flex', flex: '0 1 auto', width: 35, flexDirection: 'row',
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Ionicons name='md-more' size={24} color="#fff" />
                                </div> : null
                        }


                    </div>

                </div>
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

    return props
}

export default connect(mapStateToProps)(ToolbarInflater);
