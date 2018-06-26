import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'

class ListViewPanel3 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            clicked: false
        }
    }

    render() {

        var className = 'toolbar-panel'
        if (this.props.clicked == true)
            className += ' clicked'

        return (
            <div className={className}
                onClick={(event) => {
                    if (this.props.onPress)
                        this.props.onPress()
                    event.preventDefault()
                    event.stopPropagation()
                }}
                style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                }}>

                <div style={{
                    display: 'flex', flexDirection: 'column', width: 105, height: 140, borderWidth: 1, borderColor: '#666',
                    borderStyle: 'solid', borderRadius: 6, borderBottomLeftRadius: 9, borderBottomRightRadius: 9
                }}>

                    {/*body 部分*/}
                    <div style={{ display: 'flex', flex: '1 1 auto', background: '#444', borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
                        flexDirection:'column' }}>

                        <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            <span style={{color:'#aaa',fontSize:12}}>layout (3 rows)</span>
                        </div>

                        <div style={{display:'flex',flexDirection:'row',borderWidth:1,borderColor:'#666',borderStyle:'dashed',padding:1}}>
  

                            <div style={{display:'flex',flexDirection:'column',flex:'1 1 auto'}}>
                                <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',borderColor:'#666',borderStyle:'dashed',borderWidth:0.5}}>
                                </div>

                                 <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',borderColor:'#666',borderStyle:'dashed',borderWidth:0.5}}>
                                </div>

                                <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',borderColor:'#666',borderStyle:'dashed',borderWidth:0.5}}>
                                </div>
                            </div>


                            <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center',height:35}}>
                                <FontAwesome name='angle-right' size={16} color="#aaa" style={{ paddingLeft: 5 }} /> 
                            </div>  

                        </div>

                    </div>
                </div>

                <div style={{ color: '#aaa', fontSize: 14, marginTop: 10 }}>{this.props.name}</div>
            </div>
        )
    }
}

export default ListViewPanel3