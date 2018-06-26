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

class TextInputWrapperInflater extends Component {


    constructor(props) {
        super(props)

        this.state = {
            focused:false,
            index: props.index ? props.index : null
        }
    }



    render() {

        var state = this.state;
        var props = this.props;
        //以json格式存放style属性
        var { textInputStyle, height, val, placeholder , device } = this.props;
        //do filering
        var className = 'row';
        var style = {
            //height: 26,
            flexDirection: 'row',
            flex: '0 1 auto',
            paddingTop: SimulatorCalculate.mapToSimulatorSize(device, 2),
            paddingBottom:SimulatorCalculate.mapToSimulatorSize(device, 2),
            paddingRight:SimulatorCalculate.mapToSimulatorSize(device, 10)
        };


        if (props.clicked == true)
            className += ' clicked'



        if (height) {
            style.height = height;
            style.flex = '0 1 auto'
        } else {
        }

        if (textInputStyle) {
            if (textInputStyle.marginLeft) {
                style.marginLeft = textInputStyle.marginLeft
            }
            if (textInputStyle.color) {
                style.color = textInputStyle.color
            }
            if (textInputStyle.fontSize) {
                style.fontSize=SimulatorCalculate.mapToSimulatorSize(device, textInputStyle.fontSize)
            }
        }

        var cancelClass='cancel '
        if(this.state.focused==true)
        {
            cancelClass+='focused'
        }else{
        }

        

        return (

            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                <div className={'TextInputWrapper ' + className}
                    style={style}
                    onClick={(event) => {
                        this.props.onClick();
                        event = event || window.event;
                        event.preventDefault();
                        event.stopPropagation()
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto' }}>
                        <input placeholder={placeholder} 
                            style={Object.assign(styles.input, { display: 'flex', flex: '1 1 auto' })} 
                            onFocus={()=>{
                                if(this.state.focused!=true)
                                    this.setState({focused:true})
                            }}
                            onBlur={()=>{
                                if(this.state.focused==true)
                                    this.setState({focused:false})
                            }}
                            />
                    </div>

                    <div style={{ display: 'flex', flex: '0 1 auto', flexDirection: 'row',alignItems:'center' }} 
                        className={cancelClass}>
                        <FontAwesome name='times-circle' size={20} color="rgb(218, 8, 66)" style={{ paddingLeft: 5,paddingRight:10 }} />
                    </div>



                </div>

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
    input: {
        outline: 'none',
        borderWidth: 0,
        margin: 0,
        padding: 0,
        paddingLeft: 15,
        paddingRight: 15,
        background:'transparent'
    },
    row: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        alignItems: 'center'
    },
}

const mapStateToProps = (state, ownProps) => {
    
        const props = {}
        const device = state.simulator.device
        props.device = device

        return props
    }

export default connect(mapStateToProps)(TextInputWrapperInflater)
