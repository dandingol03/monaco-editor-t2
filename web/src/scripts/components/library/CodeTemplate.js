import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'

const dragSource = {
    beginDrag(props) {
        return {
            type: ItemTypes.CODE_TEMPLATE,
            template: props.component.template
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
class CodeTemplate extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }


    render() {

        var state = this.state;
        var props = this.props;

        var { component, isDragging, connectDragSource } = this.props;

        var className = 'Code-template'

        //TODO:
        if (isDragging) {
            className += ' translucent'
        } else if (this.state.hover == true) {
            className += ' hover'
        } else { }


        return (
            connectDragSource(
                <div className={className}
                    style={styles.container}
                    onMouseEnter={() => {
                        this.setState({ hover: true })
                    }}

                    onMouseLeave={() => {
                        this.setState({ hover: false })
                    }}
                >



                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: '0 0 auto', fontSize: '12px', marginTop: 5 }}>


                        <div className={'Input'} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: '0 0 auto' }}
                        >
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome name='i-cursor' size={12} color="#333" style={{ paddingLeft: 5 }} />
                                <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}></div>
                                <FontAwesome name='times-circle' size={15} color="#cc4d6e" style={{ paddingLeft: 5 }} />
                            </div>
                        </div>
                    </div>

                    <div className='name' style={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                        flex: '0 0 auto',
                    }}>
                        {component.name}
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
        flexDirection: 'column',
        padding: 6,
        paddingRight: 4,
        paddingLeft: 10,
        marginBottom: '1.5px'
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

export default connect()(CodeTemplate);
