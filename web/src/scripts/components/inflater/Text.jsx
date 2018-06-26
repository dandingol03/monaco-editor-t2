import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import SimulatorCalculate from '../../utils/SimulatorCalculate'


/**
 * fontSize:
 * 1.Nexus_5x 15->11
 */

class Text extends Component {




    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null,
        }
    }



    render() {




        var state = this.state;
        var props = this.props;
        //以json格式存放style属性

        var { device, styleMap , content } = this.props;
        var className = '';
        var style = {
            fontSize:12,//尺寸为设备相关
            whiteSpace:'nowrap'
        };
        style.display = 'flex'
        style.alignItems = 'center'
        style.overflow='hidden'
        

        if (props.clicked == true)
            className += ' clicked'

        if (styleMap) {
            if (styleMap.flex)
                style.flex = styleMap.flex + ' 1 auto'
            if (styleMap.flexDirection)
                className = styleMap.flexDirection
            if (styleMap.width && styleMap.height) {
                style.width = SimulatorCalculate.mapToSimulatorSize(this.props.device, styleMap.width)
                if (styleMap.height.indexOf('px') != -1)
                    style.height = styleMap.height;
                else
                    style.height = styleMap.height + 'px'
                style.flex = '0 0 auto'
            } else if (styleMap.width) {
                style.width=SimulatorCalculate.mapToSimulatorSize(this.props.device, styleMap.width)
                style.flex = '0 1 auto'

            } else if (styleMap.height) {
                if (styleMap.height.indexOf('px') != -1)
                    style.height = styleMap.height;
                else
                    style.height = styleMap.height + 'px'

                style.flex = '1 0 auto'
            } else {
                //不限制宽度也不限制高度的view
            }
            //字体
            if (styleMap.fontSize && styleMap.fontSize != '') {
                if (styleMap.fontSize.toString().indexOf('px') != -1) {
                    var size = parseInt(styleMap.fontSize.toString().replace('px', ''))
                    style.fontSize = SimulatorCalculate.mapToSimulatorSize(device, size)
                }
                else
                    style.fontSize = SimulatorCalculate.mapToSimulatorSize(device, styleMap.fontSize) + 'px'
            }
            
            //边距 
            if (styleMap.margin && styleMap.margin != '') {
                if (styleMap.margin.toString().indexOf('px') != -1)
                    style.margin = styleMap.margin
                else
                    style.margin = styleMap.margin + 'px'
            }
            //下边距
            if (styleMap.marginBottom && styleMap.marginBottom != '') {
                if (styleMap.marginBottom.toString().indexOf('px') != -1)
                    style.marginBottom = styleMap.marginBottom
                else
                    style.marginBottom = styleMap.marginBottom + 'px'
            }
            //字体颜色
            if (styleMap.color && styleMap.color != '') {
                style.color = styleMap.color
            }

            //内边距
            if (styleMap.padding && styleMap.padding != '')
                style.padding = styleMap.padding

            //水平-内边距
            if (styleMap.paddingHorizontal && styleMap.paddingHorizontal != '') {
                style.paddingLeft = styleMap.paddingHorizontal
                style.paddingRight = styleMap.paddingHorizontal
            }
        }


        var wrappedReg = /^{(.*?)}$/
        var contentStr=''
        if(content&&content!=null)
        {
        
            if(Object.prototype.toString.call(content)=='[object Object]')
            {
                if(content.type&&content.type!='')
                {
                    switch(content.type)
                    {
                        case 'ConditionalExpression':
                            contentStr=content.consequence
                        break;
                        case 'JSXExpressionContainer':
                            contentStr=content.value
                    }
                }else{
                    contentStr=content.value
                }
            }else if(Object.prototype.toString.call(content)=='[object String]'){
                contentStr=content
            }
        }


        
        if(contentStr.length>14)
            contentStr=contentStr.substring(0,14)+'...'
        


        return (

            <div id={props.id} className={'Text ' + className}
                style={style} dangerouslySetInnerHTML={{ __html: contentStr.replace(/'\\n'/, '<br/>') }}
                onClick={(event) => {
                    this.props.onClick();
                    event = event || window.event;
                    event.preventDefault();
                    event.stopPropagation()
                }}
            >
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

    var props = {}
    const device = state.simulator.device
    props.device = device
    return props
}


export default connect(mapStateToProps)(Text);
