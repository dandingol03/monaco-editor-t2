
import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
const { remote } = require('electron')
const { Menu, MenuItem, nativeImage } = remote
import {
    makeRodalVisible,
    makeDirectoryRodalVisible
} from '../../actions/rodalActions';

import t from './t'

class Folder extends Component {


    constructor(props) {
        super(props)

        this.state = {


        }
    }




    render() {

        var state = this.state;
        var props = this.props;

        var { collapsed } = props;

        var className='folder'
        if(props.activate==true)
            className+=' activate'

        var childStyle={
            display:'flex',
            flex:'0 1 auto'
        }
        if(collapsed==true)
            childStyle.display='none'

        return (
            <li className={className} ref="container"  >
                <div style={{ display: 'flex', flex: '0 0 auto', height: '20px', flexDirection: 'row', alignItems: 'center' }}>
                    {
                        props.collapsed == true ?
                            <div className='right' onClick={() => {
                                
                                if (props.onClick)
                                    props.onClick('right')
                                event.preventDefault()
                                event.stopPropagation()
                            }}>
                            </div> :
                            <div className='down' onClick={() => {
                                
                                if (props.onClick)
                                    props.onClick('down')
                                event.preventDefault()
                                event.stopPropagation()
                            }}></div>
                    }

                    <div className='icon-folder'></div>
                    <span style={{ marginLeft: '4px' }}>{props.filename}</span>
                    <div style={{display:'flex',flex:1,height:20}} 
                        onClick={(event)=>{
                            
                            if(this.props.onSelected)
                                this.props.onSelected()
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                    >
                    </div>
                </div>
                <div style={childStyle}>
                    {props.children}
                </div>
                

            </li>
        )
    }

    componentDidMount() {
        const menu = new Menu()

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

        var {dispatch , onDelete }=this.props

        menu.append(new MenuItem({
            label: 'New', submenu: [
                {
                    label: 'Page', icon: icon_file, click() {
                        dispatch(makeRodalVisible())
                    }
                },
                { 
                    label: 'Directory', icon: icon_dir ,click(){
                        dispatch(makeDirectoryRodalVisible())
                    } 
                }
            ]
        }));
        menu.append(new MenuItem({ label: 'Rename', click() { alert('item rename') } }))
        menu.append(new MenuItem({
            label: 'Subversion', submenu: [
                { label: 'Commit File...' },
                { label: 'Update File...' }
            ]
        }))
        menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({ label: 'Delete', icon: icon_delete, click() { 
            
            if(onDelete)
                onDelete()
        }}))
        var container = this.refs['container'];
        container.addEventListener('contextmenu', (e) => {
            
            //e.preventDefault()
            menu.popup(remote.getCurrentWindow())
            //todo:阻止事件冒泡
            e.stopPropagation()
        }, false)
    }
}

const styles = {

    row: {
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'center'
    }
}


export default connect()(Folder)
