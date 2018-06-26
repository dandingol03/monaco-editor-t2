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
    makeGithubReposUnvisible,
    fetchNPMPackageInfo,
    applyNPMPackageConfigInfo
} from '../../actions/rodalActions';
import {
    fetchPageTemplate,
    fetchLibraryMetalist,
    onLibraryMetalistFetched,
    backupMonacoDirectory
} from '../../actions/libraryActions';
import {
    searhRepo,
    cacheRepos
} from '../../actions/npmActions'


class GithubReposRodal extends Component {

    constructor(props) {
        super(props);

        this.textarea = {}
        this.state = {
            clicked: -1,
            filename: '',
            configStatus: 0,
            template: null,
            tpl: null,
            configTemplate: '',
            configTpl: '',
            doingRefresh:false
        }
    }

    render() {

        var arr = []
        var { clicked, configStatus, template, configTemplate , doingRefresh } = this.state
        var { repos, dictionary, ratio, metalist  } = this.props


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
        }

        var entity = null

        //筛选出已经配有模板的repo
        var configedRepo = {}
        if (metalist && metalist.length > 0) {
            metalist.map((meta, i) => {
                if (meta.git_url && meta.git_url != '') {
                    configedRepo[meta.name] = true
                }
            })
        }

        if (repos && repos.length > 0) {
            repos.map((repo, i) => {

                var configed = null
                if (configedRepo[repo.name] == true)
                    configed = true


                arr.push(
                    <div key={i} className={clicked == i ? 'clicked' : ''} style={{
                        display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', padding: 1, marginTop: 1, padding: 2,
                        background: '#222', cursor: 'pointer'
                    }}
                        onClick={(e) => {
                            this.setState({ clicked: i })
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'row', flex: 2, justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                            {repo.name}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', flex: 2, justifyContent: 'center', color: '#bbb', fontSize: 11 }}>
                            {repo.description}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'center', color: '#bbb', fontSize: 11 }}>
                            {repo.created_at}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', width: 60, marginRight: 10, justifyContent: 'center', color: '#bbb', fontSize: 11 }}>
                            {
                                configed ?
                                    <FontAwesome name={'check-square-o'} size={13} color="#ddd" /> : null
                            }
                        </div>
                    </div>
                )
            })
        }


        // arr.push(
        //     <div key={-1} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 2, background: '#666', cursor: 'pointer' }}>
        //         {fields}
        //     </div>
        // )

