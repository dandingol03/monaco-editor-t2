import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd';
import { 
    simulators
 } from '../constants/simulatorConstants'
import {
    setPhoneSimulator
} from '../actions/simulatorActions'

class Grid extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }
    
    

    render() {

        var state = this.state;
        var props = this.props;

        var {device}=this.props

        var devices = []
        if (simulators) {
            _.keys(simulators).map((name, i) => {

                var simulator = simulators[name];

                if (device.name == name)
                    devices.push(
                        <option key={i} value={name} selected={true}>
                            {name}   {simulator.width}x{simulator.height}
                        </option>);
                else
                    devices.push(
                        <option key={i} value={name}>
                            {name}   {simulator.width}x{simulator.height}
                        </option>)
            })
        }


        return (
            <div style={styles.container} >
                <div style={{
                    display: 'flex', flex: '0 1 auto', height: '33px', flexDirection: 'row', borderLeftWidth: 2, borderLeftColor: '#333', borderLeftStyle: 'solid',
                    justifyContent: 'flex-start', background: '#444'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 12, fontFamily: 'sans-serif', paddingLeft: 15, paddingRight: 20 }}>
                            Android Device
                        </span>
                        <select onChange={(event)=>{
                            var simulatorName=event.target.value
                            this.props.dispatch(setPhoneSimulator(simulatorName))
                        }}>
                           {devices}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'row' }}>
                    {props.children}
                </div>
            </div>

        )

    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
    },
    row: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'row',
        alignItems: 'center'
    }
}

const mapStateToProps = (state, ownProps) => {

    const props = {}
    const device = state.simulator.device
    props.device = device

    return props
}


export default connect(mapStateToProps)(Grid);