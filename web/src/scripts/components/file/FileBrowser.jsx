import _ from 'lodash';
import React, { Component, PropTypes, } from 'react'
const { remote } = require('electron')
const { Menu, MenuItem, nativeImage } = remote
const Path = require('electron').remote.require('path')
import Folder from './Folder';
import File from './File';
import { connect } from 'react-redux'
var Spinner = require('react-spinkit')

import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'

import {
    expandDir,
    foldDir,
    activateFile,
    fetchSubPath,
    deleteFile,
    deleteFolder
} from '../../actions/fileActions';

import {
    openDocument
} from '../../actions/editorActions';

import {
    addTab,
    closeTab
} from '../../actions/tabActions';
import {
    addToGitIndex,
    commitToLocalRepo,
    pushToRemote
} from '../../actions/gitActions'

class FileBrowser extends Component {

    constructor(props) {
        super(props)

    }

    onFolderClick(haff) {

        //默认情况下collapsed皆为false,即是展开
        this.props.dispatch(foldDir(haff))
    }

    //选中文件夹
    onFolderSelected(haff) {
        this.props.dispatch(activateFile(haff))
    }

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

    traverse(root, parent, parentPath) {
        var arr = [];

        root.map((node, i) => {

            var modified = false
            var filePath = Path.join(parentPath, node.filename)
            if (this.props.modified && this.props.modified.length > 0) {
                this.props.modified.map((modifiedPath, j) => {
                    if (modifiedPath == filePath)
                        modified = true
                })
            }

            var not_added = false
            if (this.props.not_added && this.props.not_added.length > 0) {
                this.props.not_added.map((path, j) => {
                    if (path == filePath) {
                        not_added = true
                    }
                })
            }

            var staged = false
            if (this.props.staged && this.props.staged.length > 0) {
                this.props.staged.map((info, j) => {

                    if (info.file == filePath)
                        staged = true
                })
            }

            if (node.type == 'folder')//文件夹
            {


                arr.push(
                    <Folder key={i} filename={node.filename} collapsed={node.collapsed} activate={node.activate} modified={modified}
                        onClick={(direction) => {
                            if (direction == 'down')//此时文件夹已展开
                            {
                                this.onFolderClick(parent.concat(i))
                            } else {
                                //此时该文件夹结点并未展开
                                var node = this.props.files
                                var curPath=this.props.rootPath
                                parent.concat(i).map((pa, i) => {
                                    node = node[pa]
                                    if(typeof pa=='number')//如果为表示小标的路径标识
                                        curPath=Path.resolve(curPath,node.filename)
                                })
                                
                                if (node.cached == true)//该结点的文件系统信息已被缓存
                                {
                                    this.onFolderClick(parent.concat(i))
                                } else {
                                    if (parent.length == 0)//位于根路径
                                    {
                                        var path = Path.resolve(this.props.rootPath, node.filename)
                                        this.props.dispatch(fetchSubPath({ absolutePath: path, haff: parent.concat(i) })).then((json) => {
                                            this.onFolderClick(parent.concat(i))
                                        })
                                    } else {
                                        //非根路径的文件夹结点点击
                                        this.props.dispatch(fetchSubPath({ absolutePath: curPath, haff: parent.concat(i) })).then((json) => {
                                            this.onFolderClick(parent.concat(i))
                                        })
                                    }

                                }

                            }

                        }}

                        onSelected={() => {
                            this.onFolderSelected(parent.concat(i))
                        }}

                        onDelete={()=>{
                            //删除文件夹
                            var {path,selectedDirectory}=this.props
                            this.props.dispatch(deleteFolder(path)).then((json) => {
                                var prefixReg=/(.*)\/.*?$/
                                var updatedHaff=_.cloneDeep(selectedDirectory)
                                if(selectedDirectory.length>=3)//非一级目录
                                    updatedHaff.splice(updatedHaff.length-2,2)
                                else if(selectedDirectory.length==1)//一级目录
                                    updatedHaff=[]
                                var parentPath=prefixReg.exec(path)[1]
                                debugger
                                this.props.dispatch(fetchSubPath({ absolutePath: parentPath, haff:updatedHaff })).then((json) => {
                                })  
                            })
                        }}
                    >
                        {
                            node.children != null && node.children.length > 0 ?
                                <ul style={{ padding: 0, paddingLeft: 18 }}>
                                    {this.traverse(node.children, parent.concat(i).concat('children'), filePath)}
                                </ul> : null
                        }
                    </Folder>
                );
            } else {
                //文件
                arr.push(
                    <File key={i} filename={node.filename} activate={node.activate} modified={modified} not_added={not_added}
                        staged={staged}
                        onClick={() => {
                            this.onFileClick(parent.concat(i))
                        }}
                        onGitAdd={() => {
                            this.props.dispatch(addToGitIndex(filePath))
                        }}
                        onGitCommit={() => {
                            this.props.dispatch(commitToLocalRepo())
                        }}
                        onGitPush={() => {
                            this.props.dispatch(pushToRemote())
                        }}
                        onDelete={()=>{
                            var {path,selectedDirectory}=this.props
                            this.props.dispatch(deleteFolder(path)).then((json) => {
                                
                                var prefixReg=/(.*)\/.*?$/
                                var parentPath=prefixReg.exec(path)[1]
                                var updatedHaff=_.cloneDeep(selectedDirectory)
                                if(selectedDirectory.length>=3)//非一级目录
                                    updatedHaff.splice(updatedHaff.length-2,2)
                                else if(selectedDirectory.length==1)//一级目录
                                    updatedHaff=[]
                                
                                //再次获取父路径的信息
                                this.props.dispatch(fetchSubPath({ absolutePath: parentPath, haff:updatedHaff })).then((json) => {
                                })  
                                //关闭对应文件的tab
                                this.props.dispatch(closeTab(path))
                            })
                        }}
                    />
                )
            }
        });

        return arr;
    }

