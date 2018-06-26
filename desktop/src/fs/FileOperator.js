
var fs = require('fs');
var path = require('path');

var FileOperator = function () {
};

FileOperator.prototype.writeFile = (absolutePath, data) => {

    return new Promise((resolve, reject) => {
        var buf = data;
        if (!Buffer.isBuffer(data)) {
            buf = new Buffer(data, 'utf8');
        }
        fs.writeFile(absolutePath,buf,function(err){
            if(err)
            {
                reject(err)
            }else{
                resolve({re:1})
            }
        })

    });
};


module.exports = new FileOperator();