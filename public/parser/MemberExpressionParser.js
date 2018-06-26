var fs = require('fs');
var babylon = require("babylon")
var _ = require('lodash');
var path = require('path');


module.exports.parse=(expression) => {
    var ob=expression.object
    var str=''
    str+='.'+expression.property.name
    while(ob.type!='Identifier'&&ob.type!='ThisExpression')
    {
        str='.'+ob.property.name+str
        ob=ob.object
    }
    if(ob.type=='Identifier')
        str=ob.name+str
    else if(ob.type=='ThisExpression')
        str='this'+str
    return str
}