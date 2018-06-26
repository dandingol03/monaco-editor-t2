/**
 * Created by danding on 17/5/6.
 */
import 'babel-polyfill';
var React = require('react');
var ReactDOM = require('react-dom');
import { render, } from 'react-dom'


import configureStore from './store/store.dev.js';
import Root from './containers/Root/index'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';
const store = configureStore();

const DraggableRoot = DragDropContext(HTML5Backend)(Root)

import Display from './events/Display';
Display.setMaxListeners(20);
import crc from  'create-react-class'
global.__dirname='/Users/danding/Documents/WebstormProj/monaco-editor-t2'

render(
    <DraggableRoot store={store} />,
    document.getElementById('app')
)
