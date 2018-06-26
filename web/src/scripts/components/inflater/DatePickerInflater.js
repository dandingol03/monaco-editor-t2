import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'
import SimulatorCalculate from '../../utils/SimulatorCalculate'
import {
    onDatePickerInit,
    onDatePickerDestroy,
    makeDatePickerModalVisible,
    makeDatePickerModalInvisible
} from '../../actions/datePickerActions'

/**
 *  DatePickerInflater ,DatePicker 的web适配层 
 */

class DatePickerInflater extends Component {

    constructor(props) {
        super(props)

        this.state = {
            index: props.index ? props.index : null
        }
    }

    render() {

        var state = this.state;
        var props = this.props;
        //以json格式存放style属性
        var { mode, placeholder, confirmBtnText, cancelBtnText, iconComponent, imports, showIcon, customStyles, styleMap, device , pickerVisible } = this.props


        var className = 'row';
        var style = {
            minHeight: 10,
            flexDirection: 'row',
            flex: '0 1 auto',

        };

        var dateTouchStyle = {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flex: '0 1 auto',
            cursor:'pointer'
        }

        if (props.clicked == true)
            className += ' clicked'

        var cancelClass = 'cancel '

        var iconLibrary = null
        if (iconComponent !== undefined && iconComponent !== null) {

            if (Object.prototype.toString.call(iconComponent) == '[object String]')
                iconComponent = JSON.parse(iconComponent)

            var name = iconComponent.name
            //look up the declareed icon variable in imports 
            if (imports && imports.length > 0) {
                imports.map((item, i) => {
                    if (item.declarations && item.declarations.length > 0) {
                        item.declarations.map((declare, j) => {
                            if (declare == name)
                                iconLibrary = item.font
                        })
                    }
                })
            }

            if (iconComponent.attributes.name[0] == '{')
                iconComponent.attributes.name = iconComponent.attributes.name.substring(1, iconComponent.attributes.name.length - 1)
            if (iconComponent.attributes.size[0] == '{')
                iconComponent.attributes.size = parseInt(iconComponent.attributes.size.substring(1, iconComponent.attributes.size.length - 1))

        }

        if (styleMap&&styleMap.width)
            dateTouchStyle.width = SimulatorCalculate.mapToSimulatorSize(device, styleMap.width)

        if (customStyles !== undefined && customStyles !== null) {
            if (customStyles.dateTouchBody) {
                dateTouchStyle.backgroundColor = customStyles.dateTouchBody.backgroundColor
                if (customStyles.dateTouchBody.height) {
                    dateTouchStyle.height = SimulatorCalculate.mapToSimulatorSize(device, customStyles.dateTouchBody.height)
                }

            }

            if (customStyles.placeholderText) {
                if (customStyles.placeholderText.fontSize) {
                    dateTouchStyle.fontSize=SimulatorCalculate.mapToSimulatorSize(device, customStyles.placeholderText.fontSize)
                }

                if (customStyles.placeholderText.color)
                    dateTouchStyle.color = customStyles.placeholderText.color
            }
        }


        return (

            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                <div className={'DatePickerInflater ' + className}
                    style={style}
                    onClick={(event) => {
                        this.props.onClick();
                        event = event || window.event;
                        event.preventDefault();
                        event.stopPropagation()
                    }}
                >

                    {
                        showIcon == true ?
                            <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto' }}>
                                    <span>{placeholder}</span>
                                </div>

                                <div style={{ display: 'flex', flex: '0 1 auto', flexDirection: 'row', alignItems: 'center' }}>
                                    {
                                        iconLibrary ?
                                            iconLibrary == 'FontAwesome' ?
                                                <FontAwesome
                                                    name={iconComponent.attributes.name}
                                                    size={iconComponent.attributes.size}
                                                    color={iconComponent.attributes.color} style={{ paddingLeft: 5, paddingRight: 10 }} /> :
                                                iconLibrary == 'Ionicons' ?
                                                    <Ionicons
                                                        name={iconComponent.attributes.name}
                                                        size={iconComponent.attributes.size}
                                                        color={iconComponent.attributes.color} style={{ paddingLeft: 5, paddingRight: 10 }} /> :
                                                    null : null

                                    }
                                </div>
                            </div> :
                            <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={dateTouchStyle}     
                                    onClick={(event) => {

                                        //todo:make picker visible
                                        if(pickerVisible)
                                        {
                                            this.props.dispatch(makeDatePickerModalInvisible())
                                        }
                                        else{
                                            this.props.onClick()
                                            this.props.dispatch(makeDatePickerModalVisible())
                                        }
                                        
                                        event = event || window.event;
                                        event.preventDefault();
                                        event.stopPropagation()
                                    }}>
                                    <span>{placeholder}</span>
                                </div>

                            </div>
                    }



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
        fontSize: '16px',
        borderWidth: 0,
        margin: 0,
        padding: 0,
        paddingLeft: 15,
        paddingRight: 15,
        background: 'transparent'
    },
    row: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        alignItems: 'center'
    },
}


const mapStateToProps = (state, ownProps) => {
    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    const device = state.simulator.device

    var props = {}
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.imports = doc.imports
        }
    }
    props.device = device
    props.pickerVisible=state.datePicker.pickerVisible
    return props
}

export default connect(mapStateToProps)(DatePickerInflater);
