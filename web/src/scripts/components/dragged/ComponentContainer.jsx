import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import ComponentView from './ComponentView';
import ComponentImage from './ComponentImage'
import ComponentModal from './ComponentModal'
import ComponentTouchableOpacity from './ComponentTouchableOpacity'
import ComponentListView from './ComponentListView';
import ComponentScrollView from './ComponentScrollView';
import ComponentAnimatedView from './ComponentAnimatedView';
import ComponentToolbar from './ComponentToolbar';
import ComponentText from './ComponentText';
import ComponentTextInputWrapper from './ComponentTextInputWrapper'
import ComponentSeperator from './ComponentSeperator';
import ComponentPositionSeperator from './ComponentPositionSeperator';
import ComponentIcon from './ComponentIcon';
import ComponentActionSheet from './ComponentActionSheet';
import MonacoMiddleware from '../../middleware/monaco/MonacoMiddleware';


import {
    setComponentSelected,
    setComponentUnSelected,
    updateSelectedHaff,
    selectComponentNode,
    makeComponentSwitched,
    storeSwitchOp
} from '../../actions/paletteActions';
import {
    switchComponent,
    onTemplateInsert,
    _cacheDoc,
    computeLogicHaff,
    onComponentReplace,
    onComponentExchange,
    makeComponentStatusDirty,
    makeComponentHaffDirty,
    makeComponentHaffDeleted,
    convertItemIndex2ChildLocIndex
} from '../../actions/editorActions';
import {
    fetchLibraryTemplate,
    fetchLibraryTpl,
    cacheLibraryTemplate,
    cacheLibraryTpl
} from '../../actions/libraryActions';
import {
    saveFile,
    getFileMetadata
} from '../../actions/fileActions'
import {
    makeNodeFolded,
    makeNodeSpread,
} from '../../actions/componentTreeActions'

import ArrayUtils from '../../utils/ArrayUtils';
import Calculate from '../../utils/Calculate'

//    components:[
//                 {name:'view 1',type:ItemTypes.VIEW,children:[
//                     {name:'linear 1',type:ItemTypes.LINEAR,children:[
//                         {name:'text1',type:ItemTypes.TEXT},
//                         {name:'text2',type:ItemTypes.TEXT},
//                         {name:'text3',type:ItemTypes.TEXT},
//                     ]},
//                     {name:'linear 2',type:ItemTypes.LINEAR},
//                 ]},
//                 {name:'view 2',type:ItemTypes.VIEW},
//             ]

const OFFSET_HEIGHT = 29;
const CARD_MARGIN = 0;//apply to the textview marginLeft:2
const CARD_HEIGHT = 26;
const CENTER_HEIGHT = 20;

function getPlaceholderIndex(y, offset) {
    // shift placeholder if y position more than card height / 2
    var ele = document.getElementById('scroll-container')
    var scrollTop = 0
    if (ele)
        scrollTop = ele.scrollTop
    const yPos = y + scrollTop - offset - CARD_HEIGHT;
    let placeholderIndex;
    if (yPos < (CARD_HEIGHT / 2 - CENTER_HEIGHT / 2)) {
        console.log('-1......')
        console.log('ypos->' + yPos)
        console.log('y->' + y + scrollTop)

        placeholderIndex = -1; // place at the start
    } else {

        placeholderIndex = Math.floor((yPos - CARD_HEIGHT / 2) / (CARD_HEIGHT + CARD_MARGIN));
        var max = (placeholderIndex + 1) * (CARD_HEIGHT + CARD_MARGIN) + CARD_HEIGHT / 2
        var min = placeholderIndex * (CARD_HEIGHT + CARD_MARGIN) + CARD_HEIGHT / 2

        if ((yPos >= (max - CENTER_HEIGHT / 2)) || (yPos <= min + CENTER_HEIGHT / 2)) {

            if (yPos >= (max - CENTER_HEIGHT / 2))//位于下个结点的中心部分
            {
                placeholderIndex += 0.5
                //console.log('half down')
            } else {
                //位于上个结点的中心位置
                placeholderIndex -= 0.5
                //console.log('half up')
            }
        }

    }
    return placeholderIndex;
}



