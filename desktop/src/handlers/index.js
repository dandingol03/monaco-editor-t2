var _ = require('lodash');

const{
    fileHandler
}=require( '../handlers/fileHandler');


var  handlers = [
    fileHandler
]

module.exports={
    registerHandlers : () => {
        _.each(handlers, (handler) => {
            handler.register()
        })
    }
}


