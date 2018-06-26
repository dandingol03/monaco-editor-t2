import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'

class ListViewPanel1 extends Component {

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
                            <span style={{color:'#aaa',fontSize:12}}>layout1</span>
                        </div>

                        <div style={{display:'flex',flexDirection:'row',borderWidth:1,borderColor:'#666',borderStyle:'dashed',padding:1}}>

                            <div style={{display:'flex',flexDirection:'row',alignItems:'center',borderColor:'#666',borderWidth:0.5,
                                height:35,width:35,borderStyle:'dashed'}}>
                            </div>    

                            <div style={{display:'flex',flexDirection:'column',flex:'1 1 auto'}}>
                                <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',borderColor:'#666',borderStyle:'dashed',borderWidth:0.5}}>
                                </div>

                                <div style={{display:'flex',flex:'1 1 auto',flexDirection:'row',borderColor:'#666',borderStyle:'dashed',borderWidth:0.5}}>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                <div style={{ color: '#aaa', fontSize: 14, marginTop: 10 }}>{this.props.name}</div>
            </div>
        )
    }
}

export default ListViewPanel1