const rowTarget = {
    drop(props, monitor, component) {

        //开放了placeHolder并保持drag元素的位置
        //因此现在的placeHolderIndex->[-1,max(index)]
        //1.当用户进行拖拽时，dragIndex<=>min(placeHolderIndex+1,max(index))

        var { placeHolderIndex, dragIndex, dragId, dragType, components, draggedHaff } = component.state;


        var _components = _.cloneDeep(components);

        var comp = _components[dragIndex]

        var componentC = 1//View根容器默认
        debugger
        if (_components) {
            componentC = Calculate.count(1, _components)
        } else {
        }

        debugger
        //添加新元素
        if (dragIndex == undefined || dragIndex == null) {

            debugger
            //作为子结点进行插入
            if ((placeHolderIndex * 10) % 10 == 5 || (placeHolderIndex * 10) % 10 == -5) {

                //根据前序遍历获得插入的结点前缀
                var [placeHolderHaff] = computeLogicHaff(props.doc.components, placeHolderIndex + 0.5, null, componentC = 2)

                //根据dragType以及需要插入的代码得出attributes
                //再拉取template的同时,拉取tpl编译模板
                props.dispatch(fetchLibraryTemplate(dragType)).then((json) => {

                    if (json.re == 1) {
                        var { template, attributes, childLineBegin } = json.data

                        //更新该组件的模板代码
                        props.dispatch(cacheLibraryTemplate(dragType, template))

                        if (attributes && attributes.style && Object.prototype.toString.call(attributes.style) == '[object Object]')
                            attributes.style = '{' + JSON.stringify(attributes.style) + '}'
                        //更新组件树，显示新添加的结点
                        props.dispatch(onTemplateInsert(placeHolderHaff, null, template, attributes, dragType, childLineBegin))
                        //拉取该组件的编译模板内容，以便生成代码时进行调用
                        props.dispatch(fetchLibraryTpl(dragType)).then((json) => {
                            if (json.re == 1) {
                                var { tpl } = json.data
                                //更新改组健的编译模板
                                props.dispatch(cacheLibraryTpl(dragType, tpl))
                            }
                            component.setState({ placeHolderIndex: null })
                            props.dispatch(makeComponentHaffDirty(placeHolderHaff.concat('children').concat(0)))
                        })
                    }
                })
            } else {//作为正常结点插入

                debugger
                //根据前序遍历获得插入的结点前缀
                var [placeHolderHaff, itemIndex] = computeLogicHaff(props.doc.components, placeHolderIndex, 'ordinary', componentC - 2)

                //根据dragType以及需要插入的代码得出attributes

                props.dispatch(fetchLibraryTemplate(dragType)).then((json) => {

                    if (json.re == 1) {
                        var { template, attributes, childLineBegin } = json.data
                        //更新该组件的模板代码
                        props.dispatch(cacheLibraryTemplate(dragType, template))
                        //更新组件树，显示新添加的结点
                        props.dispatch(onTemplateInsert(placeHolderHaff, itemIndex, template, attributes, dragType, childLineBegin))
                        component.setState({ placeHolderIndex: null })
                        props.dispatch(makeComponentHaffDirty(placeHolderHaff.concat('children').concat(itemIndex)))
                    }
                })
            }

            return;
        }




        //结点树的位置调整功能,首先将本结点的数据插入到目标结点,接着再进行删除
        //根据前序遍历获得插入的结点前缀
        var [placeHolderHaff, itemIndex] = computeLogicHaff(props.doc.components, placeHolderIndex, 'ordinary')
        debugger
        //同一结点
        if (ArrayUtils.compare(draggedHaff, placeHolderHaff.concat('children').concat(itemIndex)))
            return;

        //convert itemIndex of dragged to childLocIndex
        var childLocIndex = convertItemIndex2ChildLocIndex(props.doc.components, draggedHaff, true)

        //进行结点位置的交换
        props.dispatch(onComponentReplace(placeHolderHaff, itemIndex, draggedHaff))
        //清除占位符显示
        component.setState({ placeHolderIndex: null })
        props.dispatch(makeComponentHaffDeleted(draggedHaff, childLocIndex))
        props.dispatch(makeComponentHaffDirty(placeHolderHaff.concat('children').concat(itemIndex)))
        if (props.componentStatus == 'clean')
            props.dispatch(makeComponentStatusDirty())

        // if (placeHolderIndex > dragIndex)//被拖拽物体被放置于下方
        // {
        //     if (placeHolderIndex == -1)
        //         placeHolderIndex = 0
        // }
        // else {
        //     //被拖拽物体被放置于其上方
        //     placeHolderIndex = Math.min(props.components.length - 1, placeHolderIndex + 1)
        // }

        // var { docId, haff1, haff2 } = { docId: props.docId, haff1: ['View', 'children', dragIndex], haff2: ['View', 'children', placeHolderIndex] }

        // var component1 = props.doc.components
        // var component2 = props.doc.components
        // haff1.map((pa, i) => {
        //     component1 = component1[pa]
        // })
        // haff2.map((pa, i) => {
        //     component2 = component2[pa]
        // })


        // //switch code and component
        // if (component1.loc.start.line < component2.loc.start.line) {
        //     var [newLoc2, newLoc1] = props.middleware.monaco.switchContent(component1.loc, component2.loc)
        //     props.dispatch(switchComponent(docId, haff1, haff2, newLoc1, newLoc2))
        // } else {
        //     var [newLoc1, newLoc2] = props.middleware.monaco.switchContent(component2.loc, component1.loc)
        //     props.dispatch(switchComponent(docId, haff1, haff2, newLoc1, newLoc2))
        // }

        // //重新设置选中组件的haff
        // if (props.palette.haff) {
        //     if (_.xor(props.palette.haff, haff1).length == 0) //如果为被拖拽物体
        //     {
        //         props.dispatch(updateSelectedHaff(haff2))
        //         //更改Inflater的选中位置
        //         props.dispatch(setComponentSelected(haff2))
        //     } else if (_.xor(props.palette.haff, haff2).length == 0)//如果为被放置物体
        //     {
        //         props.dispatch(updateSelectedHaff(haff1))
        //         //更改Inflater的选中位置
        //         props.dispatch(setComponentSelected(haff1))
        //     } else { }
        // }





        //component.setState({ components: _components })

    },
    hover(props, monitor, component) {
        //当前悬停的元素
        const dragType = monitor.getItem().type;
        const hoverIndex = props.index;
        //拖拽的东西
        const dragIndex = monitor.getItem().index;
        var draggedHaff = monitor.getItem().haff
        if (dragType != ItemTypes.COMPONENT_VIEW && dragType != ItemTypes.COMPONENT_TEXT &&
            dragType != ItemTypes.COMPONENT_TOOLBAR && dragType != ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER &&
            dragType != ItemTypes.COMPONENT_LISTVIEW && dragType != ItemTypes.COMPONENT_ACTIONSHEET &&
            dragType != ItemTypes.COMPONENT_TOUCHABLE_OPACITY) {

        }
        else {
            if (dragType == ItemTypes.COMPONENT_VIEW || dragType == ItemTypes.COMPONENT_TEXT ||
                dragType == ItemTypes.COMPONENT_TOOLBAR || dragType == ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER ||
                dragType == ItemTypes.COMPONENT_LISTVIEW || dragType == ItemTypes.COMPONENT_ACTIONSHEET ||
                dragType == ItemTypes.COMPONENT_TOUCHABLE_OPACITY
            )//COMPONENT_VIEW组件和COMPONENT_TEXT组件
            {


                if (dragIndex != null) {
                    if (dragIndex === hoverIndex) {
                        return;
                    }
                }

                const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
                const placeHolderIndex = getPlaceholderIndex(
                    monitor.getClientOffset().y, hoverBoundingRect.top
                );
                //console.log('y->'+(monitor.getClientOffset().y-hoverBoundingRect.top))
                //console.log('placeHolderIndex-> '+placeHolderIndex)
                if (dragType == ItemTypes.COMPONENT_TEXT) {
                    component.setState({
                        placeHolderIndex: placeHolderIndex, dragIndex: dragIndex,
                        dragId: 'component-text-' + dragIndex,
                        dragType: ItemTypes.TEXT,
                        draggedHaff: draggedHaff
                    });
                } else if (dragType == ItemTypes.COMPONENT_VIEW) {
                    component.setState({
                        placeHolderIndex: placeHolderIndex, dragIndex: dragIndex,
                        dragId: 'component-view-' + dragIndex,
                        dragType: ItemTypes.VIEW,
                        draggedHaff: draggedHaff
                    });
                } else if (dragType == ItemTypes.COMPONENT_TOUCHABLE_OPACITY) {
                    component.setState({
                        placeHolderIndex: placeHolderIndex, dragIndex: dragIndex,
                        dragId: 'component-touchable-opacity-' + dragIndex,
                        dragType: ItemTypes.TOUCHABLE_OPACITY,
                        draggedHaff: draggedHaff
                    });
                }
                else if (dragType == ItemTypes.COMPONENT_ACTIONSHEET) {
                    component.setState({
                        placeHolderIndex: placeHolderIndex, dragIndex: dragIndex,
                        dragId: 'component-action-sheet-' + dragIndex,
                        dragType: ItemTypes.ACTIONSHEET,
                        draggedHaff: draggedHaff
                    });
                } else if (dragType == ItemTypes.COMPONENT_TOOLBAR) {
                    component.setState({
                        placeHolderIndex: placeHolderIndex, dragIndex: dragIndex,
                        dragId: 'component-toolbar-' + dragIndex,
                        dragType: ItemTypes.TOOLBAR
                    });
                } else if (dragType == ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER) {
                    component.setState({
                        placeHolderIndex: placeHolderIndex, dragIndex: dragIndex,
                        dragId: 'component-text-input-wrapper-' + dragIndex,
                        dragType: ItemTypes.TEXT_INPUT_WRAPPER
                    });
                } else if (dragType == ItemTypes.COMPONENT_LISTVIEW) {
                    component.setState({
                        placeHolderIndex: placeHolderIndex, dragIndex: dragIndex,
                        dragId: 'component-listview-' + dragIndex,
                        dragType: ItemTypes.LISTVIEW
                    });
                }

                //TODO:judge where it is the inline element
                if (dragIndex != null) {
                    const item = monitor.getItem();
                    //document.getElementById(item.id).style.display = 'none';
                } else {

                }


            }
        }


    }
};


