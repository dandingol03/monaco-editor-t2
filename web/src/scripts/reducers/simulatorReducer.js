import _ from 'lodash'
import {
    SET_PHONE_SIMULATOR,
    simulators
} from '../constants/simulatorConstants'


const initialState = {
    device: simulators['Nexus 5x']
};

const simulator = (state = initialState, action) => {

    switch (action.type) {
        case SET_PHONE_SIMULATOR:
            
            var {name} = action.payload

            return Object.assign({}, state, {
                device: simulators[name]
            });       
        default:
            return state;
    }
}

export default simulator;
