import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
var Spinner = require('react-spinkit')

import{
    setGitStatusBusy,
    setGitStatusIdle
} from '../actions/gitActions';

class GitLoader extends Component {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }



    render() {

        var state = this.state;
        var props = this.props;

        var className = 'content'
        if (this.props.busy == true)
            className += ' visible'
        

        return (

            <div className='Git-loader'
                style={{ display: 'flex', flex: '0 0 auto', height: 25, position: 'relative' }}>

                <div className={className}   style={{ display: 'flex', flex: '1 1 auto', height: 25, justifyContent: 'center',
                         background: '#444', position: 'absolute',left:0,width:230}}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        <span style={{ color: '#fff', fontFamily: 'sans-serif', fontSize: 11 }}>git is pushing to remote..</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Spinner className="aqua" spinnerName="rotating-plane" />
                    </div>
                </div>

            </div>
        )
    }

}

const styles = {
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'row',
        alignItems: 'center'
    },
    row: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'row',
        alignItems: 'center'
    }
}

const mapStateToProps = (state, ownProps) => {

    const props = {
        busy: state.git.busy,
    }

    return props
}


export default connect(mapStateToProps)(GitLoader);