        var packages = null
        if (packages) {
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

        }
        var configTemplateEle = (
            <textarea key={1} ref={(p) => {
                this.textarea.template = p
            }} style={{
                display: 'flex', flex: '1 1 auto', fontFamily: 'sans-serif', fontSize: 14, fontWeight: 'bold'
                , background: '#333', color: '#eee', outline: 'none', borderWidth: 0
            }} />
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
                className='rodal-modal'
                onClose={() => {
                    this.setState({doingRefresh:false,configStatus:0})
                    this.props.dispatch(makeGithubReposUnvisible())
                }}
                showCloseButton={false} width={width} height={height}>
                {/*header content*/}
                <div className='header' style={{
                    display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 30,
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
                                this.props.dispatch(makeGithubReposUnvisible())
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
                                    'Config Repo In Github' :
                                    configStatus == 1 ?
                                        'config ' + repos[clicked].name + '.js' :
                                        configStatus == 2 ?
                                            'config ' + repos[clicked].name + ' tpl' : null
                            }
                        </span>
                    </div>

                    <div style={{ display: 'flex', flex: '0 1 auto', width: 110 }}></div>

                    <div style={{ display: 'flex', flex: '0 1 auto',flexDirection:'row',marginRight:10,alignItems:'center',cursor:'pointer' }}
                        onClick={(event)=>{
                            this.setState({doingRefresh:true})
                            this.props.dispatch(searhRepo('dandingol03')).then((json)=>{
                                if(json.data&&json.data.length>0)
                                    this.props.dispatch(cacheRepos(json.data))
                                this.setState({doingRefresh:false})
                            }).catch((e)=>{
                                console.error(e)
                                this.setState({doingRefresh:false})
                            })
                        }}
                    >
                        {
                            doingRefresh?
                            <i className="fa fa-spinner fa-spin"></i>:
                            <FontAwesome name={'refresh'} size={13} color="#007acc" />    
                        }
                    </div>
                    
                </div>


                {/*content part*/}
                <div className='content' style={{
                    display: 'flex', flexDirection: 'column', flex: '1 1 auto'
                }}>



                    {/*panel part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'column', flex: '1 1 auto', borderColor: '#111', borderStyle: 'dotted',
                        borderWidth: 0, borderBottomWidth: 1, backgroundColor: '#333', padding: 1, paddingTop: 0
                    }}>

                        {
                            configStatus == 0 ?
                                <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', padding: 2, background: '#666', cursor: 'pointer' }}>
                                    <div style={{
                                        display: 'flex', flexDirection: 'row', flex: 2, justifyContent: 'center',
                                        color: '#ddd', fontSize: 12, borderRightWidth: 1, borderRightColor: '#555', borderRightStyle: 'solid'
                                    }}>
                                        name
                                    </div>

                                    <div style={{
                                        display: 'flex', flexDirection: 'row', flex: 2, justifyContent: 'center',
                                        color: '#ddd', fontSize: 12, borderRightWidth: 1, borderRightColor: '#555', borderRightStyle: 'solid'
                                    }}>
                                        description
                                    </div>
                                    <div style={{
                                        display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'center',
                                        color: '#ddd', fontSize: 12, borderRightWidth: 1, borderRightColor: '#555', borderRightStyle: 'solid'
                                    }}>
                                        date
                                    </div>
                                    <div style={{
                                        display: 'flex', flexDirection: 'row', width: 60, justifyContent: 'center',
                                        color: '#ddd', fontSize: 12
                                    }}>
                                        configed
                                    </div>

                                </div> : null
                        }

                        <div style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', overflowY: 'scroll' }}>
                            {
                                configStatus == 0 ?
                                    arr : null
                            }

                            {
                                configStatus == 1 ?
                                    <textarea value={this.state.configTemplate}
                                        onChange={(event) => {
                                            this.setState({ configTemplate: event.target.value })
                                        }} style={{
                                            display: 'flex', flex: '1 1 auto', fontFamily: 'sans-serif', fontSize: 14
                                            , background: '#333', color: '#eee', outline: 'none', borderWidth: 0
                                        }} /> : null
                            }

                            {
                                configStatus == 2 ?
                                    <textarea value={this.state.configTpl}
                                        onChange={(event) => {
                                            this.setState({ configTpl: event.target.value })
                                        }}
                                        placeholder={'<View style={${styleJson}}>\n</View>'}
                                        style={{
                                            display: 'flex', flex: '1 1 auto', fontFamily: 'sans-serif', fontSize: 14
                                            , background: '#333', color: '#eee', outline: 'none', borderWidth: 0
                                        }}
                                    /> : null
                            }

                        </div>
                    </div>


                    {/*button part*/}
                    <div style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 40, padding: 10, justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}>

                        {
                            configStatus == 0 ?
                                <div className='button' style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                    onClick={(event)=>{
                                        this.props.dispatch(makeGithubReposUnvisible())
                                    }}
                                >
                                    <span style={{ fontSize: 14, color: '#ccc' }}>
                                        Cancel
                                    </span>
                                </div> : null
                        }

                        {
                            configStatus == 2 ?
                                <div className='button' style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, color: '#ccc' }}>
                                        Prev
                                    </span>
                                </div> : null
                        }

                        <div className='button'
                            style={{
                                display: 'flex', flex: '0 0 auto', flexDirection: 'row', justifyContent: 'center',
                                alignItems: 'center', background: '-webkit-linear-gradient(top, #57ab60, rgba(58, 216, 106, 0.32))'
                            }}
                            onClick={(event) => {
                                debugger
                                //配置阶段 
                                if (configStatus == 0) {
                                    if (repos && repos.length > 0 && clicked != -1) {
                                        var repo = repos[clicked]
                                        this.props.dispatch(fetchNPMPackageInfo(repo.name)).then((json) => {

                                            if (json.re == -1)//在textarea中进行配置
                                            {
                                            } else {
                                                //先写入textarea内容，再显示给用户
                                            }
                                            this.setState({ configStatus: 1 })
                                        })

                                    }
                                } else if (configStatus == 1)//配置template
                                {
                                    this.setState({ configStatus: 2 })
                                } else if (configStatus == 2)//配置tpl
                                {
                                    //向服务器提交数据
                                    if (this.state.configTpl != null && this.state.configTpl != '') {
                                        var repo = repos[clicked]
                                        this.props.dispatch(applyNPMPackageConfigInfo({
                                            name: repo.name,
                                            npmName:repo.name,
                                            template: this.state.configTemplate,
                                            tpl: this.state.configTpl,
                                            git_url: repo.git_url,
                                            description:repo.description
                                        })).then((json) => {
                                            if(json.re==1)
                                            {
                                                
                                                //获取metalist数据
                                                this.props.dispatch(fetchLibraryMetalist()).then((json) => {
                                                    if (json.re == 1) {
                                                        this.props.dispatch(onLibraryMetalistFetched(json.data))
                                                        //在工程根路径下备份library的信息
                                                        this.props.dispatch(backupMonacoDirectory(json.data)).then((json) => {
                                                            this.props.dispatch(makeGithubReposUnvisible())        //关闭模态框
                                                        })
                                                    }
                                                    
                                                })
                                            }
                                        }).catch((e)=>{
                                            console.error(e)
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

    componentWillUnmount() {
        this.setState({doingRefresh:false})
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
    props.visible = state.rodal.visible.githubRepos
    props.repos = state.npm.repos
    props.ratio = state.npm.ratio
    props.metalist = state.library.metalist
    return props
}

export default connect(mapStateToProps)(GithubReposRodal)