import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'

class ToolbarPanel extends Component {

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

                    {/*title 部分*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 0 auto', height: 20, backgroundColor: '#66CDAA',
                        borderTopLeftRadius: 5, borderTopRightRadius: 5
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome name='arrow-left' size={12} color="#fff" style={{ marginLeft: 5 }} />
                        </div>

                        <div style={{
                            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
                            flex: '1 1 auto', paddingLeft: 10
                        }}>
                            <span style={{ fontSize: 12, color: '#fff' }}>title</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingRight: 7 }}>
                            <FontAwesome name='ellipsis-v' size={14} color="#fff" />
                        </div>

                    </div>

                    {/*body 部分*/}
                    <div style={{ display: 'flex', flex: '1 1 auto', background: '#eee', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>

                    </div>


                </div>

                <div style={{ color: '#aaa', fontSize: 14, marginTop: 10 }}>{this.props.name}</div>
            </div>
        )
    }
}

export default ToolbarPanel