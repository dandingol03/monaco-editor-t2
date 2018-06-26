import CodeEditor from './CodeEditor';
import React, { Component, } from 'react'
import { connect } from 'react-redux'
const Path = require('electron').remote.require('path')
const fs = require('electron').remote.require('fs')
import {
    updateCodeEditorInstance,
    openDocument,
    searchInProj,
    fetchFileComponentInfo,
    _cacheDoc
} from '../actions/editorActions';
import {
    makeTabChanged,
    makeTabUnChanged
} from '../actions/tabActions'
import {
    saveFile,
    openFile
} from '../actions/fileActions'
import {
    addTab
} from '../actions/tabActions';

class CodeEditorWrapper extends Component {

    onMouseDown(e) {
        var event = e.event;
        var target = e.target;
        if (event.metaKey)//点击mac上的command
        {
            if (this.props.editor && this.props.docCache) {
                var editor = this.props.editor;
                var IWordAtPosition = editor.getModel().getWordAtPosition(target.position);
                var token = IWordAtPosition.word;
                //TODO:决定是否进行文件跳转,首先根据模块名比对
                var loc = {
                    start: { line: target.position.lineNumber, column: IWordAtPosition.startColumn - 1 },
                    end: { line: target.position.lineNumber, column: IWordAtPosition.endColumn - 1 }
                };
                //对比引入的模块名
                if (this.props.docCache.imports && this.props.docCache.imports.length > 0) {
                    var importedModule = null
                    for (let i = 0; i < this.props.docCache.imports.length; i++) {
                        var module = this.props.docCache.imports[i];
                        //为依赖模块点击
                        if (loc.start.line == module.range.start.line && loc.start.column >= module.range.start.column &&
                            loc.end.line == module.range.end.line && loc.end.column <= module.range.end.column) {
                            importedModule = module
                            break;
                        }
                    }
                    //如果点击token与依赖模块匹配
                    if (importedModule) {
                        var { tabs, dispatch, files } = this.props


                        var haff = null
                        files.map((file, i) => {
                            if (file.filename == 'node_modules')
                                haff = [i]
                        })
                        if (haff != null) {
                            var path = Path.resolve(this.props.rootPath, 'node_modules')
                            path = Path.resolve(path, token)
                            //TODO:判断该路径是否有效
                            fs.exists(path, (re) => {
                                if (re == true) {

                                    var packagePath = Path.resolve(path, 'package.json')

                                    fs.exists(packagePath, (re) => {
                                        //存在package.json文件
                                        if (re == true) {
                                            fs.readFile(packagePath, function (err, data) {
                                                if (err) {
                                                    throw err
                                                }
                                                else {
                                                    var json = JSON.parse(data)
                                                    var destinationPath = Path.resolve(path, json.main)
                                                    var buf = new Buffer(destinationPath);
                                                    var id = buf.toString('hex');
                                                    dispatch(openDocument({
                                                        absolutePath: destinationPath,
                                                        id: id
                                                    })).then((payload) => {
                                                        //在这里去设置doc的新内容
                                                        //查看现有tab是否有跟此一样的路径
                                                        var exist = false
                                                        if (tabs && tabs.length > 0) {
                                                            tabs.map((tab, i) => {
                                                                if (tab.path == path) {
                                                                    exist = true
                                                                }
                                                            })
                                                        }
                                                        if (exist == true)//如果已有tab对应,则设置其选中
                                                        {
                                                        } else {
                                                            //新建tab
                                                            var reg = /^.*\/(.*)?$/
                                                            var filename = reg.exec(destinationPath)[1]
                                                            var tab = {
                                                                name: filename,
                                                                path: destinationPath
                                                            }
                                                            dispatch(addTab(tab))

                                                        }

                                                    });
                                                }
                                            });
                                        }
                                    })
                                }
                            })

                        }

                    }







                }
            }

        }
    }

    constructor(props) {
        super();

        this.state = {
            docId: undefined
        }
    }

    render() {


        var props=this.props
        
        

        return (
            <CodeEditor afterInit={(editor, uri, path) => {
                //添加点击事件的监听
                editor.onMouseDown((e) => {
                    this.onMouseDown(e)
                });
                //注册全局搜索快捷键
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_F | monaco.KeyMod.Shift,  ()=> {
                    //TODO:获取当前选中的词汇

                    //进行全文搜索
                    this.props.dispatch(searchInProj('TouchableOpacity')).then((json)=>{
                        debugger
                        console.log()
                    })
                })

                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S ,  ()=> {
                    //TODO:保存文件 => 去除改动标志 => 重新拉取组件属性
                    var buf = new Buffer(props.docId, 'hex')
                    var filePath = buf.toString()
                    
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
                })

                editor.onDidChangeModelDecorations(function (e) {

                    console.log()
                });

                editor.getModel().onDidChangeContent((e) => {
                    //TODO:需要比较与原始内容，然后设置在editor的示例中
                    var content = editor.getValue()
                    var buf = new Buffer(this.props.path);
                    var id = buf.toString('hex');
                    //如果该editor对应的文件已加入缓冲池
                    if (this.props.cache && this.props.cache[id]) {
                        var origin = this.props.cache[id].data
                        if (origin == content) {
                            //TODO:make this tab looks normal
                            this.props.dispatch(makeTabUnChanged({ path: this.props.path }))
                        } else {
                            this.props.dispatch(makeTabChanged({ path: this.props.path }))
                        }
                    }

                })

                this.props.dispatch(updateCodeEditorInstance({ editor: editor, uri: uri, path: path, active: this.props.display }));
            }}
                path={this.props.path}
                display={this.props.display}
                content={this.props.content}
                visible={this.props.visible}
            />
        );
    }
}


const mapStateToProps = (state, ownProps) => {

    const props = {
        editor: state.monaco._IStandaloneCodeEditor,
    }
    if (state.monaco.openDocId && state.monaco.docCache) {
        var doc = state.monaco.docCache[state.monaco.openDocId];
        props.docCache = doc;
        props.docId = state.monaco.openDocId
    }
    props.cache = state.monaco.docCache
    props.rootPath = state.directory.rootPath
    props.files = state.directory.files
    
    return props
}

export default connect(mapStateToProps)(CodeEditorWrapper)

