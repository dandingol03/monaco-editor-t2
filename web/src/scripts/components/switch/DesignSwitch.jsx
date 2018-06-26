import _ from 'lodash'
import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import {
    switchToCode,
    switchToDesign
} from '../../actions/switchActions';
import {
    makeComponentDirtyClean,
    makeComponentStatusClean,
    makeComponentHaffAllClean,
    makeComponentDeletedHaffAllClean,
    _cacheDoc,
    fetchFileComponentInfo
} from '../../actions/editorActions';
import {
    saveFile,
} from '../../actions/fileActions';
import {
    makeTabUnChanged
} from '../../actions/tabActions';
import {
    makeSaveFileVisible
} from '../../actions/rodalActions'
import {
    makeConsoleVisible,
    makeConsoleUnvisible
} from '../../actions/consoleActions'


/**
 * 检查是否为脏文件，是的话马上重新计算decoration
 */


class DesignSwitch extends Component {
    constructor(props) {
        super(props)

        this.state = {
            design: props.design ? props.design : false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.design != this.props.design)
            this.setState({ design: nextProps.design })
    }

    render() {

        var state = this.state;
        var props = this.props;

        var {consoleVisible}=this.props

        return (
            <div className="design-switch" style={Object.assign({ display: 'flex', flexDirection: 'column' }, { height: '30px', borderLeft: '1px solid #222' })}>
                <div style={Object.assign({ display: 'flex' }, { height: '1px', backgroundColor: '#555' })}></div>
                <div style={Object.assign(styles.row, { backgroundColor: '#333',borderBottom:'1.5px solid #111' })}>



                    <div key={1} className={state.design == true ? 'option selected' : 'option'} style={Object.assign({
                        display: 'flex', height: '25px', width: '60px', color: '#fff', marginLeft: '30px',
                        alignItems: 'center', justifyContent: 'center'
                    },
                        state.design == true ? { backgroundColor: '#444' } : { backgroundColor: '#333' })}
                        onClick={() => {
                            if (state.design != true) {
                                if(props.docStatus!='dragged')
                                    props.dispatch(switchToDesign())
                                else{
                                    //todo:提示用户进行文件保存
                                    props.dispatch(makeSaveFileVisible())   
                                }
                            }
                        }}
                    >
                        <span style={{ fontSize: '0.8em' }}>Design</span>
                    </div>

                    <div key={2} className={state.design == true ? 'option' : 'option selected'} style={Object.assign({
                        display: 'flex', height: '25px', width: '60px', color: '#fff', marginLeft: '1px',
                        alignItems: 'center', justifyContent: 'center',
                    },
                        state.design == true ? { backgroundColor: '#333' } : { backgroundColor: '#444' })}
                        onClick={() => {
                            if (state.design == true) {
                                if ((props.dirtyHaff && props.dirtyHaff.length > 0)||(props.switched.op && _.keys(props.switched.op).length > 0)) {
                                    //进行新添组件的代码生成,对于脏组件的结点生成采用父路径合并的方法
                                    var filePath = null
                                    this.props.dispatch(makeComponentDirtyClean()).then((json) => {
                                        props.dispatch(makeComponentStatusClean())
                                        props.dispatch(makeComponentHaffAllClean())
                                        props.dispatch(makeComponentDeletedHaffAllClean())
                                        
                                        //保存文件
                                        var buf = new Buffer(props.docId, 'hex')
                                        filePath = buf.toString()
                                        debugger
                                        return props.dispatch(saveFile(filePath, props._IStandaloneCodeEditor.getValue()))

                                    }).then((json) => {
                                        //设置tab文件标签为已保存
                                        props.dispatch(makeTabUnChanged({ path: filePath }))
                                        props.dispatch(switchToCode())
                                    
                                        //重新获取组件树信息
                                        return props.dispatch(fetchFileComponentInfo(filePath));
                                    }).then((json) => {
                                        var res=json.data
                                        
                                        var  { ranges, body, imports, dictionary,classMethods } = res.syntaxTree;
                                        debugger
                                        props.dispatch(_cacheDoc(
                                            {
                                                id: props.docId,
                                                utf8Data: props._IStandaloneCodeEditor.getValue()
                                            },
                                            ranges, imports, body, dictionary , classMethods))
                                    })

                                } else {
                                    props.dispatch(switchToCode())
                                }

                            }

                        }}
                    >
                        <span style={{ fontSize: '0.8em' }}>Code</span>
                    </div>


                    <div style={{display:'flex',flexDirection:'row',flex:1}}></div>

                    {/*Console*/}
                    <div key={3} className={consoleVisible == true ? 'option ' : 'option'} style={Object.assign({
                        display: 'flex', height: '25px', width: '60px', color: '#fff', marginLeft: '5px',
                        alignItems: 'center', justifyContent: 'center',marginRight:25
                    },
                        consoleVisible == true ? { backgroundColor: '#333' } : { backgroundColor: '#333' })}
                        onClick={() => {
                            if(consoleVisible)
                                props.dispatch(makeConsoleUnvisible())
                            else
                                props.dispatch(makeConsoleVisible())
                        }}
                    >
                        <span style={{ fontSize: '0.8em' }}>控制台</span>
                    </div>
                </div>
            </div>

        )
    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
    },
    row: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'row',
        alignItems: 'center'
    }
}


const mapStateToProps = (state, ownProps) => {

    const props = {
        dirtyHaff: state.monaco.dirtyHaff
    }
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            var doc = docCache[docId]
            props.doc = doc
            props.docStatus=doc.dragged?'dragged':'un-dragged'
            props.docId = docId
            props.components = doc.components?doc.components.View.children:null
            props._IStandaloneCodeEditor = state.monaco._IStandaloneCodeEditor
        }
        props.docId = docId
    }
    props.consoleVisible=state.consoleUtils.visible
    props.switched=state.palette.switched

    return props
}



export default connect(mapStateToProps)(DesignSwitch);
