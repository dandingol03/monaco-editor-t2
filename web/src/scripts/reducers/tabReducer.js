import _ from 'lodash'
import {
    URI_UPDATE,
    TAB_ACTIVATE,
    TAB_ADD,
    TAB_CHANGED,
    TAB_UNCHANGED,
    TAB_CLOSE,
    LAST_TAB_ACTIVATE
} from '../constants/tabConstants';


// const initialState = {
//     tabs: [
//         { name: 'package.json', path: '/Users/danding/Documents/WebstormProj/SVN/insurance_node_server/package.json' },
//         { name: 'webpack.config.js', path: '/Users/danding/Documents/WebstormProj/SVN/insurance_node_server/webpack.config.js' },
//         { name: 'index.js', path: '/Users/danding/Documents/WebstormProj/SVN/insurance_node_server/index.js', activate: true }]
// };

const initialState = {
    tabs: []
};

const design = (state = initialState, action) => {

    switch (action.type) {
        case URI_UPDATE:
            var _tabs = _.cloneDeep(state.tabs)
            var { path, uri } = action.payload
            _tabs.map((tab, i) => {
                if (tab.path == path)
                    tab.uri = uri
            })
            return Object.assign({}, state, {
                tabs: _tabs,
            });

        case TAB_ACTIVATE:
            var { name } = action.payload
            var _tabs = _.cloneDeep(state.tabs)
            _tabs.map((tab, i) => {
                if (tab.activate == true && tab.name != name)
                    tab.activate = false
                if (tab.name == name)
                    tab.activate = true
            })
            return Object.assign({}, state, {
                tabs: _tabs,
            });
        case TAB_ADD:

            var { name, path } = action.payload
            var _tabs = _.cloneDeep(state.tabs)
            _tabs.push({ name, path })
            _tabs.map((tab, i) => {
                if (tab.activate == true && tab.name != name)
                    tab.activate = false
                if (tab.name == name)
                    tab.activate = true
            })
            return Object.assign({}, state, {
                tabs: _tabs,
            });
        case TAB_CLOSE:
            debugger
            var { name, path } = action.payload
            var _tabs = _.cloneDeep(state.tabs)
            for (var i = 0; i < _tabs.length; i++) {
                var tab = _tabs[i]
                if (tab.path == path)
                    _tabs.splice(i, 1)
            }
            return Object.assign({}, state, {
                tabs: _tabs,
            });
        case TAB_CHANGED:

            var { path } = action.payload
            var _tabs = _.cloneDeep(state.tabs)
            _tabs.map((tab, i) => {
                if (tab.path == path)
                    tab.changed = true
            })
            return Object.assign({}, state, {
                tabs: _tabs,
            });

        case TAB_UNCHANGED:

            var { path } = action.payload
            var _tabs = _.cloneDeep(state.tabs)
            _tabs.map((tab, i) => {
                if (tab.path == path)
                    tab.changed = false
            })
            return Object.assign({}, state, {
                tabs: _tabs,
            });
        case LAST_TAB_ACTIVATE:
            var _tabs = _.cloneDeep(state.tabs)
            var flag = true
            if (_tabs && _tabs.length > 0) {
                for (var i = 0; i < _tabs.length; i++) {
                    var tab = _tabs[i]
                    if (tab.activate == true) {
                        flag = false
                        break
                    }
                }
            }

            if (flag && _tabs && _tabs.length > 0)//无任何tab选中
            {
                _tabs[_tabs.length - 1].activate = true
            }
            return Object.assign({}, state, {
                tabs: _tabs,
            });
        default:
            return state;
    }
}

export default design;
