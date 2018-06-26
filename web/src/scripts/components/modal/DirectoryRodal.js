import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
const Path = require('electron').remote.require('path')
const { dialog } = require('electron').remote
import 'rodal/lib/rodal.css';
import Rodal from 'rodal';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Panel from './Panel';
import ToolbarPanel from './ToolbarPanel';
import {
    makeDirectoryRodalUnVisible,
    createDirectory
} from '../../actions/rodalActions';
import {
    fetchPageTemplate,
} from '../../actions/libraryActions';
import {
    fetchSubPath
} from '../../actions/fileActions'



class DirectoryRodal extends Component {

    constructor(props) {
        super(props);

        this.textarea = {}
        this.state = {
            clicked: -1,
            directoryName: '',

        }
    }

    render() {

        var arr = []
        var { clicked, directoryName } = this.state
        var {rootPath , selected} = this.props


        var height = 100
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
                                this.props.dispatch(makeDirectoryRodalUnVisible())
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
                            new directory
                        </span>
                    </div>
                    <div style={{ display: 'flex', flex: '0 1 auto', width: 130 }}></div>

                </div>




                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto',
                }}>

                    {/*directory name*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 30, padding: 4, paddingLeft: 40,
                        paddingRight: 10, justifyContent: 'flex-start', alignItems: 'center', marginBottom: 1
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <span style={{ color: '#aaa', fontSize: 11 }}>directory Name</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <input value={this.state.directoryName}
                                onChange={(event) => {
                                    this.setState({ directoryName: event.target.value })
                                }}
                                style={{
                                    background: '#666', outline: 'none', border: 'none', padding: 3, color: '#fff', fontSize: 13,
                                    width: 290, marginLeft: 12, borderRadius: 2
                                }} />
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
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 32, padding: 10, justifyContent: 'flex-end',
                        alignItems: 'flex-end'
                    }}>


                        <div className='button'
                            style={{
                                display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                            }}
                            onClick={(event) => {

                                //查看当前选中的文件结点
                                var {path,file}=this.props
                                var directoryPath=Path.resolve(path,directoryName)
                                

                                this.props.dispatch(createDirectory(directoryPath)).then((json) => {
                                    if(json.re==1)//创建成功
                                    {
                                        
                                        this.props.dispatch(fetchSubPath({ absolutePath: path, haff: selected })).then((json) => {
                                        })   
                                    }else{
                                        //创建失败
                                        alert('文件夹创建失败')
                                    }
                                })
                                this.props.dispatch(makeDirectoryRodalUnVisible())
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span style={{ fontSize: 14, color: '#ccc' }}>
                                Create
                            </span>
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
        rootPath: rootPath,
        selected: state.directory.selected,
        path: path
    }

    props.rodal = state.rodal
    props.visible = state.rodal.visible.directory
    return props
}

export default connect(mapStateToProps)(DirectoryRodal)