import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import _ from 'lodash';
import ItemTypes from '../../constants/ItemTypes';
import { findDOMNode } from 'react-dom';
const OFFSET_HEIGHT = 26;
const CARD_MARGIN = 1;//apply to the textview marginLeft:2
const CARD_HEIGHT = 26;

function getPlaceholderIndex(y, offset) {
    // shift placeholder if y position more than card height / 2
    const yPos = y - offset - OFFSET_HEIGHT;
    let placeholderIndex;
    if (yPos < CARD_HEIGHT / 2) {
        placeholderIndex = -1; // place at the start
    } else {

        placeholderIndex = Math.floor((yPos - CARD_HEIGHT / 2) / (CARD_HEIGHT + CARD_MARGIN));
    }
    return placeholderIndex;
}

const rowSource = {
    beginDrag(props) {
        return {
            index: props.index,
            type: ItemTypes.COMPONENT_TOOLBAR,
            id: props.index !== undefined && props.index !== null ? 'component-toolbar-' + props.index : undefined,
        };
    }
};



@DragSource(ItemTypes.COMPONENT_TOOLBAR, rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class ComponentToolbar extends Component {
    constructor(props) {
        super(props)

        this.state = {

            components: props.components,
            dragIndex: null
        }
    }


    render() {

        var state = this.state;
        var props = this.props;


        const { isDragging, connectDropTarget, connectDragSource, isOver, placeHolderIndex, placeInCenter, folded } = this.props;
        var iconClass = '';
        //如果当前结点为折叠状态
        if (folded == true)
            iconClass = 'right'
        else
            iconClass = 'down'

        var arr = [];



        var defaultStyle = {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
        }

        var itemStyle={
                display: 'flex',
                flex: '0 0 auto', 
                height: '26px', 
                flexDirection: 'row',
                justifyContent: 'flex-start',
        }
        //如果选中此结点
        var className='Component-Toolbar'
        if(props.selected)
        {
            className+=' clicked'
            itemStyle.backgroundColor='#555'
        }

        if (placeInCenter) {
            itemStyle.backgroundColor = '#374441'
            itemStyle.borderRadius = 3
        }

        

        return (

            connectDragSource(
                <div id={'component-toolbar-' + props.index} className={className} style={defaultStyle} >

                    {/*parent node*/}
                    <div style={itemStyle}
                        onClick={(event) => {
                            if (this.props.onClick)
                                this.props.onClick()
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                    >


                        {
                            props.children && props.children.length > 0 ?
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <span className={iconClass}></span>
                                </div> : null
                        }

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: 5, marginLeft: 5 }}>
                            <span className='icon-toolbar'></span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <span className='label'>
                                {
                                    this.props.label !== undefined && this.props.label !== null ?
                                        this.props.label : 'Toolbar'
                                }
                            </span>
                        </div>
                    </div>

                    <div style={{ paddingLeft: 25 }}>
                        {
                            folded == true ?
                                null : props.children
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

    },
    row: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
    },
    header: {
        height: '24px',
        fontSize: '11px',
        color: '#eee',
        border: '2px solid #222',
        borderBottom: '2px solid #222',
        borderTopRightRadius: '4px',
        borderTopLeftRadius: '4px'
    }
}

export default connect()(ComponentToolbar);
