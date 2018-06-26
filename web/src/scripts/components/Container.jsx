import React, { Component, } from 'react'

class Container extends  Component
{
    render() {

        return (

            <div style={styles.container}>
                {this.props.children}
            </div>

        )
    }
}

const styles={
    container:{
        flex:1,
        display:'flex'
    }
}

export default Container;
