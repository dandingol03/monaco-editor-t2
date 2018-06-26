import React from 'react';
import { connect } from 'react-redux'
import {
    updateCurrentCodeEditorInstance,
    updateMonacoDecorations
} from '../actions/editorActions';
import ArrayUtils from '../utils/ArrayUtils';

var fs = require('fs');

/**
 * make this to a fool component
 */

class CodeEditor extends React.Component {
    constructor(props) {
        super();

        this.state = {
            ranges: props.ranges
        }
    }

    componentWillReceiveProps(nextProps) {

        if(nextProps.consoleVisible!=this.props.consoleVisible)//控制台切换
        {
            if (nextProps.editors) {

                var editor = null
                var width = null
                var height = null
                
                nextProps.editors.map((item, i) => {
                    if (item.active) {
                        var layoutInfo = item.editor.getLayoutInfo()
                        width = layoutInfo.width
                        if(nextProps.consoleVisible)//控制台可见
                            height = document.body.clientHeight-35-140-30
                        else
                            height=document.body.clientHeight-35-30
                    }
                    if (item.path == nextProps.path)
                        editor = item.editor
                })
                editor.layout({ width: width, height: height })
            }
        }

        if (nextProps.display != this.props.display && this.props.display != true)//将要刷出的tab
        {

            if (nextProps.editors) {

                var editor = null
                var width = null
                var height = null
                nextProps.editors.map((item, i) => {
                    if (item.active) {
                        var layoutInfo = item.editor.getLayoutInfo()
                        width = layoutInfo.width
                        height = layoutInfo.height
                    }
                    if (item.path == nextProps.path)
                        editor = item.editor
                })
                editor.layout({ width: width, height: height })
            }

        } else {
            if (nextProps.editors &&this.props.ranges&&nextProps.ranges&&ArrayUtils.differentInRanges(nextProps.ranges,this.props.ranges)==true) {

                var editor = null
                nextProps.editors.map((item, i) => {
                    if (item.active) {
                        var layoutInfo = item.editor.getLayoutInfo()
                        width = layoutInfo.width
                        height = layoutInfo.height
                    }
                    if (item.path == nextProps.path)
                        editor = item.editor
                });
                //对editor更新ranges
                if (editor) {
                    var olds = editor.getModel().getAllDecorations()
                    var ranges = nextProps.ranges;
                    var rangesMap = [];
                    if (ranges && ranges.length > 0) {
                        var decorateArr = [];
                        var validRanges = []
                        ranges.map((item, i) => {
                            var range = item.range;
                            //TODO:如下检测，在出现style={styles.container}时将会遗漏,应对引用段的文本进行区别，若为单行仍然生成range
                            if (range) {
                                decorateArr.push({ range: new monaco.Range(range.start.line, range.start.column+1, range.end.line, range.end.column ), options: { inlineClassName: 'monaco-marker' } })
                                validRanges.push({ range, key: item.key })
                            }

                        });
                        editor.deltaDecorations(olds,[])
                        var decorations = editor.deltaDecorations([], decorateArr);
                        decorations.map((decorate, j) => {
                            rangesMap.push({ decorationId: decorate, key: validRanges[j].key })
                        });
                        debugger
                        this.props.dispatch(updateMonacoDecorations(rangesMap))
                    }
                }


            }
        }
    }

