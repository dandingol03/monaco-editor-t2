import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom';

import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'
import SimulatorCalculate from '../../utils/SimulatorCalculate'

class TextInput extends Component {


    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null,
        }
    }

    getFlatHeight(height) {
        if (Object.prototype.toString.call(height) == '[object Object]') {
            var stack = []

            if (height.expression !== undefined && height.expression !== null) {



                stack.push(height.expression.right.value)
                stack.push(height.expression.operator)
                var left = height.expression.left
                if (left.name == 'height')
                    stack.push('height')
                else {
                    while (left.name != 'height') {

                        stack.push(left.right.value)
                        stack.push(left.operator)
                        left = left.left
                    }
                    stack.push('height')
                }
                //现在栈顶肯定为width,进行实值替换
                var heightCur = 500
                stack.pop()
                while (stack.length != 0) {
                    var operator = stack.pop()
                    var operand = stack.pop()
                    switch (operator) {
                        case '*':
                            heightCur = heightCur * parseInt(operand)
                            break;
                        case '/':
                            heightCur = heightCur / parseInt(operand)
                            break;
                        case '+':
                            heightCur = heightCur + parseInt(operand)
                            break;
                        case '-':
                            heightCur = heightCur - parseInt(operand)
                            break;
                        default:
                            break;
                    }
                }
                return heightCur

            }
        } else {
            return SimulatorCalculate.mapToSimulatorSize(this.props.device, height)
            //return height
        }
    }


    render() {

        var state = this.state;
        var props = this.props;
        var { styleMap, name, placeholder, device, height } = this.props

        //do filering
        var className = 'row';
        var style = {};
        var textInputStyle =
            {
                display: 'flex',
                borderWidth: 0,
                backgroundColor:'transparent'
            };

        if (styleMap) {
            if (styleMap.flex) {
                style.flex = styleMap.flex + ' 1 auto'
                textInputStyle.width = "100%"
            }

            if (styleMap.flexDirection)
                className = styleMap.flexDirection
            if (props.clicked == true)
                className += ' clicked'
            if (styleMap.width && styleMap.height) {
                style.width = styleMap.width;
                style.height = this.getFlatHeight(styleMap.height)
                style.flex = '0 0 auto'
            } else if (styleMap.width) {
                style.width = styleMap.width;
                style.flex = '0 1 auto'

            } else if (styleMap.height) {
                style.height = this.getFlatHeight(styleMap.height)
                style.flex = '0 1 auto'
            } else {
                //不限制宽度也不限制高度的view
            }

            if (styleMap.borderBottomWidth !== undefined && styleMap.borderBottomWidth !== null)
                textInputStyle.borderBottomWidth = styleMap.borderBottomWidth

            if (styleMap.fontSize !== undefined && styleMap.fontSize !== null)
                textInputStyle.fontSize = SimulatorCalculate.mapToSimulatorSize(device, styleMap.fontSize)

            if (styleMap.backgroundColor && styleMap.backgroundColor != '')
                style.backgroundColor = styleMap.backgroundColor

            if (styleMap.padding) {
                style.padding = SimulatorCalculate.mapToSimulatorSize(device, styleMap.padding) + 'px'
                //style.padding = styleMap.padding + 'px'
            }
            
            if(styleMap.borderRadius)
            {
                style.borderRadius=SimulatorCalculate.mapToSimulatorSize(device, styleMap.borderRadius)
            }



            if (height) {
                var heightValue = null
                if (height[0] == '{')
                    heightValue = parseInt(height.toString().substring(1, height.toString().length - 1))
                else
                    heightValue = parseInt(height)
                textInputStyle.height = SimulatorCalculate.mapToSimulatorSize(device, heightValue)
            }


        }





        return (

            <div className={'TextInput ' + className}
                style={style}
                onClick={(event) => {
                    this.props.onClick();
                    event = event || window.event;
                    event.preventDefault();
                    event.stopPropagation()
                }}
            >

                <input style={textInputStyle} placeholder={placeholder} />
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

    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    const device = state.simulator.device

    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.imports = doc.imports
        }
    }

    props.device = device
    return props
}



export default connect(mapStateToProps)(TextInput);
