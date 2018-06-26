/**
 * Created by danding on 17/5/12.
 */
var  FileConstants = require( '../../../public/constants/ipc/fileConstants')
const {
    SAVE_SUCCESSFUL,
    ON_FILE_DATA,
    GET_FILE_DATA,
    ON_TEXT_FIND_IN_PROJ,
    GET_FILE_METADATA,
    RENAME,
    CREATE_DIRECTORY,
    CREATE_FILE,
    ADD_SUB_PATH,
    ADD_SUB_PATH_BATCH,
    REMOVE_SUB_PATH,
    REMOVE_SUB_PATH_BATCH,
} = FileConstants

module.exports.onFileData = (pathObj, utf8Data) => {
  return {
    type: GET_FILE_DATA,
    id: pathObj.id,
    absolutePathArray: pathObj.absolutePathArray,
    utf8Data: utf8Data,
  }
}

module.exports.onTextSearchInProj=(data)=>{
  return {
    type:ON_TEXT_FIND_IN_PROJ,
    data:data
  }
}


module.exports.onFileMetadata = (pathObj, utf8Data) => {
  return {
    type: GET_FILE_METADATA,
    id: pathObj.id,
    absolutePathArray: pathObj.absolutePathArray,
    utf8Data: utf8Data,
  }
}

module.exports.onFileCreated = (pathObj, utf8Data) => {
  return {
    type: CREATE_FILE,
    id: pathObj.id,
    absolutePathArray: pathObj.absolutePathArray,
    fileType: 'file',
    baseName: pathObj.baseName,
  }
}

