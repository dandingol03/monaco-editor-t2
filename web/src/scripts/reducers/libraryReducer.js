import {
    ON_LIBRARY_METALIST_FETCHED,
    CACHE_LIBRARY_TEMPLATE,
    CACHE_LIBRARY_TPL,
    CACHE_ALL_LIBRARY_TPL
} from '../constants/libraryConstants';


const initialState = {
    templates: {}, 
    tpls:{},
    metalist:null
};

let library = (state = initialState, action) => {



    switch (action.type) {
        case ON_LIBRARY_METALIST_FETCHED:

            var {metalist}=action.payload
            return Object.assign({}, state, {
                metalist:metalist
            })
            
        case CACHE_LIBRARY_TEMPLATE:
            var {name,template,}=action.payload
            return Object.assign({},state,{
                templates:Object.assign(state.templates,{[name]:template})
            })
        case CACHE_LIBRARY_TPL:
        var {name,tpl}=action.payload
            return Object.assign({},state,{
                tpls:Object.assign(state.tpls,{[name]:tpl})
            })
        case CACHE_ALL_LIBRARY_TPL:
            
          var {tpls}=action.payload
            return Object.assign({},state,{
                tpls:tpls
            })
        default:
            return state;
    }
}

export default library;
