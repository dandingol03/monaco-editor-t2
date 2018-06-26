import React, { Component, } from 'react'
import { connect } from 'react-redux'
const { ipcRenderer } = require('electron')
import _ from 'lodash';
const Path = require('electron').remote.require('path')
import 'rodal/lib/rodal.css';
var Spinner = require('react-spinkit')
import Rodal from 'rodal';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Panel from './Panel';
import ToolbarPanel from './ToolbarPanel';
import {
    makeComponentsInstallUnVisible,
    fetchNPMPackageInfo,
    applyNPMPackageConfigInfo
} from '../../actions/rodalActions';
import {
    fetchPageTemplate,
} from '../../actions/libraryActions';
import {
    intergrateWithLibraryInBatch
} from '../../actions/npmActions'

import library from '../../reducers/libraryReducer';
import ReactPlaceholder from 'react-placeholder';
import "react-placeholder/lib/reactPlaceholder.css";


class ComponentsInstallRodal extends Component {

    constructor(props) {
        super(props);

        this.textarea = {}
        this.state = {
            clicked: -1,
            selected: {},
            filename: '',
            template: null,
            tpl: null,
            doingInstall: false,
            logs: []
        }
    }

    render() {

        var arr = []
        var { clicked, template, selected, doingInstall, logs } = this.state
        var props = this.props

        var fields = []
        var ratio = [3, 1, 1]
        var dictionary = ['name', 'status', 'config']
        var packages = [
            { name: 'react-native-video', status: 'installed', config: '' },
            { name: 'react-native-datepicker', status: 'not installed', config: '' },
            { name: 'react-native-modal', status: 'installed', config: '' },
            { name: 'react-native-scrollable-tab-view', status: 'installed', config: '' },
            { name: 'react-native-floating-label-text-input', status: 'not installed', config: '' },
            { name: 'react-native-sensitive-info', status: 'installed', config: '' },
            { name: 'react-native-vector-icons', status: 'installed', config: '' },
            { name: 'react-native-tab-navigator', status: 'installed', config: '' }
        ]

        if (dictionary && dictionary.length > 0) {
            dictionary.map((field, j) => {
                if (j != dictionary.length - 1) {
                    fields.push(
                        <div key={j} style={{
                            display: 'flex', flexDirection: 'row', flex: ratio[j], justifyContent: 'center',
                            color: '#ddd', fontSize: 12, borderRightWidth: 1, borderRightColor: '#555', borderRightStyle: 'solid'
                        }}>
                            {field}
                        </div>)
                } else {
                    fields.push(
                        <div key={j} style={{
                            display: 'flex', flexDirection: 'row', flex: ratio[j], justifyContent: 'center',
                            color: '#ddd', fontSize: 12
                        }}>
                            {field}
                        </div>)
                }
            })

            var entity = (
                <div key={-1} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 2, background: '#666', cursor: 'pointer' }}>
                    {fields}
                </div>)
            arr.push(entity)
        }

        packages.map((packageEntity, i) => {
            fields = []
            dictionary.map((field, j) => {
                fields.push(
                    <div key={j} style={{ display: 'flex', flexDirection: 'row', flex: ratio[j], justifyContent: 'flex-start', alignItems: 'center', color: '#ddd' }}>
                        {
                            j == 0 ?
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div style={{ width: 10 }}></div>
                                    {
                                        packageEntity.status == 'installed' || selected[i] == true ?
                                            <FontAwesome name={'check-square-o'} size={13} color="#ddd" /> :
                                            <FontAwesome name={'square-o'} size={13} color="#ddd" />
                                    }
                                    <div style={{ width: 20 }}></div>
                                </div>
                                : null
                        }
                        {packageEntity[field]}
                        {
                            j == 0 && selected[i] == true ?
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div style={{ width: 10 }}></div>
                                    <FontAwesome name={'download'} size={11} color="#6fc3df" />
                                </div>
                                : null
                        }
                    </div>)
            })
            entity = (
                <div key={i} className={clicked == i ? 'clicked' : ''} style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 1, marginTop: 1,
                    background: '#222', cursor: 'pointer'
                }}
                    onClick={(e) => {
                        if (packageEntity.status != 'installed')//该组件未被安装，才存在selected的状态
                        {
                            if (selected[i] != true)
                                selected[i] = true
                            else
                                selected[i] = false
                        }
                        this.setState({ selected })
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                >
                    {fields}
                </div>)
            arr.push(entity)
        })

        var configTemplate = (
            <textarea key={1} ref={(p) => {
                this.textarea.template = p
            }} style={{
                display: 'flex', flex: '1 1 auto', fontFamily: 'sans-serif', fontSize: 14, fontWeight: 'bold'
                , background: '#333', color: '#eee', outline: 'none', borderWidth: 0
            }} />
        )



        var height = 430
        var width = 800



        return (
            <Rodal visible={this.props.visible} animation='door' className='rodal-modal' onClose={() => { }}
                showCloseButton={false} width={width} height={height}>
                {/*header content*/}
                <div className='header' style={{
                    display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 17,
                    justifyContent: 'center',
                }}>

                    <div style={{
                        display: 'flex', flex: '0 0 auto', alignItems: 'center', flexDirection: 'row',
                        justifyContent: 'flex-start', paddingLeft: 10, width: 130
                    }}>
                        <div
                            style={{
                                display: 'flex', width: 14, height: 14, backgroundColor: 'rgb(226, 105, 105)', flexDirection: 'row',
                                alignItems: 'center', justifyContent: 'center', borderRadius: 7, cursor: 'pointer'
                            }}
                            onClick={(event) => {
                                this.props.dispatch(makeComponentsInstallUnVisible())
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <FontAwesome name='times' size={8} color="#444" />
                        </div>

                        <div style={{
                            display: 'flex', width: 14, height: 14, backgroundColor: '#aaa', flexDirection: 'row',
                            alignItems: 'center', justifyContent: 'center', borderRadius: 7, cursor: 'pointer', marginLeft: 5
                        }}>

                        </div>

                        <div style={{
                            display: 'flex', width: 14, height: 14, backgroundColor: '#1bca1b', flexDirection: 'row',
                            alignItems: 'center', justifyContent: 'center', borderRadius: 7, cursor: 'pointer', marginLeft: 5
                        }}>
                            <FontAwesome name='plus' size={8} color="#444" />
                        </div>

                    </div>

                    <div style={{ display: 'flex', flex: '1 1 auto', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                        <span style={{ color: '#444', fontSize: 12 }}>
                            component install
                        </span>
                    </div>

                    <div style={{ display: 'flex', flex: '0 1 auto', width: 130 }}></div>

                </div>


                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto',
                }}>


                    {/*panel part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'column', flex: '1 1 auto', borderColor: '#111', borderStyle: 'dotted',
                        borderWidth: 0, borderBottomWidth: 1, backgroundColor: '#333', padding: 1, paddingTop: 0
                    }}>
                        {
                            arr
                        }
                    </div>

                    {
                        doingInstall?
                        <div style={{
                            display: 'flex', flex: '0 1 auto', height: 25, padding: 4, flexDirection: 'row',
                            alignItems: 'center', background: '#aaa'
                        }}
                        >
                            <div style={{display:'flex',flex:'1 1 auto'}}/>
                            <div style={{
                                display: 'flex', flexDirection: 'row', flex: '0 1 auto',  padding: 10, justifyContent: 'center',
                                alignItems: 'flex-end'
                            }}>
                                <div style={{ display: 'flex', flex: '0 0 auto',fontSize:11, color: '#3c3c3c', padding: 4, marginbottom: 4, flexWrap: 'wrap' }}>
                                    {logs[logs.length - 1]}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flex: '0 1 auto', flexDirection: 'row', justifyContent: 'center' }}>
                                <Spinner spinnerName="circle" />
                            </div>
                        </div>:null
                    }


                    {/*button part*/}
                    {
                        doingInstall ?
                            null :
                            <div style={{
                                display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 32, padding: 10, justifyContent: 'flex-end',
                                alignItems: 'flex-end'
                            }}>

                                <div className='button'
                                    style={{
                                        display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                        alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                                    }}
                                    onClick={(event) => {

                                        //todo 
                                        var selectedLiberarys = _.keys(selected)
                                        if (selectedLiberarys && selectedLiberarys.length > 0) {
                                            var arr = []
                                            selectedLiberarys.map((libraryIndex, i) => {
                                                var library = packages[libraryIndex]
                                                arr.push(library.name)
                                            })
                                            this.setState({ doingInstall: true })
                                            props.dispatch(intergrateWithLibraryInBatch(arr)).then((json) => {
                                                setTimeout(() => {
                                                    this.setState({ doingInstall: false })
                                                    props.dispatch(makeComponentsInstallUnVisible())
                                                }, 3000)
                                            })
                                        }

                                        event.preventDefault()
                                        event.stopPropagation()
                                    }}
                                >
                                    <span style={{ fontSize: 14, color: '#ccc' }}>
                                        OK
                                </span>
                                </div>

                            </div>
                    }


                </div>


            </Rodal>
        )

    }

    componentWillMount() {
        ipcRenderer.on('console', (evt, message) => {
            this.state.logs.push(message)
            this.setState({ logs: this.state.logs })
        })

    }

    componentWillUnmount() {
        this.setState({ doingInstall: false, logs: [] })
    }

}


const mapStateToProps = (state, ownProps) => {

    var filePath = state.directory.selected
    var _files = state.directory.files
    var rootPath = state.directory.rootPath
    var file = null
    var path = rootPath


    if (filePath && filePath != '' && filePath.length > 0) {

        file = _files
        filePath.map((pa, i) => {
            file = file[pa]
            if (pa != 'children')
                path = Path.resolve(path, file.filename)
        })
    }


    const props = {
        file: file,
        rootPath: rootPath,
        selected: state.directory.selected,
        path: path
    }

    props.rodal = state.rodal
    props.visible = state.rodal.visible.componentsInstall
    return props
}

export default connect(mapStateToProps)(ComponentsInstallRodal)