
//const shell = window.Electron.shell
import _ from 'lodash'
import React, { Component, } from 'react'
import { Link, } from 'react-router'
import { connect} from 'react-redux'
const {remote} = require('electron')
// import {
//     save,
//     runSimulator,
//     runPackager,
//     hardReloadSimulator,
//     getAvailableSimulators,
//     openProject
// } from '../actions/applicationActions'
//
//
// import { CATEGORIES, PREFERENCES } from '../../../shared/constants/PreferencesConstants'
// import { setPreference, savePreferences } from '../actions/preferencesActions'
//
// import {
//     setConsoleVisibility,
//     setLeftSidebarVisibility,
//     setRightSidebarContent,
//     setSimulatorMenuPlatform,
// } from '../actions/uiActions'
//
// import {
//     fetchCustomizeProperties,
//     initCustomizeWorkspace,
//     uploadNpmProjWithParsed,
//     sendCustomizeNavigate
// } from '../actions/customizeActions';
//
// import {
//     makeInitVisible,
//
// } from '../actions/npmActions';
//
//
// import {
//     createDirectory,
// } from '../actions/fileActions'

//import SaveToolbarButton from '../components/buttons/SaveToolbarButton'



import { RIGHT_SIDEBAR_CONTENT, LAYOUT_FIELDS } from '../constants/LayoutConstants'

import Toolbar from '../components/toolbar/Toolbar'
import ToolbarButton from '../components/buttons/ToolbarButton'
import ToolbarButtonGroup from '../components/buttons/ToolbarButtonGroup'
import DropdownMenuButton from '../components/buttons/DropdownMenuButton'
import LandingButton from '../components/buttons/LandingButton'
import { ProcessStatus, } from '../constants/ProcessStatus'
import OnboardingUtils from '../utils/OnboardingUtils'
import SimulatorUtils from '../utils/SimulatorUtils'
import SimulatorMenu from '../components/menu/SimulatorMenu'

import{
    openDocument
} from '../actions/editorActions';


const sectionStyle = {
    WebkitAppRegion: 'drag',
    display: 'flex',
    flexDirection: 'row',
}

const SIZE = {
    SEP_LARGE: 54,
    SEP_SMALL: 18,
    BTN_LARGE: 60,
    BTN_SMALL: 52,
}

const separatorLargeStyle = {
    marginRight: SIZE.SEP_LARGE,
}

const separatorSmallStyle = {
    marginRight: SIZE.SEP_SMALL,
}

const dropdownMenuOffset = {
    x: 0,
    y: -14,
}

const emptySimulatorMenuStyle = {
    width: 300,
    height: 280,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '15px 10px 0px 10px',
}

class WorkspaceToolbar extends Component {
    constructor(props) {
        super(props)
        this.state = {}

        this.discussMenuOptions = [
            {
                text: 'Open Deco Slack',
                action: this._openDiscuss.bind(this)
            },
            {
                text: 'Create Slack Account',
                action: this._openCreateDiscussAccount.bind(this)
            },
        ]
    }

    _processStatusToButtonState(statusType) {
        switch(statusType) {
            case ProcessStatus.ON:
                return ToolbarButton.BUTTON_STATE.ACTIVE
            default:
                return ToolbarButton.BUTTON_STATE.DEFAULT
        }
    }

    _openDiscuss() {
        shell.openExternal("https://decoslack.slack.com/messages/deco/")
    }

    _openDocs() {
        shell.openExternal("https://www.decosoftware.com/docs")
    }

    _openCreateDiscussAccount() {
        shell.openExternal("https://decoslackin.herokuapp.com/")
    }

    _launchSimulatorOfType(simInfo, platform) {
        if (this.props.packagerIsOff) {
            this.props.dispatch(runPackager())
        }
        this.props.dispatch(runSimulator(simInfo, platform))
        SimulatorUtils.didLaunchSimulator(simInfo, platform)
        if (OnboardingUtils.shouldOpenConsoleForFirstTime()) {
            this.props.dispatch(setConsoleVisibility(true))
            OnboardingUtils.didOpenConsoleForFirstTime()
        }
    }

    _renderSimulatorMenu() {
        return (
            <SimulatorMenu
                setAndroidEmulationOption={(option) => {
                    const value = option == 'AVD' ? false : true
                    this.props.dispatch(setPreference(CATEGORIES.GENERAL, PREFERENCES.GENERAL.USE_GENYMOTION, value))
                    this.props.dispatch(savePreferences())
                    this.props.dispatch(getAvailableSimulators('android'))
                }}
                activeEmulationOption={this.props.useGenymotion ? 'Genymotion' : 'AVD'}
                setActiveList={(platform) => {
                    this.props.dispatch(setSimulatorMenuPlatform(platform))
                }}
                active={this.props.simulatorMenuPlatform}
                checkAvailableSims={() => {
                    // check to see if path changes or config changes open up new simulators
                    this.props.dispatch(getAvailableSimulators('ios'))
                    this.props.dispatch(getAvailableSimulators('android'))
                }}
                ios={this.props.availableSimulatorsIOS}
                android={this.props.availableSimulatorsAndroid}
                onClick={this._launchSimulatorOfType.bind(this)}/>
        )
    }

