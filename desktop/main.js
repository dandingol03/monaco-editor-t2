/**
 * Created by danding on 17/5/6.
 */
const {app, BrowserWindow,Menu,shell} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

const { registerHandlers } =require('./src/handlers')
const {
    menus
} =require( './src/menu/index');

if (process.platform === 'darwin') {
    menus.unshift({
        label:  app.getName(),
        submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services', submenu: []},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'},
            {role: 'dwdw'},
        ]
    })

    // Edit menu
    menus[1].submenu.push(
        {type: 'separator'},
        {
            label: 'Speech',
            submenu: [
                {role: 'startspeaking'},
                {role: 'stopspeaking'}
            ]
        },
        {
            label: 'Spee',
            submenu: [
                {role: 'startspeaking'},
                {role: 'stopspeaking'}
            ]
        }
        
    )

    // Window menu
    menus[3].submenu = [
        {role: 'close'},
        {role: 'minimize'},
        {role: 'zoom'},
        
    ]
    

}



function createWindow () {

    //注册主进程的监听事件
    registerHandlers()
    win = new BrowserWindow({width: 1450, height: 800,color:'#2e2c29'})
    global.win=win

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    
    

     //win.loadURL('http://localhost:8013/public/build/index.html')

    // Open the DevTools.
    win.webContents.openDevTools()

    const menu = Menu.buildFromTemplate(menus)
    Menu.setApplicationMenu(menu)
    //win.setProgressBar(0.5)

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        
        win = null
    })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
    app.quit()
}
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
    createWindow()
}
})
