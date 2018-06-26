import {
    ON_GET_NEW_LOG,
    MAKE_CONSOLE_VISIBLE,
    MAKE_CONSOLE_UNVISIBLE,
    CLEAN_ALL_LOGS
} from '../constants/consoleConstants';


const initialState = {
    visible: false,
    logs: [],
    count:0,
    threshold: 100
};

let Console = (state = initialState, action) => {


    switch (action.type) {
        case MAKE_CONSOLE_VISIBLE:
            return Object.assign({}, state, {
                visible: true,
            })
        case MAKE_CONSOLE_UNVISIBLE:
            return Object.assign({}, state, {
                visible: false,
            })
        case ON_GET_NEW_LOG:
            var { log } = action.payload
            if (state.logs.length == state.threshold)
                state.logs.splice(0, 1)
            state.logs.push(log)
            return Object.assign({}, state, {
                logs: state.logs,
                count:++state.count
            })
        case CLEAN_ALL_LOGS:
            state.logs=[]
            return Object.assign({}, state, {
                logs: state.logs
            })     
        default:
            return state;
    }
}

export default Console;
