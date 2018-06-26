/**
 * Created by danding on 17/5/8.
 */

import {
    COMPONENT_SELECTED,
    COMPONENT_UNSELECTED,
    MAKE_COMPONENT_SWITCHED,
    MAKE_COMPONENT_UNSWITCHED,
    COMPONENT_NODE_SELECTED,
    PANEL_SWITCH,
    UPDATE_SELECTED_HAFF,
    STORE_SWITCH_OP
} from '../constants/paletteConstants';



const initialState = {
    component: null,
    detail: 'properties',
    switched: {
        op: null,
        haffs:[]
    },
    componentNode: {}
};

let palette = (state = initialState, action) => {



    switch (action.type) {

        case COMPONENT_SELECTED:

            var { component, haff } = action.payload

            return Object.assign({}, state, {
                component: component,
                haff: haff
            })
        case COMPONENT_NODE_SELECTED:
            var { haff } = action.payload

            return Object.assign({}, state, {
                componentNode: Object.assign(state.componentNode, { haff })
            })

        case COMPONENT_UNSELECTED:

            return Object.assign({}, state, {
                component: null,
                haff: null
            })
        case PANEL_SWITCH:
            return Object.assign({}, state, {
                detail: action.data,
            })
        case UPDATE_SELECTED_HAFF:
            var { haff } = action.payload
            return Object.assign({}, state, {
                haff: haff
            })
        case MAKE_COMPONENT_SWITCHED:
            var { haff } = action.payload
            var { switched } = state
            var _switched=_.cloneDeep(switched)
            if(_switched.haffs)
            {}
            else
                _switched.haffs=[]
            _switched.haffs.push(haff)

            return Object.assign({}, state, {
                switched: _switched
            })
        case STORE_SWITCH_OP:

            var { haff1, haff2 } = action.payload
            var { switched } = state
            var _switched = _.cloneDeep(switched)
            if (_switched.op == undefined || _switched.op == null)
                _switched.op = {}
            var assigned1 = null
            var assigned2 = null
            if (_switched.op[haff1])
                assigned1 = _switched.op[haff1]
            if (_switched.op[haff2])
                assigned2 = _switched.op[haff2]
            var tmp = null
            if (assigned1)
                tmp = assigned1
            else
                tmp = haff1
            if(assigned2)
                _switched.op[haff1]=assigned2
            else
                _switched.op[haff1]=haff2
            _switched.op[haff2]=tmp


            return Object.assign({}, state, {
                switched: _switched
            })
        default:
            return state;
    }
}

export default palette;
