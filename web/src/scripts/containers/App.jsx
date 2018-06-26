
import React, { Component, } from 'react'
import { connect } from 'react-redux'

//import Modal from '../components/modal/Modal.jsx'


class App extends Component {

    render() {

        return (

            <div style={styles.container}>
                {this.props.children}
            </div>

        )
    }
    
}

var styles={
    container:{
        width:'100%',
        height:'100%'
    }
}


export default connect()(App)
