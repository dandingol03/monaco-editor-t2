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
    makeFieldsRodalUnVisible
} from '../../actions/rodalActions';
import {
    updateCustomProperty
} from '../../actions/paletteActions';

/**
 * 该模态框为listview的字段填写服务
 * 故通过workspace渲染
 */
class FieldsRodal extends Component {


    onCustomPropertyChange(key, value) {
        var { haff } = this.props
        var path = haff.concat('attributes').concat(key)

        //TODO:文本更改统一交由代码生成负责
        //更新components属性
        this.props.dispatch(updateCustomProperty(path, value))

    }

    constructor(props) {
        super(props);

        this.state = {
            clicked: -1,
            filename: '',
            fields: props.fields
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps)
    }

    render() {

        var { clicked, fields } = this.state
        var { visible, haff, components } = this.props

        var items = []


        if (fields && fields.length > 0) {
            fields.map((field, i) => {
                items.push(
                    <div key={i} style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 23, padding: 4, paddingLeft: 5, marginBottom: 1,
                        paddingRight: 10, background: '#555', justifyContent: 'flex-start', borderBottomWidth: 1, borderColor: '#444'
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <span style={{ color: '#ccc', fontSize: 15 }}>{i}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', padding: 4, alignItems: 'center' }}>
                            <input value={field}
                                onChange={(event) => {
                                    var _fields = _.cloneDeep(fields)
                                    _fields.map((_field, j) => {
                                        if (j == i)
                                            _fields[i] = event.target.value
                                    })

                                    this.setState({ fields: _fields })
                                }}
                                style={{
                                    background: '#666', outline: 'none', border: 'none', padding: 3, color: '#fff', fontSize: 13,
                                    width: 200, marginLeft: 20, borderRadius: 2, textAlign: 'center'
                                }} />
                        </div>

                        <div style={{ display: 'flex', flex: '1 1 auto' }}></div>

                        <div className='plus' style={{ display: 'flex', flexDirection: 'row', padding: '4px 7px', alignItems: 'center' }}>
                            <FontAwesome name='plus' size={22} color="rgb(78, 192, 206)" />
                        </div>

                        <div className='minus' style={{ display: 'flex', flexDirection: 'row', padding: '4px 7px', alignItems: 'center' }}>
                            <FontAwesome name='minus' size={22} color="rgb(255, 0, 102)" />
                        </div>

                    </div>
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
                            update fields property
                            </span>
                    </div>

                    <div style={{ display: 'flex', flex: '0 1 auto', width: 130 }}></div>

                </div>


                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto',
                }}>


                    {items}

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

                                //更新组件结点的属性
                                this.onCustomPropertyChange('fields', fields)
                                this.props.dispatch(makeFieldsRodalUnVisible())
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

    props.visible = state.rodal.fields.visible
    props.haff = state.rodal.fields.haff

    if (props.components && props.haff) {
        var _node = props.components
        props.haff.map((_haff, i) => {
            _node = _node[_haff]
        })

        props.fields = _node.attributes.fields
    }

    return props
}

export default connect(mapStateToProps)(FieldsRodal)