var fs = require('fs');
var babylon = require("babylon")
var _ = require('lodash');
var path = require('path');
var MemberExpressionParser = require('./MemberExpressionParser')


module.exports.parse=(expression) => {
    
    var ob={}
    if(expression.params&&expression.params.length>0)
    {
        expression.params.map((param,i)=>{
            if(param.type=='Identifier')
                ob[param.name]={}
        })
    }

    var body=expression.body.body
    body.map((node,i)=>{
        if(node.type=='ExpressionStatement')
        {
            switch(node.expression.type)
            {
                case 'AssignmentExpression':
                    if(node.expression.right.type=='Identifier')
                        {
                            if(ob[node.expression.right.name])
                                ob[node.expression.right.name]=node.expression.left
                        }
                break;
            }
        }
    })

    return ob
}