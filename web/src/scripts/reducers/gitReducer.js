import {
    SYNC_NODES_MODIFIED,
    SYNC_GIT_STATUS,
    SET_GIT_STATUS_BUSY,
    SET_GIT_STATUS_IDLE
} from '../constants/gitConstants';


const initialState = {
    modified: null,
    not_added: null,
    busy: false
};

let git = (state = initialState, action) => {


    switch (action.type) {
        case SYNC_GIT_STATUS:

            var { modified, not_added, staged } = action.payload
            return Object.assign({}, state, {
                modified: modified,
                not_added: not_added,
                staged: staged
            })
        case SET_GIT_STATUS_BUSY:
            return Object.assign({}, state, {
                busy: true
            })
        case SET_GIT_STATUS_IDLE:
          return Object.assign({}, state, {
                busy: false
            })
        default:
            return state;
    }
}

export default git;
