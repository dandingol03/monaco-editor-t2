import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
const { ipcRenderer } = require('electron')
const Path = require('electron').remote.require('path')
const { dialog } = require('electron').remote
import 'rodal/lib/rodal.css';
import Rodal from 'rodal';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Panel from './Panel';
import ToolbarPanel from './ToolbarPanel';
import {
    makeProjectConfigUnVisible,
    newProjectByConfigInfo
} from '../../actions/rodalActions';
import {
    fetchPageTemplate,
} from '../../actions/libraryActions';
import {
    inquireSwitchToNewProject
} from '../../actions/projectActions'



class ProjectConfigRodal extends Component {

    constructor(props) {
        super(props);

        this.textarea = {}
        this.state = {
            clicked: -1,
            projName: '',
            projPath: '',
            doingInit: false,
            initFnished: false,
            logs: []
        }
    }

    render() {

        var arr = []
        var { clicked, projName, projPath, doingInit, logs, initFnished } = this.state



        var height = 130
        var width = 500


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
                                this.props.dispatch(makeProjectConfigUnVisible())
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
                            new project
                        </span>
                    </div>
                    <div style={{ display: 'flex', flex: '0 1 auto', width: 130 }}></div>

                </div>




                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto',
                }}>

                    {/*project name*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 30, padding: 4, paddingLeft: 40,
                        paddingRight: 10, justifyContent: 'flex-start', alignItems: 'center', marginBottom: 1
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <span style={{ color: '#aaa', fontSize: 11 }}>Project Name</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <input value={this.state.projName}
                                onChange={(event) => {
                                    this.setState({ projName: event.target.value })
                                }}
                                style={{
                                    background: '#666', outline: 'none', border: 'none', padding: 3, color: '#fff', fontSize: 13,
                                    width: 290, marginLeft: 12, borderRadius: 2
                                }} />
                        </div>

                    </div>

                    {/*project path*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 30, padding: 4, paddingLeft: 40,
                        paddingRight: 10, justifyContent: 'flex-start', alignItems: 'center'
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <span style={{ color: '#aaa', fontSize: 11 }}>Project Path</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <input value={this.state.projPath}
                                onChange={(event) => {
                                    this.setState({ projPath: event.target.value })
                                }}
                                style={{
                                    background: '#666', outline: 'none', border: 'none', padding: 3, color: '#fff', fontSize: 13,
                                    width: 290, marginLeft: 20, borderRadius: 2
                                }} />
                        </div>
                        <div style={{
                            display: 'flex', flexDirection: 'row', width: 20, height: 20, borderWidth: 1, borderColor: '#888',
                            borderStyle: 'solid', alignItems: 'center', justifyContent: 'center', borderRadius: 2, cursor: 'pointer'
                        }}
                            onClick={() => {
                                var ret = dialog.showOpenDialog({ title: '选择工程路径', properties: ['openDirectory'] })
                                if (ret && ret != '') {
                                    if (Object.prototype.toString.call(ret) == '[object Array]')
                                        this.setState({ projPath: ret[0] })
                                    else
                                        this.setState({ projPath: ret })
                                }

                            }}
                        >
                            <FontAwesome name='ellipsis-h' size={8} color="#ccc" />
                        </div>

                    </div>

                    {/*panel part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'column', flex: '1 1 auto', borderColor: '#111', borderStyle: 'dotted',
                        borderWidth: 0, padding: 1, paddingTop: 0
                    }}>

                    </div>


                    {/*button part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 32, padding: 10,
                        alignItems: 'flex-end'
                    }}>


                        {

                            doingInit ?
                                <div style={{
                                    display: 'flex', flexDirection: 'row', flex: '1 1 auto', padding: 3, justifyContent: 'flex-start',
                                    alignItems: 'center', overflow: 'hidden'
                                }}>
                                    <div style={{ display: 'flex', flex: '0 0 auto', fontSize: 11, color: '#ccc', padding: 4, marginbottom: 4, flexWrap: 'wrap' }}>
                                        {logs[logs.length - 1]}
                                    </div>
                                </div> : null
                        }

                        {
                            doingInit ?
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', padding: 4, alignItems: 'center' }}>
                                    <i className="fa fa-circle-o-notch fa-spin "
                                        style={{ color: "#ddd" }}>
                                    </i>
                                </div> : null
                        }

                        {
                            doingInit ?
                                null :
                                <div style={{ display: 'flex', flex: '1 1 auto', }}></div>
                        }

                        {
                            doingInit ?
                                null :
                                <div className='button'
                                    style={{
                                        display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                        alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                                    }}
                                    onClick={(event) => {

                                        if (initFnished) {
                                            var dest=Path.resolve(projPath,projName)
                                            //切换进新工程
                                            this.props.dispatch(inquireSwitchToNewProject(dest))
                                            this.props.dispatch(makeProjectConfigUnVisible())
                                        } else {
                                            //开始新建工程及初始化
                                            this.setState({ doingInit: true })
                                            this.props.dispatch(newProjectByConfigInfo(projName, projPath)).then((json) => {
                                                var { status } = json.data
                                                if (status == 'finished')//安装完成
                                                {
                                                    this.setState({ doingInit: false })
                                                    this.props.dispatch(makeProjectConfigUnVisible())
                                                }
                                            })
                                        }
                                        event.preventDefault()
                                        event.stopPropagation()
                                    }}
                                >
                                    {
                                        initFnished ?
                                            <span style={{ fontSize: 14, color: '#ccc' }}>
                                                Switch
                                            </span> :
                                            <span style={{ fontSize: 14, color: '#ccc' }}>
                                                Create
                                            </span>
                                    }
                                </div>
                        }

                    </div>


                </div>


            </Rodal>
        )

    }

    componentWillUnmount() {
        debugger
        this.setState({ doingInit: false, initFnished: false, logs: [] })
    }

    componentWillMount() {
        ipcRenderer.on('console', (evt, message) => {
            this.state.logs.push(message)
            this.setState({ logs: this.state.logs })
        })

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
    props.visible = state.rodal.visible.projectConfig
    return props
}

export default connect(mapStateToProps)(ProjectConfigRodal)