import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import Properties from './Properties';
import {
    PANEL_PROPERTIES,
    PANEL_COMPONENT_TREE
}from '../../constants/paletteConstants'
import {
    switchPanel
} from '../../actions/paletteActions';
import ItemTypes from '../../constants/ItemTypes';
import ComponentContainer from '../dragged/ComponentContainer';
import MonacoMiddleware from '../../middleware/monaco/MonacoMiddleware';


//  components:[

//                 {name:'linear1',type:ItemTypes.LINEAR,children:[
//                     {name:'text1',type:ItemTypes.TEXT},
//                     {name:'text2',type:ItemTypes.TEXT},
//                     {name:'text3',type:ItemTypes.TEXT},
//                 ]},
//                 {name:'linear2',type:ItemTypes.LINEAR},
//                 {name:'linear3',type:ItemTypes.LINEAR},
//                 {name:'linear4',type:ItemTypes.LINEAR}
//             ]

//  <ComponentView 
//                             onChange={(_components)=>{
//                                 this.setState({components:_components})
//                             }} 
//                             components={this.state.components}/> 

class Panel extends  Component{


    constructor(props) {
        super(props)

        this.state={

           components:[

                {name:'linear1',type:ItemTypes.LINEAR,children:[
                    {name:'text1',type:ItemTypes.TEXT},
                    {name:'text2',type:ItemTypes.TEXT},
                    {name:'text3',type:ItemTypes.TEXT},
                ]},
                {name:'linear2',type:ItemTypes.LINEAR},
                {name:'linear3',type:ItemTypes.LINEAR},
                {name:'linear4',type:ItemTypes.LINEAR}
            ]
        }
    }

  


    render() {

        var state=this.state;
        var props=this.props;
        


        return (
            <div className="Panel" style={Object.assign(styles.container,{marginLeft:'40px'})} >
                <div style={Object.assign(styles.row,styles.header)}>
                    <div  style={{display:'flex',flex:'1 1 auto',flexDirection:'row',justifyContent:'center',
                            borderRight:'2px solid #222',alignItems:'center',borderTopLeftRadius:'4px'}}
                            className={props.detail==PANEL_PROPERTIES?('header clicked'):'header'}
                            onClick={()=>{
                                if(this.props.detail!=PANEL_PROPERTIES)
                                    this.props.dispatch(switchPanel(PANEL_PROPERTIES))
                            }}
                            >
                            <div style={{display:'flex',width:'100px',flex:'0 0 auto',flexDirection:'row',justifyContent:'center'}}>properties</div>
                        
                    </div>
                      <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',justifyContent:'center',
                            alignItems:'center',borderTopRightRadius:'4px'}}
                              className={props.detail==PANEL_COMPONENT_TREE?('header clicked'):'header'}
                              onClick={()=>{
                                    if(this.props.detail!=PANEL_COMPONENT_TREE)
                                        this.props.dispatch(switchPanel(PANEL_COMPONENT_TREE))
                              }}
                            >
                            <div style={{display:'flex',width:'100px',flex:'0 0 auto',flexDirection:'row',justifyContent:'center'}}>component tree</div>
                        
                    </div>
                </div>

                {
                    this.props.detail==PANEL_PROPERTIES?
                    <Properties   
                        editor={this.props.editor}
                        middleware={{ monaco: MonacoMiddleware(this.props.dispatch, this.props.editor) }}
                    />:
                    <ComponentContainer
                        
                        middleware={{ monaco: MonacoMiddleware(this.props.dispatch, this.props.editor) }}
                    />
                    
                   
                }
                


            </div>

        )
    }
}



const styles={
    container:{
        display:'flex',
        flex:'0 0 auto',
        width:'320px',
        marginTop:'1px',
        flexDirection:'column',
        
    },
    row:{
        display:'flex',
        flex:'0 0 auto',
        flexDirection:'row',
    },
    header:{
        height:'24px',
        fontSize:'11px',
        color:'#eee',
        border:'2px solid #222',
        borderBottom:'2px solid #222',
        borderTopRightRadius:'4px',
        borderTopLeftRadius:'4px'
    }
}


const mapStateToProps = (state, ownProps) => {

    var detail=state.palette.detail;
    const props = {
        detail:detail==PANEL_COMPONENT_TREE?PANEL_COMPONENT_TREE:PANEL_PROPERTIES
    }

    
    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.docId=docId
            props.components=doc.components            
        }
        props.editor=state.monaco._IStandaloneCodeEditor
    }
    

    return props
}

export default connect(mapStateToProps)(Panel);