var counter = {
    val: 0,
    isPlaceHold: false
}



@DropTarget([ItemTypes.COMPONENT_VIEW, ItemTypes.COMPONENT_LISTVIEW, ItemTypes.COMPONENT_TEXT, ItemTypes.COMPONENT_TOOLBAR,
ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER, ItemTypes.COMPONENT_ACTIONSHEET, ItemTypes.COMPONENT_TOUCHABLE_OPACITY],
    rowTarget, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
    }))
class ComponentContainer extends Component {

    traverse(root, haff) {
        var arr = [];
        var { isOver } = this.props
        var { placeHolderIndex } = this.state


        if (root) {
            root.map((component, i) => {

                var index = counter.val++

                //当渲染了placeHolderIndex，自动将isPlaceHold标志置为false
                if (isOver) {

                    if (placeHolderIndex == index - 1) {
                        //arr.push(<ComponentSeperator key="placeholder" label='--holder--' />);
                        counter.isPlaceHold = false
                    }


                }



                var placeInCenter = false
                //TODO:改成二叉树的比对方式
                if (index == placeHolderIndex + 0.5) {
                    console.log('placeholderIndex-> ' + placeHolderIndex + '\n' + '...place in center...')
                    placeInCenter = true
                }
                var prefix = haff.concat('children').concat(i)

                var selected = false
                var selectedHaff = this.props.selectedHaff

                if (ArrayUtils.compare(selectedHaff, prefix)) //如果为被拖拽物体
                    selected = true

                //处理处于交换状态的结点
                var switched = false
                if (this.props.switched.haffs && this.props.switched.haffs.length > 0) {
                    var switchedHaff = this.props.switched.haffs[0]
                    if (ArrayUtils.compare(switchedHaff, prefix))//如果为处于交换状态的结点
                        switched = true
                }


                switch (component.name) {

                    case ItemTypes.TOOLBAR:

                        arr.push(
                            <ComponentToolbar index={i} key={i} folded={component.folded} selected={selected}
                                onClick={() => {
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))

                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {this.traverse(component.children, prefix)}
                            </ComponentToolbar>)
                        break;

                    case ItemTypes.MODAL:
                        arr.push(
                            <ComponentModal index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    //如果已为折叠状态
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))
                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {
                                    component.folded == true ?
                                        null :
                                        this.traverse(component.children, prefix)
                                }
                            </ComponentModal>)

                        break;
                    case ItemTypes.IMAGE:
                        arr.push(
                            <ComponentImage index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    //如果已为折叠状态
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))

                                }}

