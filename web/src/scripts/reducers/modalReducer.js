
import _ from 'lodash'
import {
    ON_MODAL_INIT,
    ON_MODAL_DESTROY,
    MAKE_BACK_DROP_VISIBLE,
    MAKE_BACK_DROP_UNVISIBLE
} from '../constants/modalConstants';

const initialState = {
    instance: {},
    backdrop: false
};

const modal = (state = initialState, action) => {

    switch (action.type) {
        case ON_MODAL_INIT:
            var { haff, ref } = action.payload
            if(ref==null||ref==undefined)
                ref='modal'
            return Object.assign({}, state, {
                instance: Object.assign(state.instance, { [ref]: { haff, ref } })
            });
        case ON_MODAL_DESTROY:
            var { haff, ref } = action.payload
            var _instance = _.cloneDeep(state.instance)
            if(ref==undefined||ref==null)
                ref='modal'
            if (_instance[ref])
                delete _instance[ref]
            return Object.assign({}, state, {
                instance: _instance
            });
        case MAKE_BACK_DROP_VISIBLE:
            return Object.assign({}, state, {
                backdrop: true
            });
        case MAKE_BACK_DROP_UNVISIBLE:
            return Object.assign({}, state, {
                backdrop: false
            });

        default:
            return state;
    }
}

export default modal;
