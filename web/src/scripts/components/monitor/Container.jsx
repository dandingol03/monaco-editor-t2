import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';


const rowSource = {
    beginDrag(props) {
        return {
            index: props.index
        };
    }
};

const rowTarget = {
    hover(props, monitor, component) {
        //拖拽的东西
        const dragIndex = monitor.getItem().index;
        //当前悬停的元素
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
            return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return;
        }

        // Time to actually perform the action
        props.onSwitch(dragIndex, hoverIndex);




        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    }
};


/**
 * Container 作为根容器,所具有的落点计算
 */


@DragSource(ItemTypes.CONTAINER, rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class Container extends  Component{

    static propTypes = {
        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
    };


    constructor(props) {
        super(props)

        this.state={
            tag:props.tag?props.tag:null,
            index:props.index?props.index:null,
        }
    }



    render() {

        const {isDragging,connectDragSource,styleMap}=this.props;
        const opacity = isDragging ? 0.5 : 1;

        var state=this.state;
        var props=this.props;

        var direction=props.direction

        var style={
            backgroundColor:'#fff'
        };
        if(this.props.styleMap)
        {
            if(styleMap.flex)
                style.flex=styleMap.flex+' 1 auto'
            if(styleMap.justifyContent&&styleMap.justifyContent!='')
                style.justifyContent=styleMap.justifyContent
            if(styleMap.alignItems&&styleMap.alignItems!='')
                style.alignItems=styleMap.alignItems

                   
        }

        return (

            

            connectDragSource(
            <div className={isDragging?('translucent Container '+direction):('Container '+direction)} 
                style={style}
            >
                {props.children}
            </div>)

        )
    }
}

const styles={
  
}


export default connect()(Container);