                                onSelect={() => {
                                    this.props.dispatch(selectComponentNode(prefix))
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {
                                    component.folded == true ?
                                        null :
                                        this.traverse(component.children, prefix)
                                }
                            </ComponentImage>)

                        break;
                    case ItemTypes.TOUCHABLE_OPACITY:
                        arr.push(
                            <ComponentTouchableOpacity index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    //如果已为折叠状态
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))
                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {
                                    component.folded == true ?
                                        null :
                                        this.traverse(component.children, prefix)
                                }
                            </ComponentTouchableOpacity>)

                        break;
                    case ItemTypes.VIEW:

                        arr.push(
                            <ComponentView index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    console.log()
                                    //如果已为折叠状态
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))
                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {
                                    component.folded == true ?
                                        null :
                                        this.traverse(component.children, prefix)
                                }
                            </ComponentView>)

                        break;
                    case ItemTypes.SCROLLVIEW:
                        arr.push(
                            <ComponentScrollView index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    console.log()
                                    //如果已为折叠状态
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))
                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {
                                    component.folded == true ?
                                        null :
                                        this.traverse(component.children, prefix)
                                }
                            </ComponentScrollView>)
                        break;
                    case ItemTypes.ANIMATED_VIEW:
                        arr.push(
                            <ComponentAnimatedView index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    console.log()
                                    //如果已为折叠状态
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))
                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {
                                    component.folded == true ?
                                        null :
                                        this.traverse(component.children, prefix)
                                }
                            </ComponentAnimatedView>)
                        break;
                    case ItemTypes.LISTVIEW:
                        arr.push(
                            <ComponentListView index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    console.log()
                                    //如果已为折叠状态
                                    if (component.folded == true)
                                        this.props.dispatch(makeNodeSpread(prefix))
                                    else
                                        this.props.dispatch(makeNodeFolded(prefix))
                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            >
                                {
                                    component.folded == true ?
                                        null :
                                        this.traverse(component.children, prefix)
                                }
                            </ComponentListView>)

                        break;
                    case ItemTypes.ACTIONSHEET:
                        arr.push(
                            <ComponentActionSheet index={i} key={i} folded={component.folded} haff={prefix} selected={selected}
                                triangle={component.children && component.children.length > 0 ? component.folded == true ? 'right' : 'down' : null}
                                onClick={() => {

                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeInCenter={placeInCenter}
                            />)
                        break;
                    case ItemTypes.TEXT:
                        var abstract = null
                        if (component.content) {
                            if (component.content.toString().length > 20) {
                                abstract = component.content.toString().substring(0, 20) + '...'
                            } else {
                                abstract = component.content
                            }
                        }
                        arr.push(
                            <ComponentText key={i} index={i} name={abstract} haff={prefix} selected={selected}
                                switched={switched}
                                onClick={(event) => {

                                    if (event.shiftKey)//通过shift键选中
                                    {
                                        if (selected) {
                                            this.props.dispatch(setComponentUnSelected())//取消选中
                                        }

                                        //修改组件树
                                        if (this.props.switched.haffs && this.props.switched.haffs.length == 1 && !switched) {
                                            var switched2 = prefix
                                            var switched1 = this.props.switched.haffs.pop()
                                            //修改组件树
                                            this.props.dispatch(onComponentExchange(switched1, switched2))
                                            //存储交换时序,当模式切入代码模式时检查是否存在交换时序
                                            this.props.dispatch(storeSwitchOp(switched1, switched2))


                                        } else {
                                            this.props.dispatch(makeComponentSwitched(prefix))
                                        }
                                    } else {
                                        if (selected != true) {
                                            this.props.dispatch(setComponentSelected(prefix))
                                        }
                                    }

                                }}
                            />
                        )
                        break;
                    case ItemTypes.TEXT_INPUT_WRAPPER:
                        if (component.attributes) {
                            var { val, placeholder, onChangeText } = component.attributes
                        }

                        arr.push(
                            <ComponentTextInputWrapper key={i} index={i} name={abstract} selected={selected}
                                onClick={() => {

                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                placeholder={placeholder}
                                val={val}
                                onChangeText={onChangeText}
                            />
                        )
                        break;
                    case ItemTypes.ICON:
                        if (component.attributes) {
                            var { val } = component.attributes
                        }

                        arr.push(
                            <ComponentIcon key={i} index={i} name={abstract} selected={selected}
                                onClick={() => {

                                    if (selected != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                            />
                        )
                        break;
                }

                //TODO:make some change to this?
                if (isOver) {
                    if (placeHolderIndex == (index - 0.5) && counter.isPlaceHold == true) {

                        //arr.push(<ComponentSeperator positionInCenter={true} key="placeholder" label='--holder--' />);
                        counter.isPlaceHold = false
                    }

                }



                if (isOver && placeHolderIndex == index) {
                    if (component.children && component.children.length > 0) { }
                    else {
                        //arr.push(<ComponentSeperator key="placeholder" label='--holder--' />);
                        counter.isPlaceHold = false
                    }

                }

            });
        }

        return arr;
    }


    constructor(props) {
        super(props)

        this.state = {
            components: props.components !== undefined && props.components !== null ? props.components : null
        }
    }

    render() {

        counter.val = 0
        counter.isPlaceHold = true

        var props = this.props
        var state = this.state

        var { folded } = this.props
        const { isDragging, connectDropTarget, isOver, components , selectedHaff } = this.props;
        var { placeHolderIndex } = this.state;
        var className = '';

        if (folded == true)//本结点处于折叠状态
            className = 'right'
        else
            className = 'down'

        var arr = []


        //placeholderIndex会随着鼠标的y增大，而index超过数组长度，而以下检查保证越界的index默认在最后位置渲染
        // if (isPlaceHold && isOver) {
        //     arr.push(<ComponentSeperator key="placeholder" label='--holder--' />);
        // }

        var holderClass=null
        var childItems = null
        if(selectedHaff&&selectedHaff.indexOf('classMethods')!=-1)
        {
            childItems=this.traverse(components.children,['classMethods'].concat(selectedHaff[1]).concat('ui'))
            holderClass=components.name
        }
        else
            childItems = this.traverse(components, ['View'])

        // if (counter.isPlaceHold && isOver)
        //     childItems.push(<ComponentSeperator key="placeholder" label='--holder--' />)

        if (isOver && this.state.placeHolderIndex !== undefined && this.state.placeHolderIndex !== null) {
            //TODO:根据这个算出距离

            var placeHolderIndex = this.state.placeHolderIndex

            if (placeHolderIndex == -1) {

                childItems.push(<ComponentPositionSeperator key='test' label='--holder--'
                    top={CARD_HEIGHT} />)
            } else {
                var index = Math.min(this.state.placeHolderIndex + 1, counter.val)

                if ((index * 10) % 10 == 5 || (index * 10) % 10 == -5)//居中
                {

                    childItems.push(<ComponentPositionSeperator key='test' label='--holder--' positionInCenter={true}
                        top={CARD_HEIGHT + (index) * (CARD_HEIGHT) + 4} />)
                } else {

                    childItems.push(<ComponentPositionSeperator key='test' label='--holder--'
                        top={CARD_HEIGHT + (index) * (CARD_HEIGHT)} />)
                }

            }
        }

    



        return (


            connectDropTarget(
                <div id='scroll-container' className={holderClass!=null?"Component-"+holderClass:"Component-Container"}  
                    style={styles.container}>

                {/*parent node*/}
                <div style={{
                    display: 'flex', flex: '0 0 auto', height: '26px', flexDirection: 'row',
                    justifyContent: 'flex-start'
                }}
                    onClick={(event) => {

                        //如果已为折叠状态
                        if (folded == true)
                            this.props.dispatch(makeNodeSpread(['View']))
                        else
                            this.props.dispatch(makeNodeFolded(['View']))
                        event.preventDefault()
                        event.stopPropagation()
                    }}
                >

                    {
                        childItems ?
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <span className={className}></span>
                            </div> :
                            <span className='icon'></span>
                    }
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span className={holderClass?'icon-'+holderClass[0].toLowerCase()+holderClass.substring(1,holderClass.length):'icon-container'}>
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span className='label'>
                            {
                                holderClass?
                                ""+holderClass:
                                "View"
                            }
                        </span>
                    </div>

                </div>

                <div style={{ paddingLeft: 25 }}>
                    {
                        folded != true ?
                            childItems : null
                    }

                </div>

            </div>)

        )
    }
}



const styles = {
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        paddingLeft: '15px',
        position: 'relative',
        overflowY: 'scroll'
    },
}


const mapStateToProps = (state, ownProps) => {

    const props = {

    }

    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.doc = doc
            props.folded = doc.components.View.folded
            props.components = doc.components.View.children
            props._IStandaloneCodeEditor = state.monaco._IStandaloneCodeEditor
            props.componentStatus = state.monaco.componentStatus
        }
        props.docId = docId
    }

    //如果已有选中组件
    if (state.palette.haff) {
        props.palette = state.palette
    }

    
    //已有已选中的组件
    if (state.palette.component && state.palette.haff) {
        var haff = state.palette.haff
        props.selectedHaff = haff
        if(state.palette.haff.indexOf('classMethods')!=-1)
        {
            props.components=doc.classMethods[state.palette.haff[1]].ui//以类方法作为组件树的基点 
        }
    }

    //已有组件结点处于交换状态
    if (state.palette.switched) {
        props.switched = state.palette.switched
    }


    props.haff = state.palette.componentNode.haff

    return props
}



export default connect(mapStateToProps)(ComponentContainer);
