import React, { Component, } from 'react'
import { connect } from 'react-redux'
const { ipcRenderer } = require('electron')
import Config from '../../../../config';
import CodeEditorDropTarget from '../components/CodeEditorDropTarget';
import DragAndDropMiddleware from '../middleware/editor/DragAndDropMiddleware';
import NewFile from '../components/modal/NewFile';
import DesignSwitch from '../components/switch/DesignSwitch';
import Functions from './Functions';
import GitLoader from './GitLoader';
import _ from 'lodash';

import Rodal from '../components/modal/Rodal';
import FieldsRodal from '../components/modal/FieldsRodal';
import ListViewTemplateRodal from '../components/modal/ListViewTemplateRodal';
import RenderRowRodal from '../components/modal/RenderRowRodal';
import NPMPackagesRodal from '../components/modal/NPMPackagesRodal'
import ProjectConfigRodal from '../components/modal/ProjectConfigRodal'
import DirectoryRodal from '../components/modal/DirectoryRodal'
import ComponentsInstallRodal from '../components/modal/ComponentsInstallRodal'
import SaveFileRodal from '../components/modal/SaveFileRodal'
import LibraryWarningRodal from '../components/modal/LibraryWarningRodal'
import GithubReposRodal from '../components/modal/GithubReposRodal'

var Spinner = require('react-spinkit');
import MonacoMiddleware from '../middleware/monaco/MonacoMiddleware';
import FontAwesome from '../../fonts/FontAwesome/FontAwesome'

import {
    RIGHT_SIDEBAR_CONTENT,
    LAYOUT_FIELDS,
    LAYOUT_KEY
} from '../constants/LayoutConstants'

import {
    updateMonacoDecorations,
} from '../actions/editorActions';

import {
    fetchSubPath,
    setProjPath,
} from '../actions/fileActions'

import {
    makeRodalUnVisible,
    makeNPMPackagesVisible,
    makeProjectConfigVisible,
    makeComponentsInstallVisible,
    makeGithubReposVisible
} from '../actions/rodalActions';

import {
    fetchGitStatus,
    syncGitStatus,
    fetchGitDiffInStaged
} from '../actions/gitActions'
import {
    fetchAllLibraryTpls,
    cacheAllLibraryTpl
} from '../actions/libraryActions';
import {
    getMonacoEditorPackages,
    onGetNPMSeachMessage,
    makeNPMSeachBegin,
    intergrateRedux,
    searhRepo,
    cacheRepos
} from '../actions/npmActions'


import WorkspaceToolbar from './WorkspaceToolbar';
import FileBrowser from '../components/file/FileBrowser';
import Gallery from '../components/library/Gallery';
import Palette from '../components/monitor/Palette';
import UiInstance from '../components/monitor/UiInstance';
import Android from '../components/monitor/Android';
import Panel from '../components/monitor/Panel';
import Inflater from '../components/inflater/Inflater';
import Grid from './Grid';
import TabContainer from './TabContainer';
import TabbedEditor from './TabbedEditor';
import Console from './Console';

class Workspace extends Component {



