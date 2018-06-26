import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'

const dragSource = {
    beginDrag(props) {
        return {
            type: ItemTypes.ACTIONSHEET,
            template: props.component.template,
            npmName:props.component.npmName
        };
    },
    endDrag(props, monitor, component) {

    }
};

@DragSource(ItemTypes.CODE_TEMPLATE, dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
}))
class ActionSheet extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }


    render() {




        var state = this.state;
        var props = this.props;

        var { component, isDragging, connectDragSource } = this.props;

        var className = 'Code-template ActionSheet'

        //TODO:
        if (isDragging) {
            className += ' translucent'
        } else if (this.state.hover == true) {
            className += ' hover'
            className += ' animated  bounceIn'
        } else { }


        return (
            connectDragSource(
                <div className={className}
                    style={styles.container}
                >

                    <div style={{ flexDirection: 'column', display: 'flex',flex:'1 1 auto' }}>
                        <div style={{ flexDirection: 'row', display: 'flex' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: 5, marginLeft: 5 }}>
                                <span className='icon-action-sheet'></span>
                            </div>

                            <div className='name' style={{
                                display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                                flex: '0 0 auto',
                            }}>
                                {component.name}  <span>&nbsp;- </span>
                            </div>
                        </div>

                        <div style={{ flexDirection: 'row',display:'flex',marginLeft:'5px',fontSize:11,color:'#aaa' }}>
                            {component.description}
                        </div>

                    </div>
                </div>
            )

        )
    }

    componentDidMount() {
        const img = new Image()
        img.src = `./images/component-drag-layer.png`
        img.onload = () => this.props.connectDragPreview(img)
    }
}



const styles = {
    container: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        marginBottom: '1.5px',
        justifyContent: 'center',
        border:'1px dashed #888',
        paddingBottom:'8px',
        background:'#222'
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

export default connect()(ActionSheet);
