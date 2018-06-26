import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';

import ItemTypes from '../../constants/ItemTypes';

class ComponentPositionSeperator extends Component {
    constructor(props) {
        super(props)

        this.state = {
            index: props.index ? props.index : null
        }
    }



    render() {

        var state = this.state;
        var props = this.props;

        var { positionInCenter,top } = this.props
        var className = 'Component-Seperator'


        var defaultStyle = {
            display: 'flex',
            flex: '0 0 auto',
            height: 2,
            flexDirection: 'row',
            marginTop: 0,
            position: 'absolute',
            left:0,
            zIndex:1000,
            width:'100%'
        }

        if (positionInCenter == true) {
            className += ' translucent'
            defaultStyle.height = 0
        }

        if(top)
            defaultStyle.top=top

        

        return (

            <div className={className} style={defaultStyle} >
                {
                    positionInCenter == true ?
                        <span className='center'></span> :
                        <span className='right'></span>
                }
            </div>


        )
    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '1 0 auto',
        height: 2,
        flexDirection: 'row',
        marginTop: 1,
        position: 'absolute'
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

export default connect()(ComponentPositionSeperator);
