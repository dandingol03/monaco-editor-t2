
import _ from 'lodash'
import {
    ON_ACTION_SHEET_INIT,
    ON_ACTION_SHEET_DESTROY,
    MAKE_BACK_DROP_VISIBLE,
    MAKE_BACK_DROP_UNVISIBLE
} from '../constants/actionSheetConstants';

const initialState = {
    instance: {},
    backdrop: false
};

const actionSheet = (state = initialState, action) => {

    switch (action.type) {
        case ON_ACTION_SHEET_INIT:
            var { haff, ref } = action.payload

            return Object.assign({}, state, {
                instance: Object.assign(state.instance, { [ref]: { haff, ref } })
            });
        case ON_ACTION_SHEET_DESTROY:
            var { haff, ref } = action.payload
            var _instance = _.cloneDeep(state.instance)
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

export default actionSheet;
