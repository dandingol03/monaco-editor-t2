

import { routeReducer, } from 'react-router-redux'
import { combineReducers } from 'redux';


import monaco from './monacoReducer';
import uiReducer from './uiReducer';
import modeReducer from './designReducer';
import fileReducer from './fileReducer';
import paletteReducer  from './paletteReducer';
import tabReducer from './tabReducer';
import libraryReducer from './libraryReducer';
import rodalReducer from './rodalReducer';
import functionsReducer from './functionsReducer';
import gitReducer from './gitReducer';
import actionSheetReducer from './actionSheetReducer';
import modalReducer from './modalReducer';
import datePickerReducer from './datePickerReducer';
import simulatorReducer from './simulatorReducer';
import scrollReducer from './scrollReducer';
import consoleReducer from './consoleReducer';
import npmReducer from './npmReducer';
import { loadingBarReducer } from 'react-redux-loading-bar'


var rootReducer=combineReducers({
    directory:fileReducer,
    monaco:monaco,
    routing: routeReducer,
    ui:uiReducer,
    designMode:modeReducer,
    palette:paletteReducer,
    tab:tabReducer,
    library:libraryReducer,
    rodal:rodalReducer,
    functions:functionsReducer,
    git:gitReducer,
    loadingBar:loadingBarReducer,
    actionSheet:actionSheetReducer,
    modal:modalReducer,
    datePicker:datePickerReducer,
    simulator:simulatorReducer,
    scroll:scrollReducer,
    consoleUtils:consoleReducer,
    npm:npmReducer
});

module.exports=rootReducer;
