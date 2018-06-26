import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';


const dragSource = {
    beginDrag(props) {
        return {
            index: props.index,
            type:ItemTypes.PALETTE_TEXT_VIEW,
            id:props.index!==undefined&&props.index!==null?'palette-'+props.index:undefined
        };
    }
};



@DragSource(ItemTypes.PALETTE_TEXT_VIEW, dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class PaletteTextView extends  Component{

    // static propTypes = {
    //     connectDragSource: PropTypes.func.isRequired,
    //     isDragging: PropTypes.bool.isRequired,
    // };


    constructor(props) {
        super(props)

        this.state={
            tag:props.tag?props.tag:null,
            index:props.index?props.index:null,
            clicked:undefined
        }
    }



    render() {

        const {isDragging,connectDragSource,width}=this.props;
        var {clicked}=this.state;
        const opacity = isDragging ? 0.5 : 1;

        var state=this.state;
        var props=this.props;

        //限制宽度,一般位于palette
        if(width!=undefined&&width!=null)
        {
            var className='';
            if(isDragging)
            {
                className='translucent';
            }else{
                if(props.className)
                    className=props.className;
                if(clicked)
                    className+=' clicked';
            }



            return (
                connectDragSource(
                    <div id={'palette-'+props.index} className={className}
                         style={Object.assign({   display:'flex', flex:'0 1 auto',width:width+'px',
                                marginLeft:'2px',alignItems:'center',justifyContent:'center'}) }
                         onClick={(event)=>{
                             this.setState({clicked:true});
                             event=event||window.event;
                             event.preventDefault();
                         }}
                    >
                        {props.tag}
                    </div>)

            )
        }else{
            return (
                connectDragSource(
                    <div className={isDragging?'translucent':props.className?props.className:''}
                         style={Object.assign({   display:'flex', flex:'0 1 auto',marginLeft:'2px',alignItems:'center'}) }>
                        {props.tag}
                    </div>)

            )
        }

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


export default connect()(PaletteTextView);
