import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom';

import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'


class IoniconsIcon extends Component {


    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null,
        }
    }



    //一级组件的交换
    onSwitch(dragIndex, hoverIndex) {

        const { leafs } = this.state;
        const row = leafs[dragIndex];

        //TODO:如果需要迁移已选中的组件，则保持clicked属性的跟综

        this.setState(update(this.state, {
            leafs: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, row]
                ]
            }
        }));
    }



    render() {

        var state = this.state;
        var props = this.props;
        var { styleMap, name, color } = this.props

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
        }

        var libraryIcon = 'Ionicons'
        if (props.imports && props.imports.length > 0) {
            props.imports.map((item, i) => {
                if (item.declarations && item.declarations.length > 0) {
                    item.declarations.map((declare, j) => {
                        if (declare == 'Ionicons') {
                            libraryIcon = item.font
                        }

                    })
                }
            })
        }

        var wrappedReg=/^{(.*?)}$/
        var converted=wrappedReg.exec(name)
        if(converted!=null&&converted[1]!=null)
            name=converted[1]
        var singleQuoteReg=/^\'(.*?)\'$/
        converted=singleQuoteReg.exec(name)
        if(converted!=null&&converted[1]!=null)
            name=converted[1]

        return (

            <div className={'Ionicons ' + className}
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
                <FontAwesome name={name ? name : 'car'} size={24} color={color?color:'#222'} />:
                <Ionicons name={name ? name : 'car'} size={24} color={color?color:'#222'} />
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

    return props
}



export default connect(mapStateToProps)(IoniconsIcon);
