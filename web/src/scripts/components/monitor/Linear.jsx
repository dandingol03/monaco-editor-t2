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



@DropTarget([ItemTypes.LINEAR], rowTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
@DragSource(ItemTypes.LINEAR, rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class Linear extends  Component{

    static propTypes = {
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
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

        const {isDragging,connectDropTarget,connectDragSource}=this.props;
        const opacity = isDragging ? 0.5 : 1;

        var state=this.state;
        var props=this.props;
        var className='row';
        var style={};
        var styleMap=props.styleMap;
        if(styleMap.flex)
            style.flex=styleMap.flex+' 1 auto'
        if(styleMap.flexDirection)
            className=styleMap.flexDirection
        if(state.clicked==true)
            className+=' clicked'
        if(styleMap.width&&styleMap.height)
        {
            style.width=styleMap.width;
            if(styleMap.height.indexOf('px')!=-1)
                style.height=styleMap.height;
            else
                style.height=styleMap.height+'px'
            
            style.flex='0 0 auto'
        }else if(styleMap.width)
        {
            style.width=styleMap.width;
            style.flex='0 0 auto'
            
        }else if(styleMap.height)
        {

            if(styleMap.height.indexOf('px')!=-1)
                style.height=styleMap.height;
            else
                style.height=styleMap.height+'px'
            style.flex='0 0 auto'
        }else{
            //不限制宽度也不限制高度的view
          
        }


        return (


            connectDragSource(connectDropTarget(
            <div className={isDragging?('translucent Linear'+className):('Linear '+className)} 
                style={style}>
                  <div className='tag'>
                    linear {props.name}
                  </div>


            </div>))

        )
    }
}

const styles={
    container:{
        display:'flex',
        flex:'0 0 auto',
        width:'320px',
        height:'560px',
        flexDirection:'column',
        justifyContent:'center'
    },
    row:{
        display:'flex',
        flex:'0 0 auto',
        flexDirection:'row',
        alignItems:'center'
    },
    body:{
        display:'flex',
        flex:'1 1 auto',
        flexDirection:'column',
    },
    item:{
        display:'flex',
        flexDirection:'row'
    }
}


export default connect()(Linear);
