import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'

import {
    onModalInit,
    onModalDestroy
} from '../../actions/modalActions'

/**
 * 考虑到模态框弹出并没有实际内容，不针对ui做具体的web适配
 */
class ModalInflater extends Component {


    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render() {

        var state = this.state;
        var props = this.props;
        //以json格式存放style属性
        var {  haff, pickerVisible, attributes, clicked } = this.props;
        var { title, options, ref } = attributes
        //do filering

        if (props.clicked == true)
            className += ' clicked'

        var className = 'Modal'


        return (
            <div className={className}
                style={{ display: 'none'}}>
                
            </div>
        )

    }

    componentDidMount() {
        //将该组件实例在actionSheetReducer中进行登记
        if (this.props.haff) {
            var { attributes } = this.props
            var { ref } = attributes
            this.props.dispatch(onModalInit(ref, this.props.haff))
        }
    }

    componentDidUpdate(prevProps, nextProps) {
        if (this.props.haff) {
            var { attributes } = this.props
            var { ref } = attributes
            this.props.dispatch(onModalInit(ref, this.props.haff))
        }
    }

    componentWillUnmount() {

        //取消登记
        if (this.props.haff) {
            var { attributes } = this.props
            var { ref } = attributes
            this.props.dispatch(onModalDestroy(ref, this.props.haff))
        }

    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '0 0 auto',
        width: '320px',
        height: '560px',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    row: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        alignItems: 'center'
    },
    body: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
    },
    item: {
        display: 'flex',
        flexDirection: 'row'
    }
}

export default connect()(ModalInflater);

