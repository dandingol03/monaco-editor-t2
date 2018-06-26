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
    makeRenderRowRodalUnVisible
} from '../../actions/rodalActions';
import {
    updateCustomProperty
} from '../../actions/paletteActions';
import {
    makeClassMethodDirty,
    makeClassMethodClean
} from '../../actions/editorActions'
import ArrayUtils from '../../utils/ArrayUtils'

class RenderRowRodal extends Component {


    onCustomPropertyChange(key, value) {
        var { haff } = this.props
        var path = haff.concat('attributes').concat(key)


        //更新components属性
        this.props.dispatch(updateCustomProperty(path, value))
        var { decorationsMap, editor, haff, middleware } = this.props
        var monacoMiddleware = middleware.monaco
        debugger
        decorationsMap.map((decoration, i) => {

            if (ArrayUtils.compare(decoration.key, path) == true) {
                var id = decoration.decorationId
                //通过decorationId获取range
                var range = editor.getModel().getDecorationRange(id)
                var valueStr = null
                if (Object.prototype.toString.call(value) == '[object Object]') {
                    if (key == 'content')
                        valueStr = value.value
                    else
                        valueStr = JSON.stringify(value)
                }
                else
                    valueStr = value
                monacoMiddleware.executeEdits([{ range, content: valueStr }])
            }
        })
    }

    constructor(props) {
        super(props);

        this.state = {
            clicked: -1,
            renderRow: '',
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps)
    }

    render() {

        var props = this.props
        var { clicked, fields, renderRow } = this.state
        var { visible, haff, components } = this.props

        var classMethods = []
        if (props.classMethods && _.keys(props.classMethods).length > 0) {
            classMethods.push(<option value={''} key={-1}>null</option>)
            _.keys(props.classMethods).map((methodName, i) => {
                classMethods.push(<option value={methodName} key={i}>{methodName}</option>)
            })
        }


        var items = []

        fields = ['a']

        if (fields && fields.length > 0) {
            fields.map((field, i) => {
                items.push(
                )
            })
        }




        return (
            <Rodal visible={visible} animation='door' className='rodal-modal fields-modal' onClose={() => { }}
                showCloseButton={false} >
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
                                //更新组件结点的属性
                                this.onCustomPropertyChange('fields', fields)
                                this.props.dispatch(makeFieldsRodalUnVisible())
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
                            listview renderRow
                            </span>
                    </div>

                    <div style={{ display: 'flex', flex: '0 1 auto', width: 100 }}></div>

                </div>


                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto',
                }}>


                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 23, padding: 4, paddingLeft: 5, marginBottom: 1,
                        paddingRight: 10, background: '#555', justifyContent: 'flex-start', borderBottomWidth: 1, borderColor: '#444'
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <span style={{ color: '#ccc', fontSize: 12 }}>renderRow</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <input value={renderRow}
                                onChange={(event) => {
                                    this.setState({ renderRow: event.target.value })
                                }}
                                style={{
                                    background: '#666', outline: 'none', border: 'none', padding: 3, color: '#fff', fontSize: 13,
                                    width: 230, marginLeft: 20, borderRadius: 2, textAlign: 'center'
                                }} />
                        </div>

                        <div style={{ display: 'flex', flex: '0 1 auto',width:20 }}></div>

                        <select value={renderRow}
                            style={{ border: 0, width: 14 }}
                            onChange={(event) => {

                                this.setState({ renderRow: event.target.value })
                            }}>>
                            {classMethods}
                        </select>

                    </div>

                    {/*button part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '1 1 auto', padding: 10, justifyContent: 'flex-end',
                        alignItems: 'flex-end'
                    }}>


                        <div className='button'
                            style={{
                                display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                            }}
                            onClick={(event) => {
                                var methodName = this.state.renderRow
                                if (methodName != ''&&(methodName[0]<'0'||methodName[0]>'9')){
                                    //创建classmethod
                                    if(props.classMethods[methodName])
                                    {}
                                    else{
                                        props.classMethods[methodName]={ui:null}
                                    }
                                    //映射属性改动
                                    this.onCustomPropertyChange('renderRow',{ methodName: methodName })
                                    //清除该结点之前所标记的所有脏的类方法
                                    this.props.dispatch(makeClassMethodClean(this.props.haff))
                                    //标志该组件声明的类方法为脏
                                    this.props.dispatch(makeClassMethodDirty(methodName, this.props.haff))
                                    //关闭模态框
                                    this.props.dispatch(makeRenderRowRodalUnVisible())
                                    event.preventDefault()
                                    event.stopPropagation()
                                }
                            }}
                        >
                            <span style={{ fontSize: 14, color: '#ccc' }}>
                                {
                                    this.state.renderRow&&this.state.renderRow!=''?
                                        props.classMethods&&_.keys(props.classMethods).indexOf(this.state.renderRow)!=-1?
                                        'confirm':'generate new method':'invalid'
                                }
                            </span>
                        </div>

                    </div>


                </div>


            </Rodal>
        )

    }
}


const mapStateToProps = (state, ownProps) => {

    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache

    const props = {
    }
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.classMethods = doc.classMethods
            props.components = doc.components
            props.decorationsMap = doc.decorationsMap
        }
    }

    props.visible = state.rodal.renderRow.visible
    props.haff = state.rodal.renderRow.haff
    return props
}

export default connect(mapStateToProps)(RenderRowRodal)