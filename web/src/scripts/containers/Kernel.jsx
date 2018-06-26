import React, { Component, } from 'react'
import CodeEditorDropTarget from '../components/CodeEditorDropTarget';
import DesignSwitch from '../components/switch/DesignSwitch';
import Palette from '../components/monitor/Palette';
import LayoutInflater from '../components/monitor/LayoutInflater';
import Grid from './Grid';
import Properties from '../components/monitor/Properties';
import DragAndDropMiddleware from '../middleware/editor/DragAndDropMiddleware';



class Kernel extends Component{

     constructor(props) {
        super(props)

        this.state={
            design:props.design
        }
    }


    


    render(){

        var props=this.props;

        return (
             <div style={{flex:7,display:'flex',flexDirection:'column'}}>
                        {
                            props.design == true ?
                                <Grid>
                                    <Palette/>
                                    <LayoutInflater/>
                                    <Properties/>
                                    {/*<Android/>*/}
                                </Grid> :
                                <CodeEditorDropTarget
                                    ref='editor'
                                    middleware={[
                                        DragAndDropMiddleware(this.props.dispatch),
                                    ]}
                                    onImportItem={this.props.onImportItem}
                                    _IStandaloneCodeEditor={this.props._IStandaloneCodeEditor}
                                    
                                />
                        }


                          <DesignSwitch design={this.props.design}/>

              </div>
        );
            
    }
}

export default Kernel
