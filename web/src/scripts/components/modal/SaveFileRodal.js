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
    makeSaveFileUnVisible,
    createDirectory
} from '../../actions/rodalActions';
import {
    fetchPageTemplate,
} from '../../actions/libraryActions';
import {
    fetchSubPath,
    saveFile
} from '../../actions/fileActions'
import {
    makeTabUnChanged
} from '../../actions/tabActions'
import {
    fetchFileComponentInfo,
    _cacheDoc
} from '../../actions/editorActions'



class SaveFileRodal extends Component {

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
        var width = 400


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
                                this.props.dispatch(makeSaveFileUnVisible())
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
                            save file
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
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 35, padding: 4, paddingLeft: 30,
                        paddingRight: 10, justifyContent: 'flex-start', alignItems: 'center', marginBottom: 1
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <span style={{ color: '#ddd', fontSize: 13 }}>
                            您需要保存完文件才能进入design模式，是否现在进行保存
                            </span>
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
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', padding: 10, justifyContent: 'center',
                        alignItems: 'flex-end'
                    }}>


                        <div className='button'
                            style={{
                                display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                            }}
                            onClick={(event) => {

                                var buf = new Buffer(props.docId, 'hex')
                                var filePath = buf.toString()
                                var editor=props.editor
                                if(editor)
                                {
                                    props.dispatch(saveFile(filePath, editor.getValue())).then((json)=>{
                                        props.dispatch(makeTabUnChanged({ path: filePath }))
                                    
                                        return props.dispatch(fetchFileComponentInfo(filePath));
                                    }).then((json)=>{
                                        var res=json.data
                                        
                                        var  { ranges, body, imports, dictionary,classMethods } = res.syntaxTree;
                                        
                                        props.dispatch(_cacheDoc(
                                            {
                                                id: props.docId,
                                                utf8Data: editor.getValue()
                                            },
                                            ranges, imports, body, dictionary , classMethods))
                                            debugger
                                    })
    
                                }
                                
                                this.props.dispatch(makeSaveFileUnVisible())
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span style={{ fontSize: 14, color: '#ccc' }}>
                            &nbsp;&nbsp; OK&nbsp;&nbsp;&nbsp;
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

    if (state.monaco.openDocId && state.monaco.docCache) {
        var doc = state.monaco.docCache[state.monaco.openDocId];
        props.docId = state.monaco.openDocId
    }

    props.rodal = state.rodal
    props.visible = state.rodal.visible.saveFile
    props.editor=state.monaco._IStandaloneCodeEditor
    return props
}

export default connect(mapStateToProps)(SaveFileRodal)