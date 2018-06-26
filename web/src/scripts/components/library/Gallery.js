import _ from 'lodash';
import React, { Component, PropTypes, } from 'react'
const { remote } = require('electron')
const { Menu, MenuItem, nativeImage } = remote
const Path = require('electron').remote.require('path')
import { connect } from 'react-redux'
import LoadingBar from 'react-redux-loading-bar'
import { showLoading, hideLoading } from 'react-redux-loading-bar'
import CodeTemplate from './CodeTemplate';
import {
    fetchLibraryMetalist,
    onLibraryMetalistFetched,
    backupMonacoDirectory
} from '../../actions/libraryActions';

import TextInputWrapper from './TextInputWrapper';
import View from './View';
import Toolbar from './Toolbar'
import TouchableOpacity from './TouchableOpacity'
import ListView from './ListView'
import Icon from './Icon'
import ScrollView from './ScrollView'
import ActionSheet from './ActionSheet'
import Modal from './Modal'
import Text from './Text'
import DefaultWidget from './DefaultWidget'


class Gallery extends Component {

    constructor(props) {
        super(props)

    }



    render() {

        var state = this.state;
        var props = this.props;

        var { metalist } = props;

        var arr = []
        var row = null
        var items = []
        if (metalist && metalist.length > 0) {
            for (var i = 0; i < metalist.length; i++) {
                var component = metalist[i]
                switch(component.name)
                {
                    case 'View':
                    arr.push(
                        <View key={i} index={i} component={component} />
                    )
                    break;
                    case 'TouchableOpacity':
                    arr.push(
                        <TouchableOpacity key={i} index={i} component={component} />
                    )
                    break;
                    case 'TextInputWrapper':
                    arr.push(
                        <TextInputWrapper key={i} index={i} component={component} />
                    )
                    break;
                    case 'Toolbar':
                    arr.push(
                        <Toolbar key={i} index={i} component={component} />
                    )
                    break;
                    case 'ListView':
                    arr.push(
                        <ListView key={i} index={i} component={component} />
                    )
                    break;
                    case 'Icon':
                    arr.push(
                        <Icon key={i} index={i} component={component} />
                    )
                    break;
                    case 'ScrollView':
                    arr.push(
                        <ScrollView key={i} index={i} component={component} />
                    )
                    break;
                    case 'ActionSheet':
                    arr.push(
                        <ActionSheet key={i} index={i} component={component} />
                    )
                    break;
                    case 'Modal':
                    arr.push(
                        <Modal key={i} index={i} component={component} />
                    )
                    break;
                    case 'Text':
                    arr.push(
                        <Text key={i} index={i} component={component} />
                    )
                    break;
                    default:
                    arr.push(
                        <DefaultWidget key={i} index={i} component={component}/>
                    )
                    break; 
                }
            }



        }

        return (
            <div className="Gallery" ref="galerry" style={styles.container}>
                <div style={{ display: 'flex', flex: '0 0 auto', padding: 4, background: '-webkit-radial-gradient(top, #4e94ce, rgb(100, 100, 101))' }}>
                    <div style={{
                        display: 'flex', flex: '1 1 auto', flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'center', fontSize: '12px', color: '#fff'
                    }}>
                        Gallery
                    </div>
                </div>
                <div style={{ display: 'flex', flex: '0 0 auto', background: '#444' }}>
                    <LoadingBar style={{ backgroundColor: '#4e94ce' }} maxProgress={100} progressIncrease={4} />
                </div>



                <div style={{
                    display: 'flex', flex: '1 1 auto', background: '#3c3c3c', flexDirection: 'column', overflow: 'auto',
                    borderTopWidth: 0
                }}>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {arr}
                    </div>
                </div>

            </div>
        )
    }

    componentDidMount() {

        if (this.props.metalist) { }
        else {
            this.props.dispatch(showLoading())
            setTimeout(() => {

                this.props.dispatch(fetchLibraryMetalist()).then((json) => {
                    if (json.re == 1) {
                        this.props.dispatch(onLibraryMetalistFetched(json.data))
                        //在工程根路径下备份library的信息

                        this.props.dispatch(backupMonacoDirectory(json.data)).then((json) => {
                            console.log()
                            this.props.dispatch(hideLoading())
                        })
                    }
                })
            }, 400)
        }



    }

}

const styles = {
    container: {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column'
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
        rootPath: state.directory.rootPath,
        metalist: state.library.metalist
    }

    return props
}



export default connect(mapStateToProps)(Gallery)
