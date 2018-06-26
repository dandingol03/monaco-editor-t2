import _ from 'lodash'
import request from '../ipc/Request'
import FileConstants from '../../../../public/constants/ipc/fileConstants'
const {
  GET_FILE_METADATA,
  WRITE_FILE_METADATA,
  DELETE_FILE_METADATA,
} = FileConstants


export function _getFileMetadata(path, rootPath) {
  return {
    type: GET_FILE_METADATA,
    path,
    rootPath,
  }
}


/**
 * 加载本地文件的元数据
 * @param fileId,以hex编码
 * @returns {function(*, *)}
 */
export const loadMetadata = (fileId) => {
    
  return (dispatch, getState) => {
    const rootPath = getState().directory.rootPath
    
    return request(_getFileMetadata(fileId, rootPath)).then((payload) => {
      //payload.utf8Data是文件数据
        //alert('data of file ='+payload.utf8Data);
      const json = JSON.parse(payload.utf8Data)
      // const output = {
      //   liveValues: LiveValueUtils.normalizeLiveValueMetadata(json.liveValues)
      // }

      return json
    })
  }
}
