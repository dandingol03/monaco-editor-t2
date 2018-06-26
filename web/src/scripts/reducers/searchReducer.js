import {
    ON_TEXT_SEARCH
} from '../constants/searchConstants';


const initialState = {
    matches: {}, 
};

let search = (state = initialState, action) => {



    switch (action.type) {
        case ON_TEXT_SEARCH:

            var {matches}=action.payload
            return Object.assign({}, state, {
                matches:matches
            })
            
        default:
            return state;
    }
}

export default search;
