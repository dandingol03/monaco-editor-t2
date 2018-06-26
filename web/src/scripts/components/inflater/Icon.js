import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom';

import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'
import CommIcon from '../../../fonts/MaterialCommunityIcons/MaterialCommunityIcons'
import SimulatorCalculate from '../../utils/SimulatorCalculate'

class Icon extends Component {


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
        var { styleMap, name, color , size } = this.props

        //do filering
        var className = 'column';
        var style = {};


        if (styleMap) {
            if (styleMap.flex)
                style.flex = styleMap.flex + ' 1 auto'
            if (styleMap.flexDirection)
                className = styleMap.flexDirection
            if (props.clicked == true)
                className += ' clicked'
            if (styleMap.width && styleMap.height) {
                style.width = styleMap.width;
                style.height = styleMap.height;
                style.flex = '0 0 auto'
            } else if (styleMap.width) {
                style.width = styleMap.width;
                style.flex = '0 1 auto'

            } else if (styleMap.height) {
                style.height = styleMap.height;
                style.flex = '0 1 auto'
            } else {
                //不限制宽度也不限制高度的view
            }
            
            if(styleMap.padding)
                style.padding=styleMap.padding
            if(styleMap.paddingRight)
                style.paddingRight=styleMap.paddingRight
            if(styleMap.paddingLeft)
                style.paddingLeft=styleMap.paddingLeft
        }

        var libraryIcon = 'FontAwesome'
        if (props.imports && props.imports.length > 0) {
            props.imports.map((item, i) => {
                if (item.declarations && item.declarations.length > 0) {
                    item.declarations.map((declare, j) => {
                        if (declare == 'Icon') {
                            libraryIcon = item.font
                        }

                    })
                }
            })
        }

        var wrapperReg=/{\'(.*?)\'}/
        var isWrapped=wrapperReg.exec(name)
        if(isWrapped!=null&&isWrapped[1]!=null)
        {
            name=isWrapped[1]
        }


        return (

            <div className={'Icon ' + className}
                style={style}
                onClick={(event) => {
                    this.props.onClick();
                    event = event || window.event;
                    event.preventDefault();
                    event.stopPropagation()
                }}
            >
            {
                libraryIcon=='FontAwesome'?
                <FontAwesome name={name ? name : 'car'} size={size?SimulatorCalculate.mapToSimulatorSize(this.props.device, size):23} color={color?color:'#222'} />:
                libraryIcon=='MaterialCommunityIcons'?
                <CommIcon name={name ? name : 'car'} size={size?SimulatorCalculate.mapToSimulatorSize(this.props.device, size):23} color={color?color:'#222'} />:
                <Ionicons name={name ? name : 'car'} size={size?SimulatorCalculate.mapToSimulatorSize(this.props.device, size):23} color={color?color:'#222'} />
            }

                
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
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.imports = doc.imports
        }
    }
    const device = state.simulator.device
    props.device = device

    return props
}



export default connect(mapStateToProps)(Icon);
