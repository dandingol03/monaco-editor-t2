
import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
const { remote } = require('electron')
const { Menu, MenuItem, nativeImage } = remote

import {
    makeRodalVisible,
    makeDirectoryRodalVisible
} from '../../actions/rodalActions';


class File extends Component {
    constructor(props) {
        super(props)

        var type = '';
        if (props.filename.indexOf('.jsx') != -1) {
            type = 'jsx';
        } else if (props.filename.indexOf('.js') != -1)
            type = 'js';
        else if (props.filename.indexOf('.html') != -1)
            type = 'html';
        this.state = {
            filename: props.filename,
            type: type
        }
    }

    render() {

        var state = this.state;
        var props = this.props;

        var {onDelete}=this.props
        
        var fileType = 'icon-js-file'
        var reg = /.*?\.(.*)$/
        var suffix = reg.exec(props.filename)[1]
        switch (suffix) {
            case 'png':
                fileType = 'icon-png-file'
                break
            case 'mp3':
                fileType = 'icon-mp3-file'
                break
            default:
                break
        }

        var className = 'file'
        if (props.activate == true)
            className += ' activate'
        if (props.modified == true)
            className += ' modified'
        if (props.staged == true) {
            className += ' staged'
        } else {
            if (props.not_added == true)
                className += ' not_added'
        }


        return (

            <li className={className} onClick={this.props.onClick} ref="container">
                <div style={{ display: 'flex', flex: '0 0 auto', height: '20px', flexDirection: 'row', alignItems: 'center' }}>
                    {

                    }
                    <div className={fileType}></div>
                    <span style={{ marginLeft: '4px' }}>{props.filename}</span>
                </div>
            </li>
        )
    }

    componentDidMount() {
        const menu = new Menu()
        var {onDelete}=this.props
        var path = remote.require('path');
        var filePath = path.join(global.__dirname, '/public/icons/icon-font-file.png')
        var directoryPaht = path.join(global.__dirname, '/public/icons/icon-font-folder.png')
        var deletePath = path.join(global.__dirname, '/public/icons/icon-delete.png')
        let icon_file = nativeImage.createFromPath(filePath);
        icon_file = icon_file.resize({ width: 17, height: 17 });

        let icon_dir = nativeImage.createFromPath(directoryPaht)
        icon_dir = icon_dir.resize({ width: 17, height: 17 });

        let icon_delete = nativeImage.createFromPath(deletePath)
        icon_delete = icon_delete.resize({ width: 22, height: 20 });

        var { dispatch,onGitAdd,onGitCommit,onGitPush } = this.props

        menu.append(new MenuItem({
            label: 'New', submenu: [
                {
                    label: 'File', icon: icon_file, click() {
                        dispatch(makeRodalVisible())
                    }
                },
            ]
        }));
        menu.append(new MenuItem({ label: 'Rename', click() { alert('item rename') } }))
        menu.append(new MenuItem({
            label: 'Git', submenu: [
                {
                    label: 'Add File...', click() {
                        if(onGitAdd)
                            onGitAdd()
                    }
                },
                { label: 'Commit File...',click(){
                        if(onGitCommit)
                            onGitCommit()
                } },
                 { label: 'Push File...',click(){
                        if(onGitPush)
                            onGitPush()
                } },

            ]
        }))
        menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({ label: 'Delete', icon: icon_delete, click() {
                if(onDelete)
                    onDelete()
         } }))
        var container = this.refs['container'];
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            menu.popup(remote.getCurrentWindow())
            e.stopPropagation()
        }, false)
    }
}

const styles = {

    row: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'row',
        alignItems: 'center'
    }
}


export default connect()(File)
