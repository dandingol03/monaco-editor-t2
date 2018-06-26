import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../../constants/ItemTypes';


const dragSource = {
    beginDrag(props) {
        return {
            index: props.index,
            type: ItemTypes.COMPONENT_ICON,
            id: props.index !== undefined && props.index !== null ? 'component-icon-' + props.index : undefined,
            name: props.name
        };
    },
    endDrag(props, monitor, component) {

    }
};

@DragSource(ItemTypes.COMPONENT_ICON, dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class ComponentIcon extends Component {
    constructor(props) {
        super(props)

        this.state = {
            index: props.index ? props.index : null
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps)
    }

    render() {

        var state = this.state;
        var props = this.props;
        var itemStyle = {
            display: 'flex',
            flex: '0 0 auto',
            height: '26px',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        }

        var { name, isDragging, connectDragSource } = this.props;

        var className = 'Component-icon'
        if (isDragging)
            className += ' translucent'
        if (props.selected) {
            itemStyle.backgroundColor = '#555'
            className += ' clicked'
        }

        return (
            connectDragSource(
                <div id={'component-icon-' + props.index}
                    className={className}
                    style={styles.container} >

                    {/*parent node*/}
                    <div style={itemStyle}
                        onClick={(event) => {
                            if (this.props.onClick)
                                this.props.onClick()
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                    >

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: 5, marginLeft: 5 }}>
                            <span className='icon-fontawesome'></span>
                        </div>

                        <span className='label'>Icon</span>

                    </div>
                </div>
            )

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

export default connect()(ComponentIcon);
