var fs = require('fs');
var babylon = require("babylon")
var _ = require('lodash');
var path = require('path');



function generateObjectValueJson(propertyValue) {
    var json = {}
    if (propertyValue.properties && propertyValue.properties.length > 0) {
        propertyValue.properties.map((prop, i) => {
            if (prop.value.type == 'StringLiteral' || prop.value.type == 'NumericLiteral')
                json[prop.key.name] = prop.value.value
            else
                json[prop.key.name] = generateObjectValueJson(prop.value)
        })
    }
    return json
}

//解决字面值传参不是引用的问题
function assignOb(out, itemIndex, assigned) {

    if (Object.prototype.toString.call(itemIndex) == '[object Array]')//数组编码
    {
        var ob = out
        for (var i = 0; i < itemIndex.length; i++) {
            if (i == itemIndex.length - 1)
                break
            ob = ob[itemIndex[i]]
        }
        ob[itemIndex[itemIndex.length - 1]] = assigned

    } else {
        out[itemIndex] = assigned
    }
}



/**
 * 分析当前元素属性，并赋值于out[itemIndex]
 * haff充当路径编码，用于表示当前元素: 1.render内部haff必传 2.classMethod不必传
 * @param {*} haff 
 * @param {*} ele 
 * @param {*} loc 
 * @param {*} content 
 * @param {*} childLoc 
 * @param {*} out 
 * @param {*} itemIndex 
 */
