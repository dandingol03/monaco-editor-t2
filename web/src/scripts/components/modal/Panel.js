import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'

class Panel extends Component {

    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {

        var className = 'panel'
        if (this.props.clicked == true)
            className += ' clicked'

        return (
            <div className={className}
                onClick={(event) => {
                    if(this.props.onPress)
                        this.props.onPress()
                    event.preventDefault()
                    event.stopPropagation()
                }}
                style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                }}>
                <span style={{ color: '#aaa', fontSize: 14 }}>{this.props.name}</span>
            </div>
        )
    }
}

export default Panel