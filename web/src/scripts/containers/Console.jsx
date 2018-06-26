import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
const { ipcRenderer } = require('electron')
import { BarLoader } from 'react-spinners'


import {
    onGetNewLog
} from '../actions/consoleActions'

/**
 * 控制台
 */
class Console extends Component {



    render() {

        var className = 'Console'
        var { visible, logs, count } = this.props

        if (visible) { }
        else
            className += ' none'

        var arr = []
        if (logs && logs.length > 0) {
            logs.map((log, i) => {
                arr.push(
                    <div key={i} style={{display: 'flex', flex: '0 0 auto', color: '#bcd4bf', padding: 4,marginbottom:4, flexWrap: 'wrap' }}>
                        {log}
                    </div>
                )
            })
        }

        return (
            <div ref="container" className={className}
                style={{
                    display: 'flex', flexDirection: 'column', flex: '0 1 auto', height: 140, backgroundColor: '#222',
                    fontFamily: 'sans-serif', fontSize: 14, overflow: 'scroll', overflowX: 'scroll'
                }}>
                {arr}

            </div>)
    }

    componentWillMount() {
        ipcRenderer.on('console', (evt, message) => {
            this.props.dispatch(onGetNewLog(message))
        })
    }

    componentDidUpdate() {

        // if (this.refs.container)
        //     this.refs.container.scrollTop = this.refs.container.scrollHeight
    }

    componentDidMount() {

        // if (this.refs.container)
        //     this.refs.container.scrollTop = this.refs.container.scrollHeight
    }
}

const mapStateToProps = (state, ownProps) => {

    var props = {
        logs: state.consoleUtils.logs,
        visible: state.consoleUtils.visible,
        count: state.consoleUtils.count
    }

    return props
}

export default connect(mapStateToProps)(Console);