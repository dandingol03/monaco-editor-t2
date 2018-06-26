import _ from 'lodash'

import {
    MAKE_RODAL_VISIBLE,
    MAKE_RODAL_UNVISIBLE,
    MAKE_NPM_PACKAGES_VISIBLE,
    MAKE_NPM_PACKAGES_UNVISIBLE,
    MAKE_PROJECT_CONFIG_VISIBLE,
    MAKE_PROJECT_CONFIG_UNVISIBLE,
    MAKE_DIRECTORY_RODAL_VISIBLE,
    MAKE_DIRECTORY_RODAL_UNVISIBLE,
    MAKE_FIELDS_RODAL_UNVISIBLE,
    MAKE_FIELDS_RODAL_VISIBLE,
    MAKE_RENDER_ROW_RODAL_UNVISIBLE,
    MAKE_RENDER_ROW_RODAL_VISIBLE,
    MAKE_LISTVIEW_TEMPLATE_RODAL_UNVISIBLE,
    MAKE_LISTVIEW_TEMPLATE_RODAL_VISIBLE,
    MAKE_COMPONENTS_INSTALL_VISIBLE,
    MAKE_COMPONENTS_INSTALL_UNVISIBLE,
    MAKE_SAVE_FILE_VISIBLE,
    MAKE_SAVE_FILE_UNVISIBLE,
    MAKE_LIBRARY_WARNING_VISIBLE,
    MAKE_LIBRARY_WARNING_UNVISIBLE,
    MKAE_GITHUB_REPOS_VISIBLE,
    MAKE_GITHUB_REPOS_UNVISIBLE
} from '../constants/rodalConstants';


const initialState = {
    visible: {
        newPage: false,
        npmPackages: false,
        githubRepos: false,
        projectConfig: false,
        directory: false,
        componentsInstall: false,
        saveFile: false,
    },
    fields: {
        visible: false,
    },
    listViewTemplate: {
        visible: false
    },
    renderRow: {
        visible: false,
    },
    libraryWarning: {
        visible: false
    }
};

const design = (state = initialState, action) => {

    switch (action.type) {
        case MAKE_LISTVIEW_TEMPLATE_RODAL_VISIBLE:
            var { haff } = action.payload
            return Object.assign({}, state, {
                listViewTemplate: Object.assign(state.listViewTemplate, { visible: true, haff })
            });
        case MAKE_LISTVIEW_TEMPLATE_RODAL_UNVISIBLE:
            return Object.assign({}, state, {
                listViewTemplate: Object.assign(state.listViewTemplate, { visible: false })
            });

        case MAKE_RODAL_VISIBLE:

            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { newPage: true })
            });
        case MAKE_RODAL_UNVISIBLE:

            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { newPage: false })
            });
        case MAKE_NPM_PACKAGES_VISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { npmPackages: true })
            });
        case MAKE_NPM_PACKAGES_UNVISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { npmPackages: false })
            });
        case MKAE_GITHUB_REPOS_VISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { githubRepos: true })
            });
        case MAKE_GITHUB_REPOS_UNVISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { githubRepos: false })
            });
        case MAKE_PROJECT_CONFIG_VISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { projectConfig: true })
            });
        case MAKE_PROJECT_CONFIG_UNVISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { projectConfig: false })
            });
        case MAKE_DIRECTORY_RODAL_VISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { directory: true })
            });
        case MAKE_DIRECTORY_RODAL_UNVISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { directory: false })
            });
        case MAKE_FIELDS_RODAL_VISIBLE:
            var { haff } = action.payload
            return Object.assign({}, state, {
                fields: Object.assign(state.fields, { visible: true, haff })
            });
        case MAKE_FIELDS_RODAL_UNVISIBLE:

            return Object.assign({}, state, {
                fields: Object.assign(state.fields, { visible: false })
            });
        case MAKE_RENDER_ROW_RODAL_VISIBLE:
            var { haff } = action.payload
            return Object.assign({}, state, {
                renderRow: Object.assign(state.renderRow, { visible: true, haff })
            });
        case MAKE_RENDER_ROW_RODAL_UNVISIBLE:
            return Object.assign({}, state, {
                renderRow: Object.assign(state.renderRow, { visible: false, haff: null })
            });
        case MAKE_COMPONENTS_INSTALL_VISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { componentsInstall: true })
            });
        case MAKE_COMPONENTS_INSTALL_UNVISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { componentsInstall: false })
            });
        case MAKE_SAVE_FILE_VISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { saveFile: true })
            });
        case MAKE_SAVE_FILE_UNVISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.visible, { saveFile: false })
            });
        case MAKE_LIBRARY_WARNING_VISIBLE:
            var { npmName } = action.payload
            return Object.assign({}, state, {
                visible: Object.assign(state.libraryWarning, { visible: true, npmName })
            });
        case MAKE_LIBRARY_WARNING_UNVISIBLE:
            return Object.assign({}, state, {
                visible: Object.assign(state.libraryWarning, { visible: false })
            });
        default:
            return state;
    }
}

export default design;
