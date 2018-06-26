import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import update from 'react/lib/update';
import TouchableOpacity from './TouchableOpacity';
import Text from './Text';
import ListRow from './ListRow';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import RowsRender from './RowsRender'
import {
    fetchLibraryTemplate,
    fetchLibraryTpl,
    cacheLibraryTemplate,
    cacheLibraryTpl
} from '../../actions/libraryActions';
import {
    switchComponent,
    onClassMethodInsert,
    _cacheDoc,
    computeLogicHaff,
    onComponentReplace,
    makeComponentStatusDirty,
    makeComponentHaffDirty
} from '../../actions/editorActions';
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

        var renderRow=null
        var methodHaff=null
        if(props.attributes&&props.attributes.renderRow)
        {
            var methodName=props.attributes.renderRow.methodName
            methodHaff=['classMethods',methodName]
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
                    case ItemTypes.COMPONENT_LISTVIEW:
                        componentType=ItemTypes.LISTVIEW
                        break;
                }

                props.dispatch(fetchLibraryTemplate(componentType)).then((json) => {

                    if (json.re == 1) {
                        var { template, attributes, childLineBegin, content } = json.data
                        debugger
                        //更新该组件的模板代码
                        props.dispatch(cacheLibraryTemplate(componentType, template))
                        
                        //更新组件树，显示新添加的结点
                        props.dispatch(onClassMethodInsert(methodHaff, template, attributes, componentType, childLineBegin, content))
                        //props.dispatch(makeComponentHaffDirty(parentHaff.concat('children').concat(itemIndex)))//..整个方法都是脏方法
                        //设置新增结点默认选中
                        props.dispatch(setComponentSelected(methodHaff.concat('ui')))
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



@DropTarget([
    ItemTypes.COMPONENT_VIEW,
    ItemTypes.COMPONENT_LISTVIEW, 
    ItemTypes.COMPONENT_TEXT,
    ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER, 
    ItemTypes.COMPONENT_ACTIONSHEET, 
    ItemTypes.COMPONENT_IMAGE],
    rowTarget, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
    }))
class ListViewInflater extends Component {


    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null
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
        var { attributes, isCustom , classMethods , connectDropTarget , isOver , } = this.props

        //do filering
        var className = 'column';
        var style = {
            flex: '1 1 auto'
        };

        if (props.clicked == true)
            className += ' clicked'
        if (props.children && props.children.length > 0)
            className += ' children'
        
        //如果列表项为复杂布局
        var predefined = null
        if (isCustom == true) {
        } else {
            predefined = <ListRow row={13} fields={attributes ? attributes.fields : null} />
        }

        var renderRow = null 
        var ui=null
        var methodHaff=null
        if(attributes.renderRow)
        {

            if(attributes.renderRow.methodName&&attributes.renderRow.methodName!=''){
                var methodName=attributes.renderRow.methodName
                var method=classMethods[methodName]
                ui=method.ui
                methodHaff=['classMethods',methodName,'ui']
                
                if(className.indexOf('children')==-1)
                    className+=' children'
            }
        }


        return (

            connectDropTarget(<div className={'ListView ' + className}
                style={style}
                onClick={(event) => {
                    this.props.onClick();
                    event = event || window.event;
                    event.preventDefault();
                    event.stopPropagation()
                }}
            >

                {/*
                    {
                        props.isCustom == true ?
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                            {props.children}
                        </div> :
                        predefined
                    }
                */}
                

             
                {   
                    props.isCustom==true||(attributes.renderRow&&attributes.renderRow.methodName)?
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                            <RowsRender  components={ui} haff={methodHaff}/>
                        </div>:
                        predefined
                }
            

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
            props.classMethods= doc.classMethods
            props.dictionary=doc.dictionary
        }
    }

    return props
}

export default connect(mapStateToProps)(ListViewInflater);


