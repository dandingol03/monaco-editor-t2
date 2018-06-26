
const {shell} = require('electron')
const {fileHandler} = require('../handlers/fileHandler')
module.exports.menus=[
    //App 菜单栏
   
    {
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    },
    {
        label: 'View',
        submenu: [
            {role: 'reload'},
            {role: 'forcereload'},
            {role: 'toggledevtools'},
            {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
        ]
    },
    {
        role: 'window',
        submenu: [
            {role: 'minimize'},
            {role: 'close'}
        ]
    },
    {
        label:'工程',
        role:'project',
        submenu:[
            {
                label:'new project',
                click(){
                    fileHandler.configProjePathAndName()
                }
            },
            {
                label:'open project',
                click(){
                    
                }
            },
            {
                type: 'separator'
            },
            {
                label:'redux集成',
                click(){
                    fileHandler.inquireProjPathForReduxIntergration()
                }  
            },
            {
                label:'react-native组件集成',
                click(){
                    fileHandler.intergreteComponents()
                }
            }
        ]
    },
    {
        label:'部署',
        role: 'build',
        submenu: [
            {
                label:'build  apk',
                click(){
                    fileHandler.packageAndroidOffline()
                       // global.win.webContents.send('console', {name:'dw'})  
                }
            }
        ]
    },
    {
        label:'Npm',
        role: 'npm',
        submenu: [
            {
                label:'config npm packages',
                click(){
                    fileHandler.configNPMPackagesInFront()
                }
            },
            {
                label:'config tpl in repo',
                click(){
                    fileHandler.configTPLInRepo()
                }
            },
            {
                label:'npm search',
                click(){
                    fileHandler.searchAllPackageByName()
                       // global.win.webContents.send('console', {name:'dw'})  
                }
            },
            {
                label:'npm install',
                click(){
                    fileHandler.installNpmByPackageJS()
                }
            }
        ]
    }

]