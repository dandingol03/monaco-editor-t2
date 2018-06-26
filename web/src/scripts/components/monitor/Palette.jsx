import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import TextView from './TextView';
import PaletteSpecials from './PaletteSpecials';



class Palette extends  Component{
    constructor(props) {
        super(props)

        this.state={
            data:[
              {special:'Widgets',components:[
                  {label:'TextView',icon:'textview'},
                  {label:'Toolbar',icon:'textview'},
                  {label:'View',icon:'view'},
                  {label:'TouchableOpacity',icon:'touchableOpacity'},
                  {label:'TextInputWrapper',icon:'text-input-wrapper'},
                  {label:'ListView',icon:'listview'},
                  {label:'ScrollView',icon:'scrollview'},
                  {label:'Icon',icon:'icon'},
                  {label:'ActionSheet',icon:'actionSheet'},
                  {label:'Animated.View',icon:'animatedview'}
                  ]},
              {special:'Layouts',components:[
                  {label:'Linear',icon:'linearlayout-row'}
              ]}
            ]
        }
    }



    render() {

        var state=this.state;
        var props=this.props;

        var arr=[];
        state.data.map((group,i)=>{
            arr.push(<PaletteSpecials key={i} special={group.special} components={group.components}/>)
        })


        return (
            <div className="palette" style={Object.assign(styles.container,{marginLeft:'1px'})}>
                <div style={{display:'flex',flex:'0 1 auto',flexDirection:'row',alignItems:'center',justifyContent:'center',
                    height:16,fontSize:11,color:'#eee',padding:4,background:'#666',border:2,borderStyle:'solid',borderColor:'#333',
                    borderTopLeftRadius:4,borderTopRightRadius:4,borderBottom:0}}>
                    Palette
                </div>

                <div style={{display:'flex',flex:'1 1 auto',flexDirection:'column',borderWidth:2,borderStyle:'solid',borderColor:'#222',borderBottomWidth:0}}>
                    {arr}
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
        fontFamily:'sans-serif'
    },
    row:{
        display:'flex',
        flex:'0 0 auto',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
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
    header:{
        height:'16px',
        fontSize:'11px',
        color:'#eee',
        borderBottom:0,
        padding:'4px',
        background:'#4c8aca'
    }
}


export default connect()(Palette);
