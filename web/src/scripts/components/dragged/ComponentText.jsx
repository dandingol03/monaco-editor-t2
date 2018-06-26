import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'

const dragSource = {
    beginDrag(props) {
        return {
            index: props.index,
            haff: props.haff,
            type: ItemTypes.COMPONENT_TEXT,
            id: props.index !== undefined && props.index !== null ? 'component-text-' + props.index : undefined,
            name: props.name
        };
    },
    endDrag(props, monitor, component) {

    }
};

@DragSource(ItemTypes.COMPONENT_TEXT, dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class ComponentText extends Component {
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

        var { name, isDragging, connectDragSource, switched } = this.props;

        var className = 'Component-text'
        if (isDragging)
            className += ' translucent'
        if (props.selected) {
            itemStyle.backgroundColor = '#555'
            className += ' clicked'
        }

        if (switched) {
            itemStyle.backgroundColor = 'rgb(98, 109, 106)'
            className += ' clicked'
        }

        return (
            connectDragSource(
                <div id={'component-text-' + props.index} className={className} style={styles.container} >

                    {/*parent node*/}
                    <div style={itemStyle}
                        onClick={(event) => {
                            if (this.props.onClick)
                                this.props.onClick(event)
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                    >

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: 5, marginLeft: 5 }}>
                            <span className='icon-text'></span>
                        </div>

                        <span className='label'>{name}</span>
                        <span className='label min'> Text </span>
                        {
                            switched ?
                                <div style={{ paddingRight: 10 }}>
                                    <div className='rotating'>
                                        <FontAwesome name={'spinner'} size={14} color={'#fff'} />
                                    </div>
                                </div>
                                : null
                        }


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

export default connect()(ComponentText);
