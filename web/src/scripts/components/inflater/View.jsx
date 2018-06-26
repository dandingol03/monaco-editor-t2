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

import OperatorPriority from '../../constants/operatorPriority'


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
                    case ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER:
                        componentType=ItemTypes.TEXT_INPUT_WRAPPER
                        break;
                    case ItemTypes.COMPONENT_TOUCHABLE_OPACITY:
                        componentType=ItemTypes.TOUCHABLE_OPACITY
                        break;
                    case ItemTypes.COMPONENT_SCROLLVIEW:
                        componentType=ItemTypes.SCROLLVIEW
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


@DropTarget([
    ItemTypes.COMPONENT_VIEW,
    ItemTypes.COMPONENT_LISTVIEW, 
    ItemTypes.COMPONENT_TEXT,
    ItemTypes.COMPONENT_TEXT_INPUT_WRAPPER,
    ItemTypes.COMPONENT_ACTIONSHEET, 
    ItemTypes.COMPONENT_IMAGE,
    ItemTypes.COMPONENT_TOUCHABLE_OPACITY,
    ItemTypes.COMPONENT_SCROLLVIEW
],
    rowTarget, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
    }))
class View extends Component {


    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null
        }
    }

    widthExpressionParser(width) {
        var operandStack = []
        var operatorStack = []
        var i = 0
        var j = 0
        var priorityTable = {
            '+': 0,
            '-': 0,
            '/': 1,
            '*': 1
        }
        //运算逻辑每次压入一个操作数和一个操作符
        while (j < width.length && i < width.length) {

            while (width[j] != '*' && width[j] != '/' && width[j] != '-' && width[j] != '+' && j < width.length)
                j++

            var word = width.substring(i, j)
            operandStack.push(word)//压入操作数
            if (j >= width.length)//已经循环完毕
                break

            if (operatorStack.length == 0)//如果操作数栈为空
            {
                operatorStack.push(width[j])//压栈
            } else {

                //比较与之前操作符的优先级,如果比他们低则进行计算
                while (priorityTable[operatorStack[operatorStack.length - 1]] > priorityTable[width[j]]) {
                    var number2 = operandStack.pop()
                    var number1 = operandStack.pop()
                    if (number1 == 'width')//替换
                        number1 = 300
                    var prevOperator = operatorStack.pop()
                    var result = 0
                    switch (prevOperator) {
                        case '+':
                            result = number1 + number2
                            break;
                        case '-':
                            result = number1 - number2
                            break;
                        case '*':
                            result = number1 * number2
                            break;
                        case '/':
                            result = number1 / number2
                            break;
                    }
                    operandStack.push(result)
                }
                //否则进行压栈
                operatorStack.push(width[j])

            }
            //迭代
            i = j + 1
            j++

        }

        //此时从左至右依次进行运算
        while (operatorStack.length != 0) {
            var number1 = operandStack.shift()
            if (number1 == 'width')
                number1 = 300
            var number2 = operandStack.shift()
            var operator = operatorStack.shift()
            var re = 0
            switch (operator) {
                case '+':
                    re = number1 + number2
                    break;
                case '-':
                    re = number1 - number2
                    break;
                case '/':
                    re = number1 / number2
                    break;
                case '*':
                    re = number1 * number2
                    break;
            }
            operandStack.unshift(re)
        }
        return operandStack.shift()


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
        } else if (width == 'width') {
            return 300
        } else if (Object.prototype.toString.call(width) == '[object Number]') {
            return SimulatorCalculate.mapToSimulatorSize(this.props.device, width)
        } else if (width.indexOf('width') != -1)//含width的表达式
        {
            var widthReg1 = /width([\*|\/|\+\-]\d+){1,}$/
            var widthReg2 = /width([\*|\/|\+\-]\d+){0,}([\*|\/|\+|\-]{1,})$/
            if (widthReg1.exec(width) != null || widthReg2.exec(width) != null) {
                //处理width表达式
                return this.widthExpressionParser(width)
            }
            return 300
        }
        else {
            return SimulatorCalculate.mapToSimulatorSize(this.props.device, width)
            //return width
        }
    }

    //从左至右扫描字符串表达式
    expressionParser(expression){
        var operators = []//操作符栈
        var operands=[]//操作树栈
        var heightVal=500
        var widthVal=300
        var j=0
        var i=0
        var operand1=null
        var operand2=null
        expression= expression.replace('width','300')
        expression= expression.replace('height','500')
        while(i<expression.length&&j<expression.length)
        {
            while(expression[j]>='0'&&expression[j]<='9'&&j<expression.length)//数字
                j++;
            if(i==j)//当前为operator
            {
                operators.push(expression[j])
                j++
            }
            else//operand
            {
                operand2=parseInt(expression.substring(i,j))
                if(operators.length==0)
                    operands.push(operand2)
                else{
                    switch(operators.pop())
                    {
                        case '-': 
                        case '+':
                            operands.push(operand2)
                        break;
                        case '*':
                            operand1=operands.pop()
                            operands.push(operand1*operand2)
                            break;
                        case '/':
                            operand1=operands.pop()
                            operands.push(operand1/operand2)
                        break;
                    }
                }
            }
            i=j
        }
        //运算未执行完
        while(operators.length!=0)
        {
            var operator=operators.pop()
            operand2=operands.pop()
            operand1=operands.pop()
            switch(operator)
            {
                case '+':
                    operands.push(operand1+operand2)
                break;
                case '-':
                    operands.push(operand1-operand2)
                break;
            }
        }
        return operands.pop()
    }
    getFlatHeight(height) {
        if (Object.prototype.toString.call(height) == '[object Object]') {
            var operators = []//操作符栈
            var operands=[]//操作树栈
            if (height.expression !== undefined && height.expression !== null) {


                var expression=height.expression
                while(expression!=null)
                {
                    if(operators.length==0)//操作符栈内为空，不需要比较优先级
                    {
                        operands.push(expression.right.value)
                    }
                    else{

                        if(expression.type=='NumericLiteral'||expression.type=='Identifier')
                        {
                            if(operators.length!=0)
                            {
                                var operator=operators.pop()
                                var operand1=null
                                if(expression.type=='Identifier')
                                    operand1=500
                                else
                                    operand1=expression.value
                                var operand2=operands.pop()
                                switch(operator)
                                {
                                    case '+':
                                        operands.push(operand1+operand2)
                                    break;
                                    case '-':
                                        operands.push(operand1-operand2)
                                    break;
                                    case '*':
                                        operands.push(operand1*operand2)
                                    break;
                                    case '/':
                                        operands.push(operand1/operand2)
                                    break;
                                }
                            }
                        }else if(OperatorPriority[expression.operator]<=OperatorPriority[operators[0]]) 
                        {
                            var operand1=null
                            if(expression.right.type=='Identifier'&&expression.right.name=='height')
                                operand1=500
                            else
                                operand1=expression.right.value
                            var operand2=operands.pop()
                            var operator=operators.pop()
                            switch(operator)
                            {
                                case '+':
                                    operands.push(operand1+operand2);
                                break;
                                case '-':
                                operands.push(operand1-operand2); 
                                break;
                                case '*':
                                operands.push(operand1*operand2);
                                break;
                                case '/':
                                operands.push(operand1/operand2);
                                break;
                            }
                        }else{
                            operands.push(operand1)
                        }       
                    }
                    if(expression.operator)
                        operators.push(expression.operator)
                    expression=expression.left
                }
                
                return operands.pop()

            }
        } else if (height == 'height') {
            return 500
        } else if (typeof(height) == 'number') {
            return SimulatorCalculate.mapToSimulatorSize(this.props.device, height)
        } 
        else if (height.indexOf('height') != -1)//含width的表达式
        {
            var heightReg1 = /height([\*|\/|\+\-]\d+){1,}$/
            var heightReg2 = /height([\*|\/|\+\-]\d+){0,}([\*|\/|\+|\-]{1,})$/
            if (heightReg1.exec(height) != null || heightReg2.exec(height) != null) {
                //处理height表达式
                return this.expressionParser(height)
            }
            return 500
        } else {
            return SimulatorCalculate.mapToSimulatorSize(this.props.device, height)
        }
    }


    render() {

        var state = this.state;
        var props = this.props;
        //以json格式存放style属性
        var styleMap = props.styleMap;
        var { styleMap, device, connectDropTarget, isOver, tabLabel } = this.props
        //do filering
        var className = 'column';
        var style = {};

        if (styleMap) {
            if (styleMap.flex)
                style.flex = styleMap.flex
            //style.flex = styleMap.flex + ' 1 auto'
            if (styleMap.flexDirection)
                className = styleMap.flexDirection

            if (styleMap.width && styleMap.height) {

                style.width = this.getFlatWidth(styleMap.width)
                style.height = this.getFlatHeight(styleMap.height)
                style.flex = '0 0 auto'
            } else if (styleMap.width) {
                style.width = this.getFlatWidth(styleMap.width)
                if(styleMap.flexDirection&&styleMap.flexDirection=='column')
                    {}
                else
                    style.flex = '0 1 auto'

            } else if (styleMap.height) {
                style.height = this.getFlatHeight(styleMap.height)
                if (styleMap.flex) { }
                else
                    style.flex = '0 1 auto'
            } else {
                //不限制宽度也不限制高度的view
                if (styleMap.flex) { }
                else {
                    ///style.flex = '0 1 auto' 
                }
            }

            if (styleMap.margin) {
                style.marginTop = SimulatorCalculate.mapToSimulatorSize(device, styleMap.margin)
                style.marginBottom = style.marginTop
                style.marginLeft = style.marginTop
                style.marginRight = style.marginTop
            }

            if (styleMap.marginTop) {
                style.marginTop = styleMap.marginTop
            }

            if (styleMap.marginLeft !== undefined && styleMap.marginLeft !== null)
                style.marginLeft = SimulatorCalculate.mapToSimulatorSize(device, styleMap.marginLeft)
            if (styleMap.marginRight !== undefined && styleMap.marginRight !== null)
                style.marginRight = styleMap.marginRight

            if (styleMap.padding) {
                style.padding = SimulatorCalculate.mapToSimulatorSize(device, styleMap.padding) + 'px'
                //style.padding = styleMap.padding + 'px'
            }
            if (styleMap.paddingTop) {
                style.paddingTop = SimulatorCalculate.mapToSimulatorSize(device, styleMap.paddingTop)
            }
            if (styleMap.paddingBottom) {
                style.paddingBottom = SimulatorCalculate.mapToSimulatorSize(device, styleMap.paddingBottom)
            }


            if (styleMap.paddingHorizontal !== undefined && styleMap.paddingHorizontal !== null) {
                style.paddingLeft = SimulatorCalculate.mapToSimulatorSize(device, styleMap.paddingHorizontal)
                style.paddingRight = style.paddingLeft
            }

            if (styleMap.paddingVertical !== undefined && styleMap.paddingVertical !== null) {
                style.paddingTop = styleMap.paddingVertical
                style.paddingBottom = styleMap.paddingVertical
            }

            if (styleMap.backgroundColor && styleMap.backgroundColor != '')
                style.backgroundColor = styleMap.backgroundColor

            if (styleMap.justifyContent && styleMap.justifyContent != '')
                style.justifyContent = styleMap.justifyContent

            if (styleMap.alignItems && styleMap.alignItems != '')
                style.alignItems = styleMap.alignItems

            if(styleMap.borderTopWidth)//borderTopWidth
            {
                try{
                    if(styleMap.borderTopWidth)
                    {
                        if(typeof(styleMap.borderTopWidth)=='string')
                        {
                            if(styleMap.borderTopWidth.indexOf('px')!=-1)
                                style.borderTopWidth = parseInt(styleMap.borderTopWidth)+' !important'    
                            else
                                style.borderTopWidth = parseInt(styleMap.borderTopWidth)+'px !important'
                            
                        }
                        else if(typeof(styleMap.borderTopWidth)=='number')
                            style.borderTopWidth=styleMap.borderTopWidth
                        else{}

                        style.borderTopStyle = 'solid'
                        
                    }
                }catch(e)
                {
                    console.error(e)
                }
            }

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
            if(styleMap.borderTopColor && styleMap.borderTopColor!='')
                style.borderTopColor=styleMap.borderTopColor
            if (styleMap.borderColor && styleMap.borderColor != '')
                style.borderColor = styleMap.borderColor

            if (styleMap.borderRadius && styleMap.borderRadius != '') {
                try {

                } catch (e) {
                    console.log('error -> in the value of border-radius')
                }
                var borderRadius = SimulatorCalculate.mapToSimulatorSize(device, parseInt(styleMap.borderRadius))
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

        //针对tabLabel
        if (tabLabel && tabLabel != '')
            style.flex = '1 1 auto'

        return (

            connectDropTarget(<div className={'View ' + className}
                style={style}
                onClick={(event) => {
                    this.props.onClick();
                    event = event || window.event;
                    event.preventDefault();
                    event.stopPropagation()
                }}
            >
                {
                    props.content && props.content != '' ?
                        props.content : props.children
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
        }
    }

    return props
}

export default connect(mapStateToProps)(View);
