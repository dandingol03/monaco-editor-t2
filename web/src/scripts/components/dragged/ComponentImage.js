import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import _ from 'lodash';
import ComponentLinear from './ComponentLinear';
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
            type: ItemTypes.COMPONENT_IMAGE,
            haff: props.haff,
            id: props.index !== undefined && props.index !== null ? 'component-view-' + props.index : undefined,
        };
    }
};



@DragSource(ItemTypes.COMPONENT_IMAGE, rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class ComponentImage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            scaffold: false,
            components: props.components,
            dragIndex: null
        }
    }


    render() {

        var state = this.state;
        var props = this.props;

        var { scaffold } = this.state;
        const { isDragging, connectDropTarget, connectDragSource, isOver, placeInCenter, placeHolderIndex,
            folded, triangle, selected } = this.props;
        var iconClass = '';
        //如果当前结点为折叠状态
        if (triangle == 'right')
            iconClass = 'right'
        else if (triangle == 'down')
            iconClass = 'down'
        else {

        }

        var arr = [];

        var defaultStyle = {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
        }


        var itemStyle = {
            cursor: 'pointer',
            display: 'flex',
            flex: '0 0 auto',
            height: 26,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingLeft: '3px'
        }

        var className='Component-Image'
        if (props.selected == true) {
            itemStyle.backgroundColor = '#555'
            className+=' clicked'
        }

        if (placeInCenter) {
            itemStyle.backgroundColor = '#374441'
            itemStyle.borderRadius = 3
        }


        return (

            connectDragSource(
                <div id={'component-image-' + props.index} className={className} style={defaultStyle}
                    onClick={(event) => {
                        //todo:select this component node
                        if (this.props.onSelect)
                            this.props.onSelect()
                        event.preventDefault()
                        event.stopPropagation()
                    }}>

                    {/*parent node*/}
                    <div style={itemStyle}>

                        {
                            triangle != null ?
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                                    onClick={(event) => {
                                        if (this.props.onClick)
                                            this.props.onClick()
                                        event.preventDefault()
                                        event.stopPropagation()
                                    }}
                                >
                                    <span className={iconClass}></span>
                                </div> : null
                        }

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: 5, marginLeft: 5 }}>
                            <span className='icon-image'></span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <span className={selected == true ? 'label selected' : 'label'}>
                                {
                                    this.props.label !== undefined && this.props.label !== null ?
                                        this.props.label : 'Image'
                                }
                            </span>
                        </div>
                    </div>

                    <div style={{ paddingLeft: 25 }}>
                        {props.children}
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

export default connect()(ComponentImage);