    onFileDataChange = (monacoDoc) => {
        var editor = this.props._IStandaloneCodeEditor;
        if (editor) {
            var cache = this.props.docCache;
            var ranges = null;
            editor.executeEdits('danding', [{ identifier: 'delete', range: new monaco.Range(1, 1, 10000, 1), text: '', forceMoveMarkers: true }]);
            editor.executeEdits('xx', [{ identifier: 'insert', range: new monaco.Range(1, 1, 1, 1), text: monacoDoc.utf8Data, forceMoveMarkers: true }]);
            debugger
            if (cache && cache[monacoDoc.id]) {
                ranges = cache[monacoDoc.id].ranges;
                var rangesMap = [];
                if (ranges && ranges.length > 0) {
                    var decorateArr = [];
                    ranges.map((item, i) => {
                        var range = item.range;
                        decorateArr.push({ range: new monaco.Range(range.start.line, range.start.column + 1, range.end.line, range.end.column + 1), options: { inlineClassName: 'monaco-marker' } })
                    });
                }
                var decorations = editor.deltaDecorations([], decorateArr);
                decorations.map((decorate, j) => {
                    rangesMap.push({ decorationId: decorate, key: ranges[j].key })
                });
                this.props.dispatch(updateMonacoDecorations(rangesMap))
                //TODO:dispatch to save decorations
            }
            //TODO:make a line change
            // var line1=editor.getModel().getLineContent(1);
            // var line6=editor.getModel().getLineContent(6);
            // TODO:make a switch
            // editor.executeEdits('danding', [{ identifier: 'delete' , range: new monaco.Range(6, 1, 6, 1000), text:line1, forceMoveMarkers: true }]);
            // editor.executeEdits('danding', [{ identifier: 'delete' , range: new monaco.Range(1, 1, 1, 1000), text:line6, forceMoveMarkers: true }]);

            editor.pushUndoStop();

        }
    }

    makeDataFromTemplate(templateText, indent) {
        var spacing = '';
        for (var i = 1; i <= indent; i++)
            spacing += ' ';

        var paras = templateText.split('\n');
        var newTemplate = '';
        paras.map((line, i) => {
            if (i == 0) {
                if (line == '')
                    newTemplate += line + '\n'
                else {
                    newTemplate += spacing + '\n';
                    newTemplate += spacing + line + '\n'
                }
            }
            else if (i != (paras.length - 1))
                newTemplate += (spacing + line + '\n')
            else
                newTemplate += (spacing + line)
        })

        return newTemplate
    }

    calculateIndent(text) {
        var reg = /^([\s]*)/;
        var indent = 4;
        if (reg.exec(text)) {
            indent = reg.exec(text)[1].length + 4;
        }
        return indent;
    }



    //import component callback
    onImportItem(item) {

        var templateText = item.item;

        var { _IStandaloneCodeEditor } = this.props;
        var position = _IStandaloneCodeEditor.getPosition();


        //TODO:换行行为缩进探索
        var isModel = _IStandaloneCodeEditor.getModel();
        var lineContent = isModel.getLineContent(position.lineNumber);
        var indent = this.calculateIndent(lineContent);

        var textScaffold = this.makeDataFromTemplate(templateText, indent);
        _IStandaloneCodeEditor.executeEdits('danding', [{
            identifier: 'delete',
            range: { startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column },
            text: textScaffold,
            forceMoveMarkers: true
        }]);

    }

    closeRodal() {

    }

    constructor(props) {
        super(props);

        this.state = {
            design: false,
        }
    }



