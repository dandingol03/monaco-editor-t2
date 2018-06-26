import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import PanelTextView from './PaletteTextView';


class PropertySpecials extends  Component{
    constructor(props) {
        super(props)

        this.state={
            components:props.components?props.components:null,
            special:props.special?props.special:null
        }
    }



    render() {

        var props=this.props;

        var arr=[];
        props.components.map((component,i)=>{
            arr.push(
                <div style={styles.comp} key={i}>
                    <div style={styles.icon} className={`icon-${component.icon}`}>
                    </div>

                    {
                        component.label=='TextView'?
                            <PanelTextView tag={component.label}/>:
                            <div style={Object.assign(styles.item,{flex:'1 1 auto',marginLeft:'2px',alignItems:'center'})}>
                                {component.label}
                            </div>
                    }
                </div>)
        });



        return (
            <div className="palette-row" style={Object.assign(styles.container)}>
                <div style={Object.assign({  display:'flex', flex:'0 0 auto', flexDirection:'row',alignItems:'center'},{height:'25px'})}>
                    <div style={Object.assign({  display:'flex', flexDirection:'row'},{flex:'0 0 auto'})} className="special">
                    </div>

                    <div style={Object.assign(styles.item,{flex:'1 1 auto',marginLeft:'2px'})}>
                        {props.special}
                    </div>
                </div>

                {/*id*/}
                <div style={Object.assign(styles.row,{height:'35px'})}>
                    <div style={{display:'flex', flexDirection:'row',flex:'2 1 0%'}}>
                        ID
                    </div>
                    <div style={{display:'flex', flexDirection:'row',flex:'3 1 0%'}}>
                        dwxxx
                    </div>
                </div>



            </div>

        )
    }
}

const styles={
    container:{
        display:'flex',
        flex:'1 1 auto',
        flexDirection:'column',
        color:'#fff',
        fontSize:'11px',
        padding:'2px',
        paddingLeft:'6px',
    },
    row:{
        display:'flex',
        flex:'0 0 auto',
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
    },
    comp:{
        display:'flex',
        flex:'0 0 auto',
        flexDirection:'row',
        height:'20px',
        marginLeft:'5px'
    },
    icon:{
        display:'flex',
        flexDirection:'row',
        flex:'0 0 auto',
        alignItems:'center'

    }
}


export default connect()(PropertySpecials);
