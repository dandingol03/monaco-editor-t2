import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'

class Android extends  Component{
    constructor(props) {
        super(props)

        this.state={
           scale:props.scale?props.scale:'100%'
        }
    }



    render() {

        var state=this.state;
        var props=this.props;
        return (
            <div className="Android" style={Object.assign(styles.container,{marginLeft:'10px'})}>
                <div style={Object.assign(styles.row,{height:'30px',backgroundColor:'#222',
                        borderTopLeftRadius:'8px',borderTopRightRadius:'8px',justifyContent:'flex-end'})}>
                    <div className="phone-wifi" style={{display:'flex',flexDirection:'row',
                        flex:'0 0 auto',width:'30px',justifyContent:'center',alignItems:'center'}}></div>

                    <div className="phone-battery" style={{display:'flex',flexDirection:'row',
                        flex:'0 0 auto',width:'30px',justifyContent:'center',alignItems:'center'}}></div>
                </div>

                <div style={Object.assign(styles.body,{backgroundColor:'#fff'})}>
                    <iframe src="http://localhost:3001/"   frameBorder="no"  style={{margin:0,border:0,display:'flex', flex:'1 1 auto'}}
                            scrolling="no" allowTransparency="yes"></iframe>
                </div>

                <div style={Object.assign(styles.row,{height:'30px',backgroundColor:'#222',
                        borderBottomLeftRadius:'8px',borderBottomRightRadius:'8px'})}>
                    <div className="triangle-left" style={Object.assign(styles.item,
                        {flex:'1 0 auto',justifyContent:'center',alignItems:'center'})}></div>
                    <div className="phone-home" style={Object.assign(styles.item,
                        {flex:'1 0 auto',justifyContent:'center',alignItems:'center'})}></div>
                    <div className="phone-square" style={Object.assign(styles.item,
                        {flex:'1 0 auto',justifyContent:'center',alignItems:'center'})}></div>
                </div>
            </div>

        )
    }
}

const styles={
    container:{
        display:'flex',
        flex:'0 0 auto',
        width:'320px',
        height:'560px',
        flexDirection:'column',
        justifyContent:'center'
    },
    row:{
        display:'flex',
        flex:'0 1 auto',
        flexDirection:'row',
        alignItems:'center'
    },
    body:{
        display:'flex',
        flex:'1 1 auto',
        flexDirection:'column',
    },
    item:{
        display:'flex',
        flexDirection:'row'
    }
}


export default connect()(Android);