    componentDidMount() {



        const containerElement = this.refs.container;
        var editor;
        var props = this.props;
        console.log('editor init=>' + new Date().getMilliseconds())


        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES6,
            allowNonTsExtensions: true
        });

        // var file = fs.readFileSync(this.props.tab.path, { encoding: 'utf8' });

        var jsCode = 'import React  from "react"\n' +
            'class App extends React.component{\n' +

            '  render(){\n' +
            '    var item=<TextView size={30}>some thing</TextView>\n' +
            '    return <div>dwdw</div>\n' +
            '  }\n' +

            '}';

        var jsonCode = '{\n' +
            'name:\'danding\'\n' +
            '}';

        //firstly we want to know whether the editor exists or not
        if (props.editor) {
            var decorations = props.editor.getModel().getAllDecorations();

            editor = monaco.editor.create(containerElement, {
                model: props.editor.getModel(),
                theme: "vs-dark",
            });

            editor.deltaDecorations([], decorations);
            this.props.afterInit(editor);
            if (this.props.display == true)
                this.props.dispatch(updateCurrentCodeEditorInstance(editor))

        } else {



            var uri = null
            var model = null
            if (window.uri == undefined || window.uri == null)
                window.uri = {}
            if (window.uri[this.props.path]) {
                uri = window.uri[this.props.path]
                model = monaco.editor.getModel(uri)
            }
            else {
                //uri=new monaco.Uri.file("./Containre.jsx")
                uri = new monaco.Uri.file(this.props.path)
                var reg = /.*\.(.*)?$/
                var suffix = reg.exec(this.props.path)[1]
                switch (suffix) {
                    case 'json':
                        model = monaco.editor.createModel(this.props.content, 'json', this.props.path)
                        break;
                    case 'js': case 'jsx':
                        model = monaco.editor.createModel(this.props.content, "javascript", this.props.path);
                        break;
                }

            }
            window.uri[this.props.path] = uri
            editor = monaco.editor.create(containerElement, {
                model: model,
                theme: "vs-dark",
            });


            // editor = monaco.editor.create(containerElement, {
            //     value:jsCode,
            //     language: 'javascript',
            //     theme: "vs",
            // });

            this.props.afterInit(editor, uri, this.props.path);

            console.log('editor done=>' + new Date().getMilliseconds())
            if (this.props.display == true) {
                this.props.dispatch(updateCurrentCodeEditorInstance(editor))
                //var middleware = MonacoMiddleware(this.props.dispatch, editor)
                //TODO:append the decorations
                if (this.props.doc) {

                    var ranges = this.props.ranges;
                    var rangesMap = [];
                    
                    if (ranges && ranges.length > 0) {
                        var decorateArr = [];
                        var validRanges = []
                        ranges.map((item, i) => {
                            var range = item.range;
                            //TODO:如下检测，在出现style={styles.container}时将会遗漏,应对引用段的文本进行区别，若为单行仍然生成range
                            if (range) {
                                decorateArr.push({ range: new monaco.Range(range.start.line, range.start.column+1 , range.end.line, range.end.column ), options: { inlineClassName: 'monaco-marker' } })
                                validRanges.push({ range, key: item.key })
                            }

                        });
                      
                        var olds = editor.getModel().getAllDecorations()
                        var decorations = editor.deltaDecorations(olds, decorateArr);
                        decorations.map((decorate, j) => {

                            rangesMap.push({ decorationId: decorate, key: validRanges[j].key })
                        });
                        this.props.dispatch(updateMonacoDecorations(rangesMap))
                    }
                    //TODO:dispatch to save decorations
                }

            }

        }


        //this.props.addEditorInstance(editor, id);

        // window.addEventListener('resize', () => {
        //     if (id === this.props.activeTab) {
        //         let editorNode = document.getElementById(id);
        //         let parent = editorNode.parentElement;
        //         editorNode.style.width = parent.clientWidth;
        //         editorNode.firstElementChild.style.width = parent.clientWidth;
        //         editorNode.firstElementChild.firstElementChild.style.width = parent.clientWidth;
        //         editorNode.getElementsByClassName('monaco-scrollable-element')[0].style.width = parent.clientWidth - 46;
        //     }
        // })

    }

    render() {
        return (
            <div className="editor-container" ref="container"
                style={styles.container}
            ></div>
        );
    }


    componentWillUnmount() {
        //TODO:dispose the editor
    }
}

const styles = {
    container: {
        flex: '1 1 auto',
        display: 'flex',
        height: '550px'
    }
}

const mapStateToProps = (state, ownProps) => {


    const props = {};
    if (state.monaco.editors) {
        props.editors = state.monaco.editors
        if (ownProps.path) {
            props.editors.map((item, i) => {
                if (item.path == ownProps.path)
                    props.editor = item.editor
            })
        }
    }
    if (state.monaco.docCache) {
        var buf = new Buffer(ownProps.path);
        var id = buf.toString('hex');
        if (state.monaco.docCache[id]) {
            props.doc = state.monaco.docCache[id]
            props.decorationsMap=props.doc.decorationsMap
            props.ranges = props.doc.ranges;
        }
    }
    if (state.monaco.uri)
        props.uri = state.monaco.uri
    
    props.consoleVisible=state.consoleUtils.visible

    return props
}
export default connect(mapStateToProps)(CodeEditor)



