import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
const Path = require('electron').remote.require('path')
import 'rodal/lib/rodal.css';
import Rodal from 'rodal';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Panel from './Panel';
import ToolbarPanel from './ToolbarPanel';
import {
    makeRodalUnVisible
} from '../../actions/rodalActions'
import {
    createFile,
    fetchSubPath,
    activateFile
} from '../../actions/fileActions'
import {
    fetchPageTemplate
} from '../../actions/libraryActions'
import{
    openDocument
} from '../../actions/editorActions'
import{
    addTab
} from '../../actions/tabActions'


class RodalWrapper extends Component {

    onFileClick(haff) {
        //选中文件
        this.props.dispatch(activateFile(haff))
        var path = this.props.rootPath
        var node = this.props.files
        haff.map((pa, i) => {
            node = node[pa]
            if (node.filename)
                path = Path.resolve(path, node.filename)
        })
        var buf = new Buffer(path);
        var id = buf.toString('hex');

        this.props.dispatch(openDocument({
            absolutePath: path,
            id: id
        })).then((payload) => {
            //在这里去设置doc的新内容
            //查看现有tab是否有跟此一样的路径
            var exist = false
            if (this.props.tabs && this.props.tabs.length > 0) {
                this.props.tabs.map((tab, i) => {
                    if (tab.path == path) {
                        exist = true
                    }
                })
            }
            if (exist == true)//如果已有tab对应,则设置其选中
            {
            } else {
                //新建tab
                var tab = {
                    name: node.filename,
                    path: path
                }
                this.props.dispatch(addTab(tab))
            }
        });

    }

    constructor(props) {
        super(props);

        this.state = {
            panels: [
                { type: 'Panel', name: 'Basic Page' },
                { type: 'ToolbarPanel', name: 'Toolbar Page' }
            ],
            clicked: 0,//默认普通页面
            filename: ''
        }
    }

    render() {

        var arr = []
        var { clicked, panels } = this.state
        panels.map((panel, i) => {
            if (panel.type == 'Panel') {
                arr.push(
                    <Panel name={panel.name} key={i} clicked={clicked == i}
                        onPress={() => {
                            this.setState({ clicked: i })
                        }} />)
            } else if (panel.type == 'ToolbarPanel') {
                arr.push(
                    <ToolbarPanel name={panel.name} key={i} clicked={clicked == i}
                        onPress={() => {
                            this.setState({ clicked: i })
                        }}
                    />)
            }
        })

        return (
            <Rodal visible={this.props.rodal.visible.newPage} animation='door' className='rodal-modal' onClose={() => { }}
                showCloseButton={false} width={660} height={430}>
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
                                this.props.dispatch(makeRodalUnVisible())
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
                            Create New Page
                            </span>
                    </div>

                    <div style={{ display: 'flex', flex: '0 1 auto', width: 130 }}></div>

                </div>


                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto',
                }}>

                    {/*panel header*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 30, padding: 4, paddingLeft: 40,
                        paddingRight: 10, background: '#555', justifyContent: 'flex-start'
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <span style={{ color: '#aaa', fontSize: 14 }}>Page Name</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <input value={this.state.filename}
                                onChange={(event) => {
                                    this.setState({ filename: event.target.value })
                                }}
                                style={{
                                    background: '#666', outline: 'none', border: 'none', padding: 3, color: '#fff', fontSize: 13,
                                    width: 200, marginLeft: 20, borderRadius: 2
                                }} />
                        </div>

                    </div>

                    {/*panel part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'column', flex: '1 1 auto', borderColor: '#111', borderStyle: 'dotted',
                        borderWidth: 0, borderBottomWidth: 1, backgroundColor: '#333'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'row', padding: 8 }}>
                            {arr}
                        </div>
                    </div>


                    {/*button part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 32, padding: 10, justifyContent: 'flex-end',
                        alignItems: 'flex-end'
                    }}>
                        <div className='button' style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#ccc' }}>Cancel</span>
                        </div>


                        {/*
                                                    <div className='button' style={{
                            display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                            alignItems: 'center', paddingLeft: 22, paddingRight: 22, background: '-webkit-linear-gradient(top, #0f63b5, #0d396f)'
                        }}>
                            <span style={{ fontSize: 14, color: '#ccc' }}>Next</span>
                        </div>
                        */}

                        <div className='button'
                            style={{
                                display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                            }}
                            onClick={(event) => {
                                var { file, rootPath, path ,fileHaff } = this.props;
                                debugger
                                var filePath = null
                                var haff=fileHaff
                                if (file.type == 'folder')//文件夹
                                {
                                    filePath = Path.resolve(path, this.state.filename)
                                    
                                } else {
                                }
                                debugger
                                this.props.dispatch(fetchPageTemplate('ToolbarPanel', this.state.filename)).then((json) => {
                                    if (json.re == 1) {
                                        var codeTemplate = json.data
                                        if (filePath.indexOf('.js') != -1) { }
                                        else {
                                            filePath += '.js'
                                        }
                                        this.props.dispatch(createFile(filePath, codeTemplate)).then((json) => {
                                            
                                            //更新创建文件所属的文件夹的文件树
                                            this.props.dispatch(fetchSubPath({ absolutePath: path, haff: this.props.selected })).then((json) => {
                                                
                                                debugger
                                                if(json.re==1)//文件创建成功
                                                {
                                                    var filename=this.state.filename.concat('.js')
                                                    var {files}=json.data
                                                    var j=-1
                                                    files.map((fileItem,k)=>{
                                                        if(fileItem.filename==filename)
                                                            j=k
                                                    })
                                                    if(file.type=='folder')//文件夹
                                                    {
                                                        haff=haff.concat('children').concat(j)
                                                    }else{
                                                        haff.splice(0,haff.length-1).concat(j)
                                                    }
                                                    this.onFileClick(haff)

                                                }
                                                
                                                
                                            })

                                        })
                                    }
                                })
                                this.props.dispatch(makeRodalUnVisible())
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span style={{ fontSize: 14, color: '#ccc' }}>Finish</span>
                        </div>

                    </div>


                </div>


            </Rodal>
        )

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
        files:state.directory.files,
        rootPath: rootPath,
        selected: state.directory.selected,
        path: path,
        fileHaff:filePath,
        tabs: state.tab.tabs
    }

    props.rodal = state.rodal

    return props
}

export default connect(mapStateToProps)(RodalWrapper)