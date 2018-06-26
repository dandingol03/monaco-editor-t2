import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'

import{
    selectFunction
} from '../actions/functionsActions'

/**
 * 检查是否为脏文件，是的话马上重新计算decoration
 */


class Functions extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }

    render() {

        var state = this.state;
        var props = this.props;
        var { func } = props



        return (
            <div className="Functions" style={styles.container}>

                <div className={func == 'project' ? 'grid selected' : 'grid'} style={{
                    display: 'flex', flexDirection: 'row', flex: '0 0 auto', height: 55,
                    alignItems: 'center', justifyContent: 'center'
                }}
                    onClick={(event) => {
                        if(func=='project')
                            return 
                        this.props.dispatch(selectFunction('project'))
                        event = event || window.event;
                        event.preventDefault();
                        event.stopPropagation()
                    }}
                >
                    {
                        func == 'project' ?
                            <div className='icon-project'></div> :
                            <div className='icon-gray-project'></div>
                    }

                </div>

                  <div className={func == 'plugin' ? 'grid selected' : 'grid'} style={{
                    display: 'flex', flexDirection: 'row', flex: '0 0 auto', height: 55,
                    alignItems: 'center', justifyContent: 'center'
                }}
                    onClick={(event) => {
                        if(func=='plugin')
                            return 
                        this.props.dispatch(selectFunction('plugin'))
                        event = event || window.event;
                        event.preventDefault();
                        event.stopPropagation()
                    }}
                >
                    {
                        func=='plugin'?
                        <div className='icon-plugin'></div>:
                        <div className='icon-gray-plugin'></div>
                    }
                    
                </div>

                <div className={func == 'search' ? 'grid selected' : 'grid'} style={{
                    display: 'flex', flexDirection: 'row', flex: '0 0 auto', height: 55,
                    alignItems: 'center', justifyContent: 'center'
                }}
                    onClick={(event) => {
                        if(func=='search')
                            return 
                        this.props.dispatch(selectFunction('search'))
                        event = event || window.event;
                        event.preventDefault();
                        event.stopPropagation()
                    }}
                >
                    {
                        func=='search'?
                        <div className='icon-search'></div>:
                        <div className='icon-gray-search'></div>
                    }
                    
                </div>

            


            </div>

        )
    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        background:'#555'
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
        func: state.functions.function
    }

    return props
}



export default connect(mapStateToProps)(Functions);
