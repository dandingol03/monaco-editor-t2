import React, { Component, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash';
const Path = require('electron').remote.require('path')
import 'rodal/lib/rodal.css';
import Rodal from 'rodal';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Panel from './Panel';
import ToolbarPanel from './ToolbarPanel';
import ListViewPanel1 from './ListViewPanel1';
import ListViewPanel2 from './ListViewPanel2';
import ListViewPanel3 from './ListViewPanel3';
import ListViewPanel4 from './ListViewPanel4';
import {
    makeRodalUnVisible,
    makeListViewTemplateRodalUnVisible,
    fetchTemplateComponentTree
} from '../../actions/rodalActions';
import {
    createFile,
    fetchSubPath
} from '../../actions/fileActions'
import {
    fetchPageTemplate
} from '../../actions/libraryActions';
import {
    makeClassMethodDirty,
    appendComponentTreeAsComponentNode
} from '../../actions/editorActions';



class ListViewTemplateRodal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            panels: [
                { type: 'Panel', name: 'blank' },
                { type: 'ListViewPanel1', name: '' },
                { type: 'ListViewPanel2', name: '' },
                { type: 'ListViewPanel3', name: '' },
                { type: 'ListViewPanel4', name: '' }
            ],
            clicked: -1,
            filename: ''
        }
    }

    render() {

        var arr = []
        var { clicked, panels } = this.state
        var { haff, components, renderRow } = this.props

        panels.map((panel, i) => {
            if (panel.type == 'Panel') {
                arr.push(
                    <Panel name={panel.name} key={i} clicked={clicked == i}
                        onPress={() => {
                            this.setState({ clicked: i })
                        }} />)
            } else if (panel.type == 'ListViewPanel1') {

                arr.push(
                    <ListViewPanel1 name={panel.name} key={i} clicked={clicked == i}
                        onPress={() => {
                            this.setState({ clicked: i })
                        }}
                    />)

            } else if (panel.type == 'ListViewPanel2') {
                arr.push(
                    <ListViewPanel2 name={panel.name} key={i} clicked={clicked == i}
                        onPress={() => {
                            this.setState({ clicked: i })
                        }}
                    />)
            } else if (panel.type == 'ListViewPanel3') {
                arr.push(
                    <ListViewPanel3 name={panel.name} key={i} clicked={clicked == i}
                        onPress={() => {
                            this.setState({ clicked: i })
                        }}
                    />)
            } else if (panel.type == 'ListViewPanel4') {
                arr.push(
                    <ListViewPanel4 name={panel.name} key={i} clicked={clicked == i}
                        onPress={() => {
                            this.setState({ clicked: i })
                        }}
                    />)
            }
        })

        return (
            <Rodal visible={this.props.visible} animation='door' className='rodal-modal' onClose={() => { }}
                showCloseButton={false} height={360} width={650}>
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
                                this.props.dispatch(makeListViewTemplateRodalUnVisible())
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
                            listview template
                            </span>
                    </div>

                    <div style={{ display: 'flex', flex: '0 1 auto', width: 130 }}></div>

                </div>


                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto',
                }}>


                    {/*panel part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'column', flex: '1 1 auto', borderColor: '#111', borderStyle: 'dotted',
                        borderWidth: 0, borderBottomWidth: 1,
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'row', padding: 8 }}>
                            {arr}
                        </div>
                    </div>


                    {/*button part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 64, padding: 10, justifyContent: 'flex-end',
                        alignItems: 'flex-end'
                    }}>

                        <div className='button'
                            style={{
                                display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                            }}
                            onClick={(event) => {

                                //有模板选中
                                if (clicked != -1 && clicked != 0) {
                                    //在选中模板之前必须先确定renderRow的函数
                                    if (renderRow && renderRow != '') {
                                        var name = panels[clicked].type
                                        //获取模板-组件树
                                        this.props.dispatch(fetchTemplateComponentTree(name)).then((json) => {
                                            if (json.re == 1) {

                                                debugger
                                                var { body } = json.data
                                                //对应listview的路径编码
                                                var _node = components
                                                haff.map((_haff, i) => {
                                                    _node = _node[_haff]
                                                })
                                               
                                                //设置该方法为脏标志
                                                this.props.dispatch(makeClassMethodDirty(renderRow, this.props.haff, body))
                                                //插入组件结点
                                                this.props.dispatch(appendComponentTreeAsComponentNode(this.props.haff,body))


                                            }
                                            this.props.dispatch(makeListViewTemplateRodalUnVisible())
                                        })
                                    } else {
                                        alert('请先填写renderRow方法再进行模板选择')
                                    }

                                } else {
                                    this.props.dispatch(makeListViewTemplateRodalUnVisible())
                                }


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

    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
        }
    }


    const props = {
    }

    if (doc)
        props.components = doc.components

    props.visible = state.rodal.listViewTemplate.visible
    props.haff = state.rodal.listViewTemplate.haff

    if (props.components && props.haff) {
        var _node = props.components
        props.haff.map((_haff, i) => {
            _node = _node[_haff]
        })
        props.fields = _node.attributes.fields
    }

    if (state.monaco.dirtyMethods) {
        var dirtyMethods = state.monaco.dirtyMethods
        var methodNames = _.keys(dirtyMethods)
        var renderRow = null
        methodNames.map((name, i) => {
            if (dirtyMethods[name].haff == props.haff)
                renderRow = name
        })
        props.renderRow = renderRow
    }

    return props
}

export default connect(mapStateToProps)(ListViewTemplateRodal)