    render() {


        const {
            toolbarHeight,
            toolbarStyle,
            containerStyle,
            leftPaneStyle,
            rightPaneStyle,
            centerPaneStyle,
            leftPaneBottomSectionStyle,
            leftPaneBottomSectionContainerStyle,
            projectNavigatorStyle,
        } = getStyles(this.props)


        var props = this.props;
        var state = this.state;

        var { func } = props

        return (

            <div className='vbox full-size-relative' style={{ overflow: 'hidden', position: 'relative' }}>

                {/*<NewFile/>*/}





                {/*左侧 file browser*/}
                <div style={Object.assign(styles.container, styles.row)}>
                    <div style={{ display: 'flex', flex: '0 0 auto', width: 55, flexDirection: 'column', background: '#333' }}>
                        <Functions />
                    </div>



                    <div style={{
                        flex: '0 0 auto', width: '230px', flexDirection: 'column', display: 'flex',
                        background: '#333', paddingTop: 0
                    }}>

                        <FileBrowser display={func == 'project'} />
                        {
                            func == 'plugin' ?
                                <Gallery /> :
                                func == 'search' ?
                                    null : null
                        }


                        <GitLoader />

                    </div>



                    {/*<!-- 中部部分,尝试用display:none -->*/}
                    <div style={{ flex: 7, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#333' }}>

                        {/*tabbar 部分*/}
                        {
                            props.design == true ?
                                null :
                                props.tabs && props.tabs.length > 0 ? <TabContainer /> :
                                    null
                        }


                        {
                            props.design == true ?
                                <Grid>
                                    <div style={{
                                        display: 'flex', flex: '0 1 auto',
                                        width: '150px',
                                        flexDirection: 'column',
                                        fontFamily: 'sans-serif'
                                    }}>
                                        <Palette />
                                        <UiInstance />
                                    </div>
                                    <Inflater
                                        monacoMiddleware={MonacoMiddleware(this.props.dispatch, this.props._IStandaloneCodeEditor)} />

                                    <Panel
                                        middleware={{ monaco: MonacoMiddleware(this.props.dispatch, this.props._IStandaloneCodeEditor) }} />
                                    {/*<Android/>*/}
                                </Grid> :
                                null
                        }

                        <TabbedEditor onImportItem={this.onImportItem.bind(this)}>
                        </TabbedEditor>





                        <DesignSwitch design={this.props.design} />
                        <Console />

                        {/* <div style={{width:'100%',height:'100%',display:'flex',position:'absolute',top:0,left:0,zIndex:1000
                                ,justifyContent:'center',alignItems:'center',backgroundColor:'rgb(17, 90, 90)'}}>
                            <Spinner spinnerName='folding-cube'  className='spiner'/>
                        </div>*/}

                    </div>



                </div>


                <Rodal />
                <FieldsRodal />
                <ListViewTemplateRodal />
                <RenderRowRodal   
                    editor={this.props.editor}
                    middleware={{ monaco: MonacoMiddleware(this.props.dispatch, this.props.editor) }}
                    />
                <NPMPackagesRodal />
                <ProjectConfigRodal />
                <DirectoryRodal />
                <ComponentsInstallRodal />
                <SaveFileRodal />
                <LibraryWarningRodal/>
                <GithubReposRodal/>
            </div>

        )
    }

    componentDidMount() {
        setTimeout(() => {


            //设定工程根路径
            this.props.dispatch(setProjPath(Config.proj))

            var date = null


            // this.props.dispatch(fetchAllLibraryTpls()).then((json) => {
            //     date=new Date()
            //     console.log(date.getSeconds()+ date.getMilliseconds()/1000)
            //     if (json.re == 1) {

            //         var tpls = json.data
            //         //更新该组件的编译模板
            //         this.props.dispatch(cacheAllLibraryTpl(tpls))

            //     }


            //获取该结点下的文件系统内容,耗时89ms
            this.props.dispatch(fetchSubPath({
                absolutePath: Config.proj,
                haff: null
            })).then((json) => {

                //TODO:获取目标工程的git status信息
                var cwd = this.props.rootPath
                return this.props.dispatch(fetchGitStatus(cwd))

            }).then((json) => {

                if (json.re == 1) {

                    var { modified, not_added } = json.data
                    this.props.dispatch(fetchGitDiffInStaged(this.props.rootPath)).then((json) => {
                        var staged = json.data.files

                        //modified标记为蓝色,not_added标记为红
                        this.props.dispatch(syncGitStatus(modified, not_added, staged))
                        //已改动的文件加入index却没加入版本库的为绿色
                    })
                }
                var worker = new Worker("../web/src/scripts/worker/fetchAllLibraryTpls.js");
                worker.addEventListener("message", (evt) => {

                    var response = evt.data
                    if (response.re == 1) {

                        var tpls = response.data
                        //更新该组件的编译模板
                        this.props.dispatch(cacheAllLibraryTpl(tpls))
                        // new Notification('info',
                        //     {
                        //         body: '组件编译模板下载完成',
                        //         silent:true
                        //     })
                    } else {
                        console.error('can not get tpls')
                    }

                    worker.terminate()
                }, false);
                worker.postMessage(10000)
            })
        }, 200);

    }

    componentWillMount() {

        ipcRenderer.on('search', (evt, message) => {
            this.props.dispatch(onGetNPMSeachMessage(message))
        })

        ipcRenderer.on('config', (evt, message) => {
            switch (message) {
                case 'packages':
                    this.props.dispatch(makeNPMPackagesVisible())
                    break
                case 'project':
                    this.props.dispatch(makeProjectConfigVisible())
                    break;
                case 'redux':
                    this.props.dispatch(intergrateRedux(this.props.rootPath))
                    break
                case 'components'://组件安装
                    this.props.dispatch(makeComponentsInstallVisible())
                    break
                case 'tpl in repo':
                    this.props.dispatch(makeGithubReposVisible())
                    break;
            }
        })

        setTimeout(() => {
            //搜索可用库
            this.props.dispatch(makeNPMSeachBegin())//清除已搜索到的库
            //todo 取消npm搜索
            //this.props.dispatch(getMonacoEditorPackages())//执行npm搜索
            //search repos in github 
            this.props.dispatch(searhRepo('dandingol03')).then((json)=>{
                if(json.data&&json.data.length>0)
                    this.props.dispatch(cacheRepos(json.data))
            }).catch((e)=>{
                console.error(e)
            })

        }, 400)
    }
}



function getStyles(props) {
    const {
        leftSidebarBottomSectionHeight,
    } = props
    const toolbarHeight = 71
    const fixedHeightStyle = {
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
    }
    return {
        toolbarHeight: toolbarHeight,
        containerStyle: {
            height: `calc(100% - ${toolbarHeight}px)`,
            overflow: 'hidden',
        },
        leftPaneStyle: _.extend({
            background: 'rgb(252,251,252)',
        }, fixedHeightStyle),
        centerPaneStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            overflow: 'hidden',
        },
        fixedHeightStyle: fixedHeightStyle,
        rightPaneStyle: _.extend({
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'rgb(252,251,252)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
        }, fixedHeightStyle),
        leftPaneBottomSectionStyle: {
            position: 'absolute',
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%',
            height: '100%',
        },
        leftPaneBottomSectionContainerStyle: {
            borderTop: '1px solid rgb(224,224,224)',
            position: 'absolute',
            bottom: 0,
            height: leftSidebarBottomSectionHeight,
            width: '100%',
        },
        projectNavigatorStyle: {
            position: 'absolute',
            top: 0,
            height: `calc(100% - ${leftSidebarBottomSectionHeight}px)`,
            display: 'flex',
            flexDirection: 'column',
        },
    }
}


const styles = {
    container: {
        flex: 1,
        display: 'flex'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
    }
}





const mapStateToProps = (state, ownProps) => {


    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache

    const props = {
        docCache: state.monaco.docCache,
        _IStandaloneCodeEditor: state.monaco._IStandaloneCodeEditor,
        projectNavigatorVisible: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE],
        rightSidebarContent: state.ui[LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT],
        rightSidebarWidth: state.ui[LAYOUT_FIELDS.RIGHT_SIDEBAR_WIDTH],
        leftSidebarWidth: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_WIDTH],
        leftSidebarBottomSectionHeight: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_BOTTOM_SECTION_HEIGHT],
    }

    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.monacoDoc=doc
        }
        props.editor=state.monaco._IStandaloneCodeEditor
    }


    props.centerPaneWidth = window.innerWidth -
        (props.rightSidebarContent !== RIGHT_SIDEBAR_CONTENT.NONE ? props.rightSidebarWidth : 0) -
        (props.projectNavigatorVisible ? props.leftSidebarWidth : 0)


    if (state.designMode.status == 'code')
        props.design = false;
    else
        props.design = true;

    props.func = state.functions.function
    props.rodal = state.rodal
    props.rootPath = state.directory.rootPath
    props.files = state.directory.files
    props.tabs = state.tab.tabs
    return props
}



export default connect(mapStateToProps)(Workspace)
