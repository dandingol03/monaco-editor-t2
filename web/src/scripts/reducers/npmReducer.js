import {
    GET_MONACO_EDITOR_PACKAGES,
    ON_NPM_SEARCH_TERMINATE,
    ON_NPM_SEARCH_ERROR,
    ON_NPM_SEARCH_DATA,
    FETCH_STATUS_IDLE,
    FETCH_STATUS_BUSY,
    FETCH_STATUS_ERROR,
    FETCH_STATUS_BEGIN_SEARCH,
    ON_CACHE_REPO
} from '../constants/npmConstants';


const initialState = {
    packages: [],
    status: FETCH_STATUS_IDLE,
    dictionary: null,
    ratio:null,
    repos:null
};

let Npm = (state = initialState, action) => {


    switch (action.type) {
        case ON_NPM_SEARCH_DATA:
            var { data } = action.payload
            var statements = data.split('\n')
            var dictionary = null
            var packages = null
            var ratio=null
            if (state.status != FETCH_STATUS_BEGIN_SEARCH) {
                packages = state.packages
                dictionary = state.dictionary
                ratio=state.ratio
            } else {
                packages = []
            }
            
            statements.map((statement, i) => {
                if (i == 0 && state.status == FETCH_STATUS_BEGIN_SEARCH)//字段描述
                {
                    dictionary = []
                    ratio=[]
                    var words = statement.split('|')
                    words.map((word, i) => {
                        if (word != null && word.trim() != '')
                        {
                            dictionary.push(word.trim())
                            ratio.push(word.length)
                        }
                    })
                } else {
                    if(statement!='')
                    {
                        var words = statement.split('|')
                        var npmPackage = {}
                        words.map((word, j) => {
                            if (word != null && word.trim() != '')
                            {
                                npmPackage[dictionary[j]] = word
                            }
                        })
                        packages.push(npmPackage)
                    }
                }
            })

            return Object.assign({}, state, {
                status: FETCH_STATUS_BUSY,
                dictionary: dictionary,
                packages: packages,
                ratio:ratio
            })
        case GET_MONACO_EDITOR_PACKAGES:

            return Object.assign({}, state, {
                status: FETCH_STATUS_BEGIN_SEARCH,
                packages: [],
                dictionary: null,
                ratio:null
            })
        case ON_NPM_SEARCH_ERROR:
            var { data } = action.payload
            return Object.assign({}, state, {
                status: FETCH_STATUS_ERROR,
                dictionary: null,
                error: data
            })
        case ON_NPM_SEARCH_TERMINATE:

            return Object.assign({}, state, {
                status: FETCH_STATUS_IDLE,
            })
        case ON_CACHE_REPO:
            var {repos}=action.payload
            return Object.assign({}, state, {
                repos
            })
        
        default:
            return state;
    }
}

export default Npm;
