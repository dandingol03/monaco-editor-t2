import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom';
import Icon from './Icon'
import View from './View'
import ItemTypes from '../../constants/ItemTypes';
import SimulatorCalculate from '../../utils/SimulatorCalculate'




class TouchableOpacity extends Component {


    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null,
            clicked: props.clicked ? props.clicked : false,
            leafs: props.leafs ? props.leafs : null
        }
    }

    getFlatWidth(width) {
        if (Object.prototype.toString.call(width) == '[object Object]') {
            var stack = []
            
            if (width.expression!==undefined&&width.expression!==null) {

                
              
                stack.push(width.expression.right.value)
                stack.push(width.expression.operator)
                var left = width.expression.left
                if (left.name == 'width')
                    stack.push('width')
                else {
                    while (left.name != 'width') {
                        
                        stack.push(left.right.value)
                        stack.push(left.operator)
                        left=left.left
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
            return SimulatorCalculate.mapToSimulatorSize(this.props.device, width)
            //return width
        }
    }

    render() {

        var state = this.state;
        var props = this.props;
        //以json格式存放style属性
        var styleMap = props.styleMap;
        //do filering
        var className = 'column';
        var style = {
        };

        if (styleMap) {
            if (styleMap.flex)
                style.flex = styleMap.flex 
            if (styleMap.flexDirection)
                className = styleMap.flexDirection

            if (styleMap.flexDirection == undefined || styleMap.flexDirection == null)
                className = 'column'
            if (props.clicked == true)
                className += ' clicked'
                
            

            if (styleMap.width && styleMap.height) {
                
                style.width=this.getFlatWidth(styleMap.width)
                style.height = styleMap.height;
                style.flex = '0 0 auto'
            } else if (styleMap.width) {
                style.width=this.getFlatWidth(styleMap.width)
                
                if(styleMap.flex==null||styleMap.flex==undefined)
                    style.flex = '0 1 auto'

            } else if (styleMap.height) {
                style.height = styleMap.height;
                style.flex = '0 1 auto'
            } else {
                //不限制宽度也不限制高度的view

            }
            if (styleMap.justifyContent && styleMap.justifyContent != '') {
                style.justifyContent = styleMap.justifyContent
            }
            if (styleMap.alignItems && styleMap.alignItems != '')
                style.alignItems = styleMap.alignItems

            if (styleMap.marginBottom) {
                try {
                    style.marginBottom = SimulatorCalculate.mapToSimulatorSize(props.device, styleMap.marginBottom)
                } catch (e) { }
            }

            if (styleMap.backgroundColor && styleMap.backgroundColor != '')
                style.backgroundColor = styleMap.backgroundColor

            if (styleMap.borderRadius) {
                try {
                    var borderRadius = parseInt(styleMap.borderRadius)
                    style.borderRadius = SimulatorCalculate.mapToSimulatorSize(props.device, borderRadius)
                } catch (e) {
                    console.error(e)
                }
            }

            if (styleMap.padding) {
                style.padding= SimulatorCalculate.mapToSimulatorSize(props.device, styleMap.padding)+'px'
                //style.padding = styleMap.padding + 'px'
            }
            
            if(styleMap.borderWidth&&styleMap.borderWidth!='')
                style.borderWidth=styleMap.borderWidth

            if(styleMap.borderBottomWidth&&styleMap.borderBottomWidth!='')
            {
                style.borderBottomWidth=styleMap.borderBottomWidth
                style.borderbottomStyle='solid'
            }
            
            if(styleMap.borderBottomColor&&styleMap.borderBottomColor!='')
                style.borderBottomColor=styleMap.borderBottomColor

            if(styleMap.borderbottomStyle&&styleMap.borderbottomStyle!='')
                style.borderbottomStyle=styleMap.borderbottomStyle+' !important'

        }

        if (props.children && props.children.length > 0)
            className += ' children'

        
        if(styleMap&&styleMap.width&&Object.prototype.toString.call(styleMap.width)=='[object Object]')
        {
            switch(styleMap.width.type)
            {
                case "BinaryExpression":
                    if(styleMap.width.operator=="-")
                    {
                        style.marginLeft=styleMap.width.right/2
                        style.marginRight=styleMap.width.right/2
                    }
                break;
            }
        }
    

        return (

            <div className={'TouchableOpacity ' + className}
                style={style}
                onClick={(event) => {
                    this.props.onClick();
                    event = event || window.event;
                    event.preventDefault();
                    event.stopPropagation()
                }}
            >

                {props.children}
            </div>

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

export default connect(mapStateToProps)(TouchableOpacity);
