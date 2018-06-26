

var fs = require('fs');
var babylon = require("babylon")
var _ = require('lodash');
var path = require('path');

var MemberExpressionParser = require('./MemberExpressionParser')

module.exports.parse=(expression) => {
    
    var args=[]
    if(expression.arguments&&expression.arguments.length>0)
    {
        expression.arguments.map((arg,i)=>{
            switch(arg.type)
            {
                case 'StringLiteral':
                    args.push('\''+arg.value+'\'')
                break;
                case 'MemberExpression':
                    args.push(MemberExpressionParser.parse(arg))
                break;
                case 'ThisExpression':
                    args.push('this')
                break;
            }
        })
    }
    
    var callee=''
    switch(expression.callee.type)
    {
        case 'MemberExpression':
            callee=MemberExpressionParser.parse(expression.callee)
        break;
        default:
        break;
    }

    
    var str=callee+'('
    if(args.length>0)
    {
        args.map((arg,i)=>{
            str+=arg
            if(i!=args.length-1)
                str+=','
        })
    }
    str+=')'
    
    return str
}