    _renderDropdownMenu(options) {
        return (
            <div className={'helvetica-smooth'}>
                {_.map(options, ({text, action}, i) => (
                    <div key={i}
                         style={{
                             marginBottom: i === options.length - 1 ? 0 : 6,
                             marginRight: 10,
                             marginLeft: 10,
                         }}>
                        <LandingButton onClick={action}>
                            {text}
                        </LandingButton>
                    </div>
                ))}
            </div>
        )
    }

    // RENDER
    _renderLeftSection() {




        return (
            <div style={sectionStyle}>
                <ToolbarButtonGroup
                    style={separatorLargeStyle}
                    activeIndexes={[
                        this.props.projectNavigatorVisible,
                        this.props.consoleVisible, ]}>
                    <ToolbarButton
                        text={'Project'}
                        icon={'project'}
                        onClick={() => {
                            const visibility = ! this.props.projectNavigatorVisible;
                            //this.props.dispatch(setLeftSidebarVisibility(visibility))
                        }}
                        width={SIZE.BTN_LARGE} />

                    <ToolbarButton
                        text={'Console'}
                        icon={'console'}
                        onClick={() => {
                            const visibility = ! this.props.consoleVisible
                            //this.props.dispatch(setConsoleVisibility(visibility))
                        }}
                        width={SIZE.BTN_LARGE} />
                </ToolbarButtonGroup>
                <ToolbarButtonGroup
                    style={separatorSmallStyle}>
                    <ToolbarButton
                        text={'Docs'}
                        icon={'docs'}
                        onClick={this._openDocs.bind(this)} />
                </ToolbarButtonGroup>
                <ToolbarButtonGroup
                    style={separatorSmallStyle}>
                    <DropdownMenuButton
                        offset={dropdownMenuOffset}
                        onVisibilityChange={(visible) => this.setState({discussMenuOpen: visible})}
                        renderContent={() => this._renderDropdownMenu(this.discussMenuOptions)}>
                        <ToolbarButton
                            text={'Discuss'}
                            icon={'chat'}
                            pressed={this.state.discussMenuOpen}
                        />
                    </DropdownMenuButton>
                </ToolbarButtonGroup>
            </div>
        )
    }



//中间部分代码的渲染
    _renderCenterSection() {



        const simulatorButtonState = this.props.simulatorProjectActive ?
            ToolbarButton.BUTTON_STATE.ACTIVE :
            ToolbarButton.BUTTON_STATE.DEFAULT

        return (
            <div style={sectionStyle}>
                <ToolbarButtonGroup
                    style={separatorSmallStyle}
                    activeIndexes={[
                        this.props.simulatorProjectActive,
                        false,
                    ]}>
                    <DropdownMenuButton
                        offset={dropdownMenuOffset}
                        onVisibilityChange={(visible) => this.setState({simulatorMenuOpen: visible})}
                        renderContent={() => this._renderSimulatorMenu()}>
                        <ToolbarButton
                            text={'Simulator'}
                            icon={'phone'}
                            buttonState={simulatorButtonState}
                            groupPosition={ToolbarButton.GROUP_POSITION.LEFT}
                            pressed={this.state.simulatorMenuOpen} />
                    </DropdownMenuButton>
                    <ToolbarButton
                        text={'Reload'}
                        icon={'refresh'}
                        onClick={() => {
                            this.props.dispatch(hardReloadSimulator())
                        }} />
                    <ToolbarButton
                        text={'customizing'}
                        icon={'publish'}
                        vectorIcon={{name:'edit',size:30}}
                        onClick={() => {
                            //TODO:打开electron-rn-dnd工程,暂且不切换customize面板
                            //this.props.dispatch(setRightSidebarContent(RIGHT_SIDEBAR_CONTENT.CUSTOMIZE))
                            //TODO:创建tmp文件夹,并创建index.jsx和初始化代码
                            var preDir='/users/danding/Documents/WebstormProj/electron-rn-dnd/preview/src/App';
                            this.props.dispatch(initCustomizeWorkspace(preDir,'tmp'));

                            this.props.dispatch(setRightSidebarContent(RIGHT_SIDEBAR_CONTENT.PROTOTYPE))
                            this.props.dispatch(openProject('/users/danding/Documents/WebstormProj/electron-rn-dnd/preview/src/App',
                                ()=>{
                                    alert('call back ....')
                                    sendCustomizeNavigate();
                                }))
                            this.props.dispatch(fetchCustomizeProperties('/users/danding/Documents/WebstormProj/electron-rn-dnd/preview/src'+
                                '/App/data/properties.json'))
                        }} />

                    <ToolbarButton
                        text={'init'}
                        style={{marginLeft:20}}
                        buttonStyle={{borderLeftWidth:1,borderTopLeftRadius:3,borderBottomLeftRadius:3}}
                        vectorIcon={{name:'plus',size:30}}
                        modalable={true}
                        onClick={() => {
                            //TODO:download npm_init.sh
                            this.props.dispatch(makeInitVisible());
                        }} />

                    <ToolbarButton
                        text={'publish'}
                        style={{marginLeft:2}}
                        buttonStyle={{borderLeftWidth:1,borderTopLeftRadius:3,borderBottomLeftRadius:3}}
                        vectorIcon={{name:'upload',size:30}}
                        modalable={true}
                        onClick={() => {
                            //TODO:download npm_init.sh
                            var payload={
                                path:'/users/danding/Documents/WebstormProj/electron-rn-dnd/preview/src/App',
                                dirname:'tmp'
                            };
                            this.props.dispatch(uploadNpmProjWithParsed(payload));
                        }} />



                    <ToolbarButton
                        text={'open file'}
                        icon={'publish'}
                        style={{marginLeft:2}}
                        vectorIcon={{name:'folder-open',size:30}}
                        onClick={() => {
                            //读取文件内容,路径位于insurance_node_server/test/parser/app.jsx
                            var path='/Users/danding/Documents/WebstormProj/SVN/insurance_node_server/test/parser/app.jsx';
                            var buf= new Buffer(path);
                            var id = buf.toString('hex');

                            this.props.dispatch(openDocument({
                                absolutePath:path,
                                id:id
                            })).then((payload)=>{
                                //在这里去设置doc的新内容
                                
                                this.props.onFileDataChange(payload)
                                
                            });
                        }} />




                </ToolbarButtonGroup>
            </div>
        )
    }

//渲染toolbar的右边部分,目前只有properties按钮
    _renderRightSection() {
        const handleSidebarToggleClick = (content) => {
            const value = this.props.rightSidebarContent === content ?
                RIGHT_SIDEBAR_CONTENT.NONE : content
            debugger
            this.props.dispatch(setRightSidebarContent(value))
        }

        // Left & right must have equal width for best flexboxing
        const spacer = SIZE.BTN_LARGE + SIZE.BTN_SMALL * 2 + SIZE.SEP_SMALL + SIZE.SEP_LARGE


        return (
            <div style={sectionStyle}>
                <div style={{width: spacer}}></div>
                <ToolbarButtonGroup
                    activeIndexes={[
                        this.props.rightSidebarContent === RIGHT_SIDEBAR_CONTENT.PROPERTIES,
                    ]}>


                    <ToolbarButton
                        text={'prototype'}
                        style={{marginLeft:2}}
                        buttonStyle={{borderLeftWidth:1,borderTopLeftRadius:3,borderBottomLeftRadius:3}}
                        vectorIcon={Object.assign({name:'eye',size:30},
                            this.props.rightSidebarContent==RIGHT_SIDEBAR_CONTENT.PROTOTYPE?{color:'#3399ff'}:null)}
                        modalable={true}
                        onClick={() => {
                            //TODO:download npm_init.sh
                            var content= RIGHT_SIDEBAR_CONTENT.PROTOTYPE;
                            const value = this.props.rightSidebarContent === content ?
                                RIGHT_SIDEBAR_CONTENT.NONE : content
                            if(value==content)
                            {
                                setTimeout(()=>{
                                    sendCustomizeNavigate();
                                },1000)
                            }
                            this.props.dispatch(setRightSidebarContent(value))




                        }} />
                    <ToolbarButton
                        text={'Properties'}
                        icon={'properties'}
                        onClick={handleSidebarToggleClick.bind(this, RIGHT_SIDEBAR_CONTENT.PROPERTIES)}
                        width={SIZE.BTN_LARGE} />



                </ToolbarButtonGroup>
            </div>
        )
    }

    render() {
        const {title, height, isTempProject} = this.props

        const leftContainerStyle = {
            display: 'flex',
            flexDirection: 'row',
            alignSelf: 'flex-end',
            marginLeft: 10,
            WebkitAppRegion: 'drag',
        }

        const rightContainerStyle = {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginRight: 10,
            WebkitAppRegion: 'drag',
        }



        return (
            <Toolbar
                title={title + (isTempProject ? ' (Temporary until saved)' : '')}
                height={height}>
                <span style={leftContainerStyle}>
                  {this._renderLeftSection()}
                </span>
                {this._renderCenterSection()}
                <span style={rightContainerStyle}>
                  {this._renderRightSection()}
                </span>
            </Toolbar>
        )
    }
}

WorkspaceToolbar.defaultProps = {
    className: '',
    style: {},
    title: 'Untitled',
}

const mapStateToProps = (state) => {
    return {
        consoleVisible: state.ui.consoleVisible,
        projectNavigatorVisible: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE],
        rightSidebarContent: state.ui.rightSidebarContent,
        simulatorProjectActive: false,

    }
}

export default connect(mapStateToProps)(WorkspaceToolbar)
