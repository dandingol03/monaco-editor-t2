

'use strict'

var  _ = require('lodash')
const { EventEmitter, } =require( 'events')
var  requestEmitter =require('./requestEmitter')


var  FileConstants =require( '../../../public/constants/ipc/fileConstants')
var LibraryConstants=require('../../../public/constants/ipc/libraryConstants')
var  ErrorConstants =require( '../../../public/constants/ipc/errorConstants')
const {
  ERROR,
} = ErrorConstants


var  Logger =require( '../log/logger')

const REQUEST_TYPES = [
  FileConstants,
  LibraryConstants
]

//由main process 发送给 render process
function sendToRenderer(channel, payload, windowId) {
  if (!channel) {
    Logger.error('Channel was found broken', channel)
    return
  }
  //for the moment, we assume only one instance of the app is running
  if (!payload) {
    payload = {} // not sure if this will cause problems when undefined or null
  }
  
    Logger.info('bridge send======\r\n windowId='+windowId+' channer='+channel);
  if (windowId == 'preferences') {
    try {
      if (!global.preferencesWindow) return
      global.preferencesWindow.webContents.send(channel, payload)
    } catch (e) {
      //the preferences window may not be open...
      Logger.info('Warning: ', e)
    }
  } else {
    Logger.info('openWindows='+global.openWindows);
    for (var id in global.openWindows) {
      global.openWindows[id].webContents.send(channel, payload)
    }
  }

}

class Bridge extends EventEmitter {

  constructor() {
    super()
    this._init()
    this._send = sendToRenderer
  }

  _init() {
    _.each(REQUEST_TYPES, (requestTypes) => {
    
      _.each(requestTypes, (id, requestType) => {

  
        //根据常量声明文件监听对应的node消息
        requestEmitter.on(id, (body, callback, evt) => {
          //this.emit equals to bridge.emit,we can use bridge.on to get message
          //this.emit(params:id,body,func,evt)
          if(id=='MODULE_NAVIGATE')
          {
            Logger.info('=======got navigate msg')
          }
          this.emit(id, body, (resp) => {
            //Logger.info('callback='+resp.type);
            if (resp && resp.type != ERROR) {
              callback(null, resp)
              return
            }
            callback(resp)
          }, evt)
        })
      })
    })
  }

  send(payload, windowId) {
    this._send(payload.type, payload, windowId)
  }

}

const bridge = new Bridge()

module.exports  =bridge