module.exports.parse = (haff, ele, loc, content, childLoc, out, itemIndex, ranges) => {


    var eleName = ''
    if (ele.name.type == 'JSXMemberExpression') {
        eleName = ele.name.object.name + '.' + ele.name.property.name
    } else {
        eleName = ele.name.name
    }

    //该元素具备有效属性
    if (ele.attributes && ele.attributes.length > 0) {
        var attributes = {};
        //TODO:obtain the attributes of the ele
        ele.attributes.map((attribute, i) => {
            var attrName = attribute.name.name;
            var val = null;
            var range = null;

            //捕捉DatePicker组件
            if (attrName == 'customStyles') {
                console.log()
            }




            if (attribute.value.type == 'JSXExpressionContainer') {
                if (attribute.value.expression.type == 'NumericLiteral') {
                    val = '{' + attribute.value.expression.value + '}';
                    range = {
                        start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                        end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column  }
                    }
                }
                else if (attribute.value.expression.type == 'StringLiteral') {
                    val = '{\'' + attribute.value.expression.value + '\'}';
                    range = {
                        start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 2 },
                        end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                    }
                }
                else if (attribute.value.expression.type == 'ObjectExpression')//多为style={{}},需要过滤出{{xxxxx}}的部分
                {
                    var jsonExpression = {};
                    attribute.value.expression.properties.map((property, k) => {
                        if (property.value.type == 'StringLiteral') {
                            if (property.key.type == 'StringLiteral')
                                jsonExpression[property.key.value] = property.value.value
                            else if (property.key.type == 'Identifier')
                                jsonExpression[property.key.name] = property.value.value
                        } else if (property.value.type == 'NumericLiteral') {
                            if (property.key.type == 'StringLiteral')
                                jsonExpression[property.key.value] = property.value.value
                            else if (property.key.type == 'Identifier')
                                jsonExpression[property.key.name] = property.value.value
                        } else if (property.value.type == 'BinaryExpression') {

                            switch (property.value.left.type) {
                                case 'Identifier':
                                    if (property.value.right.type == 'NumericLiteral') {
                                        jsonExpression[property.key.name] = {
                                            type: 'BinaryExpression',
                                            operator: property.value.operator,
                                            expression: property.value,
                                            left: property.value.left.name,
                                            right: property.value.right.value
                                        }
                                    }
                                    break;
                                case 'BinaryExpression':
                                    if (property.value.right.type == 'NumericLiteral') {
                                        jsonExpression[property.key.name] = {
                                            type: 'BinaryExpression',
                                            operator: property.value.operator,
                                            left: property.value.left.left.name + property.value.left.operator + property.value.left.right.value,
                                            expression: property.value,
                                            right: property.value.right.value
                                        }
                                    }
                                    break
                                default:
                                    break;
                            }
                        } else if (property.value.type == 'MemberExpression') {
                            var valueStr = ''
                            var stack = []
                            var oa = property.value
                            while (oa.type == 'MemberExpression') {
                                stack.push(oa.property.name)
                                oa = oa.object
                                if (oa.type == 'ThisExpression')
                                    break
                            }
                            stack.push('this')
                            while (stack.length != 0) {
                                valueStr += stack.pop()
                                if (stack.length != 0)
                                    valueStr += '.'
                            }
                            jsonExpression[property.key.name] = valueStr
                        }
                        else {
                            if (property.value.type != 'ObjectExpression') {
                                jsonExpression[property.key.name] = property.value.value
                            } else {
                                jsonExpression[property.key.name] = generateObjectValueJson(property.value)
                            }

                        }


                    });
                    val = '{' + JSON.stringify(jsonExpression) + '}';
                    range = {
                        start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 2 },
                        end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                    }
                }
                else if (attribute.value.expression.type == 'MemberExpression') {

                    //如果MemberExpression嵌套 
                    if (attribute.value.expression.object.type == 'MemberExpression') {
                        var embedObject = attribute.value.expression.object
                        if (embedObject.object.type == 'ThisExpression') {
                            val = '{this' + '.' + embedObject.property.name + '.' + attribute.value.expression.property.name + '}'
                        }

                        range = {
                            start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                            end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                        }
                    } else {
                        var memberName = attribute.value.expression.object.name
                        var prop = attribute.value.expression.property.name
                        //there is no need to look up a element in the dictionary
                        val = '{' + memberName + '.' + prop + '}'
                        range = {
                            start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                            end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                        }
                    }
                } else if (attribute.value.expression.type == 'ArrowFunctionExpression')//箭头表达式
                {

                } else if (attribute.value.expression.type == 'ArrayExpression')//数组表达式
                {
                    var jsonExpression = [];
                    attribute.value.expression.elements.map((element, k) => {
                        if (element.type == 'StringLiteral')
                            jsonExpression.push(element.value)
                        else if (element.type == 'ObjectExpression') {
                            var ob = {}
                            element.properties.map((prop, j) => {
                                var propName = prop.key.name
                                if (prop.value.type == 'Identifier')
                                    ob[propName] = prop.value.name
                                else if (prop.value.type == 'StringLiteral')
                                    ob[propName] = prop.value.value
                                else if (prop.value.type == 'NumericLiteral')
                                    ob[propName] = prop.value.value

                            })
                            jsonExpression.push(ob)
                        }
                        else if (element.type == 'MemberExpression') {
                            jsonExpression.push(dictionary[element.object.name][element.property.name])
                        }
                    });

                    val = '{' + JSON.stringify(jsonExpression) + '}';
                    range = {
                        start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                        end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                    }
                } else if (attribute.value.expression.type == 'JSXElement')//jsx 元素
                {
                    if (attrName == 'iconComponent') {
                        //todo:get the content and loc
                        var jsonExpression = {}
                        var ob = {}
                        jsonExpression.name = attribute.value.expression.openingElement.name.name
                        attribute.value.expression.openingElement.attributes.map((attr, j) => {

                            if (attr.value.type == 'StringLiteral') //值为字符串的属性
                            {
                                ob[attr.name.name] = attr.value.value
                            } else {
                                //属性值为引用体
                                if (attr.value.expression.type == 'StringLiteral') {
                                    ob[attr.name.name] = '{' + attr.value.expression.value + '}'
                                } else if (attr.value.expression.type == 'NumericLiteral') {
                                    ob[attr.name.name] = '{' + attr.value.expression.value + '}'
                                }
                            }
                        })

                        jsonExpression.attributes = ob
                        val = JSON.stringify(jsonExpression)
                        range = {
                            start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                            end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                        }
                    }
                } else if (attribute.value.expression.type == 'BooleanLiteral')//布尔类型的属性值
                {
                    val = '{' + attribute.value.expression.value + '}';
                    range = {
                        start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                        end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                    }
                }



            } else if (attribute.value.type == 'StringLiteral')//字符串字面值
            {
                val = attribute.value.value;
                range = {
                    start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                    end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column }
                }
            }
            //haff =>['Container','children',0],0应该由外部传入


            if (attribute.value.expression && attribute.value.expression.type == 'MemberExpression') { }
            else {
                ranges.push({ range: range, key: haff.concat('attributes').concat(attrName) })
            }
            attributes[attrName] = val;

        });

        if (content && content != '' && Object.prototype.toString.call(content) == '[object Object]')
            if(content.type=='JSXExpressionContainer')
            {
                ranges.push({
                    range: {
                        start: { line: content.loc.start.line, column: content.loc.start.column  },
                        end: { line: content.loc.end.line, column: content.loc.end.column+1}
                    }, key: haff.concat('attributes').concat('content')
                })
            }

        //针对Text组件
        if (eleName == 'Text' || eleName == 'ScrollView' || eleName == 'View')
            attributes['content'] = content
        assignOb(out, itemIndex, { name: eleName, attributes: attributes, loc: loc, childLoc }) //返回的数字==其下标+1
    } else {
        //针对Text组件
        if (eleName == 'Text' || eleName == 'ScrollView' || eleName == 'View') {
            if (attributes !== undefined && attributes !== null) {
            } else {
                attributes = {}
            }
            attributes['content'] = content
        }
        assignOb(out, itemIndex, { name: eleName, loc: loc, content, childLoc, attributes })

    }
}
