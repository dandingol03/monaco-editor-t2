import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../../constants/ItemTypes';
import ComponentText from './ComponentText';

import { findDOMNode } from 'react-dom';
const OFFSET_HEIGHT=26;
const CARD_MARGIN=1;//apply to the textview marginLeft:2
const CARD_HEIGHT=26;


/**
 * 该组件以flex为主要标识
 */

function getPlaceholderIndex(y,offset) {
    // shift placeholder if y position more than card height / 2
    const yPos = y - offset-OFFSET_HEIGHT;
    let placeholderIndex;
    if (yPos < CARD_HEIGHT / 2) {
        placeholderIndex = -1; // place at the start
    } else {

        placeholderIndex = Math.floor((yPos - CARD_HEIGHT / 2) / (CARD_HEIGHT + CARD_MARGIN));
    }
    
    return placeholderIndex;
}

const dragSource = {
    beginDrag(props) {
        return {
            index: props.index,
            type:ItemTypes.COMPONENT_LINEAR,
            id:props.index!==undefined&&props.index!==null?'component-linear-'+props.index:undefined,
            name:props.name
        };
    },
    endDrag(props, monitor, component)
    {
        
    }
};



const rowTarget = {
    drop(props, monitor, component) {

        
        const { placeHolderIndex,dragIndex,dragId } = component.state;
        //TODO:与父元素交换数据
        const {components}=props;
        var _components=_.cloneDeep(components);
        
        var component=_components[dragIndex]
        debugger
        debugger
        if(_components&&dragIndex!==undefined&&dragIndex!==null)
        {
              _components.splice(dragIndex,1);
            if(placeHolderIndex==-1)
            {
                _components.splice(0,0,component);
            }else{
                _components.splice(placeHolderIndex,0,component);
            }
          
        }
        else{
            if(placeHolderIndex<=_components.length-1)
            {
                if(dragIndex==undefined||dragIndex==null)//新项
                {
                    _components.splice(placeHolderIndex+1,0,  {name:'new',type:ItemTypes.COMPONENT_TEXT})    
                }else{
                    _components.splice(placeHolderIndex,0,  {name:'new',type:ItemTypes.COMPONENT_TEXT})    
                }
            }else{
                _components.splice(_components.length,0,  {name:'new',type:ItemTypes.COMPONENT_TEXT})    
            }
        }
            
            debugger
        document.getElementById(dragId).style.display = 'flex';
        props.onChange(_components)

    },
    hover(props, monitor, component) {
        //当前悬停的元素
        const dragType = monitor.getItem().type;
        const hoverIndex = props.index;
        //拖拽的东西
        const dragIndex = monitor.getItem().index;
        
        //不考虑
        if(dragType!=ItemTypes.COMPONENT_TEXT)
        {
            if(dragIndex!=null)
            {
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
        }
        else{
            if(dragType==ItemTypes.COMPONENT_TEXT)//文本组件
            {
                
                
                  if(dragIndex!=null)
                  {
                    // if (dragIndex === hoverIndex) {
                    //     return;
                    // }
                  }
                
                  
                const hoverBoundingRect=findDOMNode(component).getBoundingClientRect();
                const placeHolderIndex = getPlaceholderIndex(
                    monitor.getClientOffset().y,hoverBoundingRect.top
                );
                component.setState( {placeHolderIndex:placeHolderIndex,dragIndex:dragIndex,
                    dragId: 'component-text-'+dragIndex});

                //TODO:judge where it is the inline element
                if(dragIndex!=null)
                {
                    const item = monitor.getItem();
                    document.getElementById(item.id).style.display = 'none';
                }else{

                }

            }
        }

    }
};




@DropTarget([ItemTypes.COMPONENT_TEXT], rowTarget, (connect,monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
}))
@DragSource(ItemTypes.COMPONENT_LINEAR, dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class ComponentLinear extends  Component{
    constructor(props) {
        super(props)

        this.state={
            index:props.index?props.index:null,
            scaffold:false,
            dragIndex:null
        }
    }

  
    render() {

        var state=this.state;
        var props=this.props;
        
        var {components,name,isDragging,isOver,connectDragSource,connectDropTarget}=this.props;
        var {placeHolderIndex}=this.state;
        var arr=[];
        let isPlaceHold=false;
         
        if(components&&components.length>0)
        {
            components.map((component,i)=>{
                if(isOver)
                {
                    isPlaceHold=false;
                    if (i === 0 && placeHolderIndex === -1) {
                       arr.push(<ComponentText key="placeholder" name='-holder-'/>);
                    } else if (placeHolderIndex > i) {
                       isPlaceHold = true;
                    }
                }

                if(component!=undefined)
                {
                    arr.push(<ComponentText key={i} index={i} name={i}/>)
                }
                  
                if (isOver  && placeHolderIndex === i) {
                    arr.push(<ComponentText key="placeholder"  name='-holder-'/>);
                }

                
            })
        }else{
             //此时并无数据但是仍然处于hover
              if (placeHolderIndex!==undefined&&isOver) {
                arr.push(<ComponentText  key="placeholder"  name='-holder-'/>);
            }
        }

        //TODO:i cann't figure out
        if (isPlaceHold&&isOver) {
            arr.push(<ComponentText  key="placeholder" tag="holder" name='-holder-'/>);
        }

        return (
            connectDragSource(connectDropTarget(
                     <div id={'component-linear-'+props.index} className={isDragging?('Component-Linear translucent'):'Component-Linear'} style={styles.container} >

                        
                        <div style={{display:'flex',flex:'0 0 auto',height:'26px',flexDirection:'row',
                            justifyContent:'flex-start',alignItems:'center'}}
                               onClick={()=>{
                                    this.setState({scaffold:!this.state.scaffold})
                                }}
                            >

                            {
                                props.components?
                                  <span className={state.scaffold==true?'right':'down'}></span>: <span className='icon'></span>
                            }
                            <span className='icon-linearlayout-row'></span>
                            <span className='label'>{name}</span>
                            <span className='label min'> (Linearlayout row)</span>
                        </div>

                        {
                            props.components?this.state.scaffold==false?
                             <div style={{paddingLeft:35}}>
                                {arr}
                             </div>:null
                            :null
                        }
                       
                    </div>
            ))
       
        )
    }
}

const styles={
    container:{
        display:'flex',
        flex:'0 0 auto',
        flexDirection:'column',
        marginTop:1
    },
    row:{
        display:'flex',
        flex:'0 0 auto',
        flexDirection:'row',
    },
    header:{
        height:'24px',
        fontSize:'11px',
        color:'#eee',
        border:'2px solid #222',
        borderBottom:'2px solid #222',
        borderTopRightRadius:'4px',
        borderTopLeftRadius:'4px'
    }
}

export default connect()(ComponentLinear);
