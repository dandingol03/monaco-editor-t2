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
    makeNPMPackagesUnVisible,
    fetchNPMPackageInfo,
    applyNPMPackageConfigInfo
} from '../../actions/rodalActions';
import {
    fetchPageTemplate,
} from '../../actions/libraryActions';



class NPMPackagesRodal extends Component {

    constructor(props) {
        super(props);

        this.textarea = {}
        this.state = {
            clicked: -1,
            filename: '',
            configStatus: 0,
            template: null,
            tpl: null
        }
    }

    render() {

        var arr = []
        var { clicked, configStatus, template } = this.state
        var { packages, dictionary, ratio } = this.props

        var fields = []
        if (dictionary && dictionary.length > 0) {
            dictionary.map((field, j) => {
                if (j != dictionary.length - 1) {
                    fields.push(
                        <div key={j} style={{
                            display: 'flex', flexDirection: 'row', flex: ratio[j], justifyContent: 'center',
                            color: '#ddd', fontSize: 12, borderRightWidth: 1, borderRightColor: '#555', borderRightStyle: 'solid'
                        }}>
                            {field}
                        </div>)
                } else {
                    fields.push(
                        <div key={j} style={{
                            display: 'flex', flexDirection: 'row', flex: ratio[j], justifyContent: 'center',
                            color: '#ddd', fontSize: 12
                        }}>
                            {field}
                        </div>)
                }
            })

            var entity = (
                <div key={-1} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 2, background: '#666', cursor: 'pointer' }}>
                    {fields}
                </div>)
            arr.push(entity)
        }

        packages.map((packageEntity, i) => {
            fields = []
            dictionary.map((field, j) => {
                fields.push(
                    <div key={j} style={{ display: 'flex', flexDirection: 'row', flex: ratio[j], justifyContent: 'center', color: '#ddd' }}>
                        {packageEntity[field]}
                    </div>)
            })
            entity = (
                <div key={i} className={clicked == i ? 'clicked' : ''} style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 1, marginTop: 1,
                    background: '#222', cursor: 'pointer'
                }}
                    onClick={(e) => {
                        this.setState({ clicked: i })
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                >
                    {fields}
                </div>)
            arr.push(entity)
        })

        var configTemplate = (
            <textarea key={1} ref={(p) => {
                this.textarea.template = p
            }} style={{
                display: 'flex', flex: '1 1 auto', fontFamily: 'sans-serif', fontSize: 14, fontWeight: 'bold'
                , background: '#333', color: '#eee', outline: 'none', borderWidth: 0
            }} />
        )

        var configTpl = (
            <textarea key={2} placeholder={'<View style={${styleJson}}>\n</View>'}
                ref={(p) => {
                    this.textarea.tpl = p
                }}
                style={{
                    display: 'flex', flex: '1 1 auto', fontFamily: 'sans-serif', fontSize: 14, fontWeight: 'bold'
                    , background: '#333', color: '#eee', outline: 'none', borderWidth: 0
                }}

            />
        )

        var height = 470
        var width = 800
        if (configStatus != 0) {
            width = 600
            height = 240
        }



        return (
            <Rodal visible={this.props.visible}
                animation='door'
                className='rodal-modal' onClose={() => { }}
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
                                this.props.dispatch(makeNPMPackagesUnVisible())
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
                            {
                                configStatus == 0 ?
                                    'Config Packages In Npm' :
                                    configStatus == 1 ?
                                        'config ' + packages[clicked].NAME + ' template' :
                                        configStatus == 2 ?
                                            'config ' + packages[clicked].NAME + ' tpl' : null
                            }
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
                        borderWidth: 0, borderBottomWidth: 1, backgroundColor: '#333', padding: 1, paddingTop: 0
                    }}>

                        {
                            configStatus == 0 ?
                                arr :
                                configStatus == 1 ?
                                    configTemplate :
                                    configStatus == 2 ?
                                        configTpl : null
                        }
                    </div>


                    {/*button part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 32, padding: 10, justifyContent: 'flex-end',
                        alignItems: 'flex-end'
                    }}>
                        <div className='button' style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#ccc' }}>
                                {
                                    configStatus == 0 ?
                                        'Cancel' : 'Prev'
                                }
                            </span>
                        </div>


                        <div className='button'
                            style={{
                                display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                            }}
                            onClick={(event) => {

                                //配置阶段 
                                if (configStatus == 0) {
                                    if (packages && packages.length > 0 && clicked != -1) {
                                        var packageEntity = packages[clicked]
                                        this.props.dispatch(fetchNPMPackageInfo(packageEntity.NAME)).then((json) => {

                                            if (json.re == -1)//弹出textarea让用户填
                                            {
                                                this.setState({ configStatus: 1 })
                                            } else {
                                                //先写入textarea内容，再显示给用户
                                            }
                                        })

                                    }
                                } else if (configStatus == 1)//配置template
                                {
                                    this.setState({ configStatus: 2, template: this.textarea.template.value })
                                } else if (configStatus == 2)//配置tpl
                                {
                                    //向服务器提交数据
                                    if (this.textarea.tpl.value != null && this.textarea.tpl.value != '') {
                                        var packageEntity = packages[clicked]
                                        this.props.dispatch(applyNPMPackageConfigInfo({
                                            name: packageEntity.NAME,
                                            template: template,
                                            tpl: this.textarea.tpl.value
                                        })).then((json) => {

                                        })
                                    }
                                }

                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span style={{ fontSize: 14, color: '#ccc' }}>
                                {
                                    configStatus == 0 ?
                                        'Config' :
                                        configStatus == 1 ?
                                            'Next' :
                                            configStatus == 2 ?
                                                'Finish' : null
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
    props.visible = state.rodal.visible.npmPackages
    props.dictionary = state.npm.dictionary
    props.packages = state.npm.packages
    props.ratio = state.npm.ratio
    return props
}

export default connect(mapStateToProps)(NPMPackagesRodal)