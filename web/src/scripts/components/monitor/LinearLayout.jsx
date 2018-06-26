import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import PaletteTextView from './PaletteTextView';
import _ from 'lodash';

/**
 * 因为LinearLayout的体内元素具有一致性,所以将textview之间的碰撞性集中到LinearLayout
 * @type {{beginDrag: ((props))}}
 */

const OFFSET_WIDTH=8;
const CARD_MARGIN=2;//apply to the textview marginLeft:2
const CARD_WIDTH=100;

function getPlaceholderIndex(x,offset) {
    // shift placeholder if y position more than card height / 2
    const xPos = x - offset-OFFSET_WIDTH;
    let placeholderIndex;
    if (xPos < CARD_WIDTH / 2) {
        placeholderIndex = -1; // place at the start
    } else {

        placeholderIndex = Math.floor((xPos - CARD_WIDTH / 2) / (CARD_WIDTH + CARD_MARGIN));
    }
    return placeholderIndex;
}



const rowSource = {
    beginDrag(props) {
        return {
            index: props.index
        };
    }
};

const rowTarget = {
    drop(props, monitor, component) {

        const { placeHolderIndex } = component.state;
        //TODO:与父元素交换数据
        var views=_.cloneDeep(props.views);
        debugger
        if(views)
            views.splice(placeHolderIndex+1,0,{tag:placeHolderIndex+1});
        else
            views=[{tag:0}];
        props.onChange(views);

    },
    hover(props, monitor, component) {
        //当前悬停的元素
        const dargType = monitor.getItem().type;
        const hoverIndex = props.index;
        //拖拽的东西
        const dragIndex = monitor.getItem().index;

        if(dargType!=ItemTypes.PALETTE_TEXT_VIEW)
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
            if(dargType==ItemTypes.PALETTE_TEXT_VIEW)//文本
            {


                const hoverBoundingRect=findDOMNode(component).getBoundingClientRect();
                const placeHolderIndex = getPlaceholderIndex(
                    monitor.getClientOffset().x,hoverBoundingRect.left
                );
                component.setState( {placeHolderIndex:placeHolderIndex});

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



@DropTarget([ItemTypes.ROW,ItemTypes.PALETTE_TEXT_VIEW], rowTarget, (connect,monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
}))
@DragSource(ItemTypes.LINEAR_LAYOUT, rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class LinearLayout extends  Component{

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
            views:props.views?props.views:null,
            placeHolderIndex:undefined
        }
    }

    componentWillReceiveProps(nextProps)
    {
        if(this.props.views!=nextProps.views)
        {
            debugger
            this.setState({views:nextProps.views});
        }
    }

    render() {

        const {isDragging,connectDropTarget,connectDragSource,isOver,placeHolderIndex}=this.props;
        var {views}=this.state;
        const opacity = isDragging ? 0.5 : 1;

        var state=this.state;
        var props=this.props;


        var arr=[];
        let isPlaceHold = false;
        if(views&&views.length>0)
        {
            views.map( (item,i)=> {
               if(isOver)
               {
                   isPlaceHold = false;
                   //占位首个
                   if (i === 0 && placeHolderIndex === -1) {
                       arr.push(<PaletteTextView key="placeholder" tag="placeholder" width={CARD_WIDTH} />);
                   } else if (placeHolderIndex > i) {
                       isPlaceHold = true;
                   }
               }

                if(item!=undefined)
                {
                    //设置index
                    arr.push(<PaletteTextView className="palette text-view" tag={item.tag} index={i} key={i} width={CARD_WIDTH}/>)
                }


                if (isOver  && placeHolderIndex === i) {
                    arr.push(<PaletteTextView key="placeholder" tag="placeholder"  width={CARD_WIDTH}/>);
                }
            });

        }else{
            //如果现在并无数据
            if (placeHolderIndex!==undefined&&isOver) {
                arr.push(<PaletteTextView className="translucent text-view" key="placeholder" tag="holder"  width={CARD_WIDTH}/>);
            }
        }

        if (isPlaceHold&&isOver) {
            arr.push(<PaletteTextView className="translucent text-view" key="placeholder" tag="holder"  width={CARD_WIDTH}/>);
        }


        return (


            connectDragSource(connectDropTarget(
                <div className={isDragging?'layout row translucent':'layout row'}
                     style={Object.assign(styles.row,{justifyContent:'center',border:'1px dashed #fff',position:'relative'}) }>
                    <div style={{position:'absolute',left:'3px',top:'6px',backgroundColor:'#ff4528',
                        color:'#fff',transform:'rotate(-20deg)',borderRadius:4,padding:2}}>
                        {props.tag}
                    </div>

                    <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',alignItems:'center'}}>
                        {arr}
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



export default connect()(LinearLayout);
