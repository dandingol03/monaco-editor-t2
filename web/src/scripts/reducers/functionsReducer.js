import {
    ON_FUNCTION_SELECT
} from '../constants/functionConstants';


const initialState = {
    function: 'project', 
};

let functions = (state = initialState, action) => {



    switch (action.type) {
        case ON_FUNCTION_SELECT:

            var {type}=action.payload
            return Object.assign({}, state, {
                function:type
            })
            
        default:
            return state;
    }
}

export default functions;