    render() {

        var state = this.state;
        var props = this.props;

        var { files, rootPath, display } = props
        var reg = /^.*\/(.*)?$/
        var filename = null
        if (reg.exec(rootPath) && reg.exec(rootPath)[1])
            filename = reg.exec(rootPath)[1]

        var defaultStyle = {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column'
        }
        if (display == true)
        { }
        else {
            defaultStyle.display = 'none'
        }



        return (

            <div style={defaultStyle}>

                <div style={{
                    display: 'flex', flex: '0 0 auto', height: '35px', flexDirection: 'row',
                    alignItems: 'center', justifyContent: 'flex-start', background: '#333',paddingLeft:20,
                }}>
                    <span style={{color:'#ddd',fontSize:11,fontFamily:'sans-serif'}}>资源管理器</span>
                </div>

                <div style={{
                    display: 'flex', flex: '0 0 auto', height: '20px', flexDirection: 'row',borderTopLeftRadius:2,borderTopRightRadius:2,
                    alignItems: 'center', justifyContent: 'center', background: '#666'
                }}>
                    <FontAwesome name='caret-down'color="#eee" size={20}/>
                    <span style={{ color: '#ddd', fontFamily: 'sans-serif', fontSize: '12px',marginLeft:5 }}>{filename}</span>
                </div>
                <ul className="File-Browser" ref="file-browser">
                    {
                        this.traverse(files, [], '')
                    }
                </ul>
            </div>

        )
    }


}

const styles = {
    container: {
        flex: '1 1 auto',
        display: 'flex',
        height: '500px'
    },
    row: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'row',
        alignItems: 'center'
    }
}

const mapStateToProps = (state, ownProps) => {

    var rootPath = state.directory.rootPath
    var file = null
    var path = rootPath
    var filePath = state.directory.selected
    var _files = state.directory.files
    if (filePath && filePath != '' && filePath.length > 0) {

        file = _files
        filePath.map((pa, i) => {
            file = file[pa]
            if (pa != 'children')
                path = Path.resolve(path, file.filename)
        })
    }

    const props = {
        files: state.directory.files,
        rootPath: state.directory.rootPath,
        tabs: state.tab.tabs,
        modified: state.git.modified,
        not_added: state.git.not_added,
        staged: state.git.staged,
        selectedDirectory:state.directory.selected,
        path: path
    }

    return props
}



export default connect(mapStateToProps)(FileBrowser)
