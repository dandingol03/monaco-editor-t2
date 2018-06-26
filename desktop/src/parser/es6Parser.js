


var fs = require('fs');
var babylon = require("babylon")
var _ = require('lodash');
var path = require('path');
var ElmentParser = require('../../../public/parser/JSXElementParser')
var MemberExpressionParser = require('../../../public/parser/MemberExpressionParser')
var CallExpressionParser = require('../../../public/parser/CallExpressionParser')
var ArrowFunctionExpressionParser = require('../../../public/parser/ArrowFunctionExpressionParser')



module.exports.parse = (path) => {
    return new Promise((resolve, reject) => {
        
        var code = fs.readFileSync(path).toString();
        const parsed = babylon.parse(code, {
            // parse in strict mode and allow module declarations
            sourceType: "module",

            plugins: [
                // enable jsx and flow syntax
                "jsx",
                "flow"
            ]
        });
        //可填属姓
        var props = [];

        //默认属性
        var defaultProps = [];

        var className = null;
        //变量表
        var dictionary = {};
        //根类元素
        var json = {};
        //marker
        var ranges = [];
        //引入
        var imports = [];
        //类方法
        var classMethods = {};

        function analyzeLogicalExpression(logic)//对一个求真的表达式进行计算
        {
            if (logic.type == 'LogicalExpression' || logic.type == 'BinaryExpression')
                return analyzeLogicalExpression(logic.left) + logic.operator + analyzeLogicalExpression(logic.right)
            else {
                if (logic.type == 'MemberExpression')//成员表达式引用
                {
                    return MemberExpressionParser.parse(logic)
                } else if (logic.type == 'NullLiteral') {
                    return "null"
                }
                else {
                    return logic.name
                }
            }
        }

        function analyzeCallExpression(call)//对一个函数调用求字面值
        {
            var expression = ''
            switch (call.callee.type) {
                case 'MemberExpression':
                    expression += call.callee.object.name + '.' + call.callee.property.name
                    break;
            }
            //如果函数调用的参量不为空
            if (call.arguments && call.arguments.length > 0) {
                expression += '('
                call.arguments.map((argument, i) => {
                    switch (argument.type) {
                        case 'MemberExpression':
                            expression += argument.object.name + '.' + argument.property.name
                            break;
                        case 'StringLiteral':
                            expression += '\'' + argument.value + '\''
                            break;
                    }
                    if (i != call.arguments.length - 1)
                        expression += ','
                    else
                        expression += ')'
                })
            } else {
                expression += '()'
            }
            return expression
        }


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

        //根元素属性分析
        function analyseRootAttribute(haff, out, attributes, childLoc) {
            var ele = null;
            // var p = json;
            haff.map((branch, k) => {
                ele = out[branch]
            });

            attributes.map((attribute, z) => {
                var name = attribute.name.name;
                var val = null;
                var range = null;

                if (attribute.value.type == 'JSXExpressionContainer')//引用体
                {
                    if (attribute.value.expression.type == 'NumericLiteral') {
                        val += '{' + attribute.value.expression.value + '}';
                    }
                    else if (attribute.value.expression.type == 'Identifier') {
                        val = '{' + attribute.value.expression.name + '}';
                    } else if (attribute.value.expression.type == 'StringLiteral')//字符串字面值
                    {
                        val = '{' + attr.value.value + '}';
                    } else if (attribute.value.expression.type == 'JSXElement') {
                        //
                    } else if (attribute.value.expression.type == 'MemberExpression')//表达式为成员属性的引用
                    {
                        var memberName = attribute.value.expression.object.name
                        var prop = attribute.value.expression.property.name
                        val = '{' + memberName + '.' + prop + '}'
                    } else if (attribute.value.expression.type == 'ObjectExpression') {
                        val = {};
                        attribute.value.expression.properties.map((property, j) => {
                            val[property.key.name] = property.value.value
                        })
                    }


                } else if (attribute.value.type == 'StringLiteral')//字符串`
                {
                    val = attribute.value.value;
                    //range={start:attribute.value.loc.start,end:attribute.value.loc.end};
                }
                range = {
                    start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                    end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                }

                //当属性值也为jsx表达式时,val为object,故不参与range的入栈
                if (attribute.value.expression.type == 'JSXElement' || attribute.value.expression.type == 'CallExpression'
                    || attribute.value.expression.type == 'MemberExpression' || attribute.value.expression.type == 'ObjectExpression') {
                    ele[name] = { value: val, range: range, type: attribute.value.expression.type, childLoc }
                }
                else {
                    ranges.push({ range: range, key: haff.concat(name) });
                    ele[name] = { value: val, range: range, childLoc }
                }

                //json[haff][name]={value:val,range:range}

            });
        }


        //逐级分析ui
        function _recurse(prefix, ele, out, ranges, haff) {
            if (ele.openingElement.attributes && ele.openingElement.attributes.length > 0) {
                var childLoc = []
                if (ele.openingElement.selfClosing == false && ele.children.length > 0) {
                    ele.children.map((child, i) => {
                        childLoc.push(child.loc)
                    })
                }
                var content = null

                if (ele.openingElement.selfClosing != true || (ele.children && ele.children.length > 0))//非自闭合
                {

                    if (ele.openingElement.name.name == 'Text'
                        || ele.openingElement.name.name == 'ScrollView'
                        || ele.openingElement.name.name == 'View') {

                        if (content == null)
                            content = ''
                        ele.children.map((arg, k) => {
                            var origin = null
                            if (arg.type == 'JSXText')//纯文本
                            {
                                origin = arg.value;
                                origin = origin.trimLeft()
                                var leftSpace=arg.value.length-origin.length
                                origin = origin.trimRight()
                                var rightSpaceIndex=origin.length+leftSpace
                                if (origin != '') {
                                    if (content && Object.prototype.toString.call(content) == '[object Object]') {
                                        //文本后存在断行
                                        if(rightSpaceIndex!=arg.value.length&&arg.value.substring(rightSpaceIndex,arg.value.length).indexOf('\n')!=-1)
                                        {
                                            var linewrapIndex=arg.value.substring(rightSpaceIndex,arg.value.length).indexOf('\n')+rightSpaceIndex
                                            content.value += arg.value.substring(0,linewrapIndex)
                                            content.loc.end.column+= linewrapIndex//需要验证
                                        }else{
                                            content.value += arg.value
                                            content.loc.end = arg.loc.end
                                        }
                                    } else {
                                        content += origin
                                    }
                                }

                            } else if (arg.type == 'JSXExpressionContainer')//jsx{}
                            {
                                switch (arg.expression.type) {
                                    case 'Identifier':
                                        content += '{' + arg.expression.name + '}'
                                        break;
                                    case 'MemberExpression':
                                        if (content && Object.prototype.toString.call(content) == '[object Object]') {
                                            content.value += '{' + MemberExpressionParser.parse(arg.expression) + '}'
                                            content.loc.end = arg.loc.end
                                        }
                                        else
                                            content += '{' + MemberExpressionParser.parse(arg.expression) + '}'
                                        break;
                                    case 'JSXEmptyExpression':
                                        content = ''
                                        break;
                                    case 'CallExpression':
                                        content = '{' + CallExpressionParser.parse(arg.expression) + '}'
                                        break;
                                }
                                if (content && content != '' && Object.prototype.toString.call(content) != '[object Object]')
                                    content = { value: content, loc: arg.loc, type: 'JSXExpressionContainer' }//todo:fix problem,by add the content range to ranges

                            }
                        })
                    }

                }

                ElmentParser.parse(haff, ele.openingElement, ele.loc, content, childLoc, out, prefix, ranges);
            }

            //有子结点
            if (ele.openingElement.selfClosing != true && (ele.children && ele.children.length > 0)) {
                var j = 0
                //创键数据结构容纳数据
                var cur = out
                prefix.map((_item, j) => {
                    cur = cur[_item]
                })
                cur['children'] = []
                ele.children.map((child, i) => {
                    if (child.type == 'JSXElement')
                        _recurse(prefix.concat('children').concat(j), child, out, ranges, haff.concat('children').concat(j++))
                })
            }
        }

        //ui分析
        function analyseUI(ele, out, ranges, methodName) {
            var block = {}


            _recurse(['ui'], ele, block, ranges, ['classMethods', methodName, 'ui'])
            return block.ui
        }

        //子级元素属性分析
        function analyseAttributeInJsx(haff, ele, loc, content, childLoc, out) {
            var pnode = null;
            var node = null
            if (out)
                node = out
            else
                node = json;
            for (var z = 0; z < haff.length; z++) {
                if (z == haff.length - 1)
                    break;
                pnode = node
                node = node[haff[z]]
            }

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
                                end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                            }
                        }
                        else if (attribute.value.expression.type == 'StringLiteral') {
                            val = '{\'' + attribute.value.expression.value + '\'}';
                            range = {
                                start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 2 },
                                end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 2 }
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
                                }else if(property.value.type=='Identifier')
                                {
                                    if(property.key.type=='StringLiteral')
                                        jsonExpression[property.key.value]=property.value.name
                                }else if (property.value.type == 'NumericLiteral') {
                                    if (property.key.type == 'StringLiteral')
                                        jsonExpression[property.key.value] = property.value.value
                                    else if (property.key.type == 'Identifier')
                                        jsonExpression[property.key.name] = property.value.value
                                } else if (property.value.type == 'BinaryExpression') {

                                    switch (property.value.left.type) {
                                        case 'Identifier':
                                            if (property.value.right.type == 'NumericLiteral') {
                                                jsonExpression[property.key.value] = {
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

                            val = ArrowFunctionExpressionParser.parse(attribute.value.expression)
                            range = {
                                start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                                end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column - 1 }
                            }
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
                                    jsonExpression.push(dictionary[element.object.name][element.property.name])//what does this mean for?
                                }
                            });

                            val = '{' + JSON.stringify(jsonExpression) + '}';
                            range = {
                                start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 2 },
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
                                end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column }
                            }
                        }else if(attribute.value.expression.type == 'CallExpression')//函数调用的属性值
                        {
                            //this gonna to throw a error someday
                            var expressionStr = '{' + CallExpressionParser.parse(attribute.value.expression) + '}'
                            val={
                                methodName:attribute.value.expression.callee.object.property.name,
                                value:expressionStr
                            }
                            range = {
                                start: { line: attribute.value.loc.start.line, column: attribute.value.loc.start.column + 1 },
                                end: { line: attribute.value.loc.end.line, column: attribute.value.loc.end.column }
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
                    else
                        ranges.push({ range: range, key: haff.concat('attributes').concat(attrName) });
                    attributes[attrName] = val;

                });

                //针对Text组件
                if (eleName == 'Text' || eleName == 'ScrollView')
                    attributes['content'] = content
                pnode.children.push({ name: eleName, attributes: attributes, loc: loc, childLoc });//返回的数字==其下标+1
            } else {
                //针对Text组件
                if (eleName == 'Text' || eleName == 'ScrollView') {
                    if (attributes !== undefined && attributes !== null) {
                    } else {
                        attributes = {}
                    }
                    attributes['content'] = content
                }

                pnode.children.push({ name: eleName, loc: loc, content, childLoc, attributes });
            }
        }



        //在jsxElement中遍历 (第7层)
        function traverseInJsx7(haff, argument) {
            if (argument.children && argument.children.length > 0) {
                var childSet = argument.children
                for (var o = 0; o < childSet.length; o++) {
                    var child = childSet[o];
                    if (child.type == 'JSXElement') {
                        var ele = child.openingElement;
                        var name = ele.name.name;
                        var prefix = haff
                        var node = json;
                        haff.map((pa, i) => {
                            node = node[pa]
                        });
                        var content = null
                        if (name == 'Text') {
                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                            {

                                if (content == null)
                                    content = ''
                                child.children.map((arg, k) => {
                                    var origin = null
                                    if (arg.type == 'JSXText')//纯文本
                                    {
                                        origin = arg.value;
                                        origin = origin.trimLeft()
                                        origin = origin.trimRight()
                                        content += origin
                                    } else if (arg.type == 'JSXExpressionContainer')//jsx{}
                                    {
                                        content += '{' + arg.expression.extra.raw + '}'
                                    }

                                })

                            }
                        }
                        //获取ScrollView的子表达式
                        if (name == 'ScrollView') {
                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                            {

                                if (content == null)
                                    content = ''
                                child.children.map((arg, k) => {
                                    var origin = null
                                    if (arg.type == 'JSXExpressionContainer')//jsx{}
                                    {
                                        switch (arg.expression.type) {
                                            case 'Identifier':
                                                content += '{' + arg.expression.name + '}'
                                                break;
                                            default:
                                                content += '{' + arg.expression.extra.raw + '}'
                                                break;
                                        }
                                    }

                                })

                            }
                        }
                        if (node.children) { }
                        else {
                            node.children = [];
                        }
                        var haff2 = prefix.concat('children').concat(node.children.length)

                        //获取childLoc
                        var childLoc = []
                        if (ele.selfClosing != true || (child.children && child.children.length > 0)) {
                            child.children.map((child, i) => {
                                childLoc.push(child.loc)
                            })
                        }

                        analyseAttributeInJsx(haff2, ele, child.loc, content, childLoc);

                    }
                }
            }
        }

        //在jsxElement中遍历 (第6层)
        function traverseInJsx6(haff, argument) {
            if (argument.children && argument.children.length > 0) {
                var childSet = argument.children
                for (var o = 0; o < childSet.length; o++) {
                    var child = childSet[o];
                    if (child.type == 'JSXElement') {
                        var ele = child.openingElement;
                        var name = ele.name.name;
                        var prefix = haff
                        var node = json;
                        haff.map((pa, i) => {
                            node = node[pa]
                        });
                        var content = null
                        if (name == 'Text') {
                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                            {

                                if (content == null)
                                    content = ''
                                child.children.map((arg, k) => {
                                    var origin = null
                                    if (arg.type == 'JSXText' && arg.value.trim() != '')//纯文本
                                    {
                                        origin = arg.value;
                                        origin = origin.trimLeft()
                                        origin = origin.trimRight()
                                        content += origin
                                    } else if (arg.type == 'JSXExpressionContainer')//jsx{}
                                    {
                                        if (arg.expression.type == 'MemberExpression') {
                                            content += '{' + MemberExpressionParser.parse(arg.expression) + '}'
                                        } else if (arg.expression.type == 'ConditionalExpression') {
                                            //三目表达式
                                            var test = analyzeLogicalExpression(arg.expression.test)
                                            console.log()
                                            var consequence = null
                                            switch (arg.expression.consequent.type) {
                                                case 'NullLiteral':
                                                    consequence = 'null'
                                                    break;
                                                case 'CallExpression':
                                                    consequence = analyzeCallExpression(arg.expression.consequent)
                                                    break;
                                                case 'MemberExpression':
                                                    consequence = MemberExpressionParser.parse(arg.expression.consequent)
                                                    break;
                                            }
                                            var alternate = null
                                            switch (arg.expression.alternate.type) {
                                                case 'NullLiteral':
                                                    alternate = 'null'
                                                    break;
                                                case 'CallExpression':
                                                    alternate = analyzeCallExpression(arg.expression.alternate)
                                                    break;
                                                case 'StringLiteral':
                                                    alternate = arg.expression.alternate.value
                                                    break;
                                            }
                                            content = { type: 'ConditionalExpression', test, consequence, alternate }
                                        }
                                        else {
                                            content += '{' + arg.expression.extra.raw + '}'
                                        }
                                    }

                                })

                            }
                        }

                        if (name == 'ScrollView') {
                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                            {

                                if (content == null)
                                    content = ''
                                child.children.map((arg, k) => {
                                    var origin = null
                                    if (arg.type == 'JSXExpressionContainer')//jsx{}
                                    {
                                        switch (arg.expression.type) {
                                            case 'Identifier':
                                                content += '{' + arg.expression.name + '}'
                                                break;
                                            default:
                                                content += '{' + arg.expression.extra.raw + '}'
                                                break;
                                        }
                                    }

                                })

                            }
                        }

                        if (node.children) { }
                        else {
                            node.children = [];
                        }
                        var haff2 = prefix.concat('children').concat(node.children.length)

                        //获取childLoc
                        var childLoc = []
                        if (ele.selfClosing != true || (child.children && child.children.length > 0)) {
                            child.children.map((child, i) => {
                                childLoc.push(child.loc)
                            })
                        }
                        analyseAttributeInJsx(haff2, ele, child.loc, content, childLoc);
                        //获取第7层元素属性
                        traverseInJsx7(haff2, child)
                    }
                }
            }
        }

        //在jsxElement中遍历 (第5层)
        function traverseInJsx5(haff, argument) {
            if (argument.children && argument.children.length > 0) {
                var childSet = argument.children
                for (var o = 0; o < childSet.length; o++) {
                    var child = childSet[o];
                    if (child.type == 'JSXElement') {
                        var ele = child.openingElement;
                        var name = ''
                        if (ele.name.type == 'JSXMemberExpression') {
                            name = ele.name.object.name + '.' + ele.name.property.name
                        } else {
                            name = ele.name.name
                        }
                        var prefix = haff
                        var node = json;
                        haff.map((pa, i) => {
                            node = node[pa]
                        });
                        var content = null
                        if (name == 'Text') {
                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                            {

                                if (content == null)
                                    content = ''
                                child.children.map((arg, k) => {
                                    var origin = null
                                    if (arg.type == 'JSXText')//纯文本
                                    {
                                        origin = arg.value;
                                        origin = origin.trimLeft()
                                        origin = origin.trimRight()
                                        content += origin
                                    } else if (arg.type == 'JSXExpressionContainer')//jsx{}
                                    {

                                        if (arg.expression.type == 'MemberExpression') {
                                            content += '{' + MemberExpressionParser.parse(arg.expression) + '}'
                                        } else {
                                            content += '{' + arg.expression.extra.raw + '}'
                                        }

                                    }

                                })

                            }
                        }
                        //获取ScrollView的子表达式
                        if (name == 'ScrollView') {
                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                            {

                                if (content == null)
                                    content = ''
                                child.children.map((arg, k) => {
                                    var origin = null
                                    if (arg.type == 'JSXExpressionContainer')//jsx{}
                                    {
                                        switch (arg.expression.type) {
                                            case 'Identifier':
                                                content += '{' + arg.expression.name + '}'
                                                break;
                                            default:
                                                content += '{' + arg.expression.extra.raw + '}'
                                                break;
                                        }
                                    }

                                })

                            }
                        }
                        if (node.children) { }
                        else {
                            node.children = [];
                        }
                        var haff2 = prefix.concat('children').concat(node.children.length)

                        //获取childLoc
                        var childLoc = []
                        if (ele.selfClosing != true || (child.children && child.children.length > 0)) {
                            child.children.map((child, i) => {
                                childLoc.push(child.loc)
                            })
                        }

                        analyseAttributeInJsx(haff2, ele, child.loc, content, childLoc);
                        //获取第6层元素
                        traverseInJsx6(haff2, child)
                    }
                }
            }

        }

        //在jsxElement中遍历(第4层)
        function traverseInJsx4(haff, argument) {
            if (argument.children && argument.children.length > 0) {
                var childSet = argument.children
                for (var o = 0; o < childSet.length; o++) {
                    var child = childSet[o];
                    if (child.type == 'JSXElement') {
                        var ele = child.openingElement;
                        var name = ele.name.name;
                        var prefix = haff
                        var node = json;
                        haff.map((pa, i) => {
                            node = node[pa]
                        });
                        var content = null
                        if (name == 'Text') {
                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                            {

                                if (content == null)
                                    content = ''
                                child.children.map((arg, k) => {
                                    var origin = null
                                    if (arg.type == 'JSXText')//纯文本
                                    {
                                        origin = arg.value;
                                        origin = origin.trimLeft()
                                        origin = origin.trimRight()
                                        content += origin
                                    } else if (arg.type == 'JSXExpressionContainer')//jsx{}
                                    {
                                        if (arg.expression.type == 'MemberExpression') {
                                            var stack = []
                                            var ob = arg.expression.object
                                            stack.push(arg.expression.property.name)
                                            while (ob && ob.type != 'ThisExpression') {
                                                stack.push(ob.property.name)
                                                ob = ob.object
                                            }
                                            stack.push('this')
                                            var argContent = ''
                                            while (stack.length != 0) {

                                                argContent += stack.pop()
                                                if (stack.length != 0)
                                                    argContent += '.'
                                            }
                                            content += '{' + argContent + '}'
                                        } else {
                                            content += '{' + arg.expression.extra.raw + '}'
                                        }
                                    }

                                })

                            }
                        }
                        if (node.children) { }
                        else {
                            node.children = [];
                        }
                        var haff2 = prefix.concat('children').concat(node.children.length)

                        //获取childLoc
                        var childLoc = []
                        if (ele.selfClosing != true || (child.children && child.children.length > 0)) {
                            child.children.map((child, i) => {
                                childLoc.push(child.loc)
                            })
                        }

                        analyseAttributeInJsx(haff2, ele, child.loc, content, childLoc);
                        //获取第5层元素
                        traverseInJsx5(haff2, child)
                    }
                }
            }

        }


        //核心
        function extractInfo(node) {
            node.body.body.map((statement, j) => {
                if (statement.type == 'ReturnStatement') {

                    var root = statement.argument.openingElement.name.name;
                    json[root] = {

                    };

                    if (statement.argument.openingElement.attributes && statement.argument.openingElement.attributes.length > 0) {
                        var childLoc = []
                        if (statement.argument.openingElement.selfClosing == false && statement.argument.children.length > 0) {
                            statement.argument.children.map((child, i) => {
                                childLoc.push(child.loc)
                            })

                        }

                        analyseRootAttribute([root], json, statement.argument.openingElement.attributes, childLoc);
                    }


                    if (statement.argument.openingElement.selfClosing == true)
                        return;

                    statement.argument.children.map((argument, k) => {
                        if (argument.type == 'JSXExpressionContainer') {
                            var expression = argument.expression;
                            if (expression.type == 'ConditionalExpression' && expression.test.type == 'LogicalExpression')//逻辑表达式
                            {

                                var literal = code.substring(expression.test.start, expression.test.end);
                                var consequent = null;
                                if (expression.consequent.type != 'NullLiteral') {
                                    var name = expression.consequent.openingElement.name.name;
                                    var attributes = {};
                                    if (expression.consequent.openingElement.attributes && expression.consequent.openingElement.attributes.length > 0) {

                                        //获取属性
                                        expression.consequent.openingElement.attributes.map((attr, i) => {
                                            var name = attr.name.name;
                                            var val = null;
                                            if (attr.value.type == 'JSXExpressionContainer') {
                                                if (attr.value.expression.type == 'NumericLiteral')
                                                    val = '{' + attr.value.expression.value + '}';
                                                else if (attr.value.expression.type == 'StringLiteral')
                                                    val = '{\'' + attr.value.expression.value + '\'}';
                                            } else if (attr.value.type == 'StringLiteral')//字符串字面值
                                            {
                                                val = '{' + attr.value.value + '}';
                                            }
                                            attributes[name] = val;
                                        });
                                    }
                                    consequent = { [name]: attributes };
                                }
                                var alternate = null;
                                if (expression.alternate.type != 'NullLiteral') {

                                    var name = expression.alternate.openingElement.name.name;
                                    var attributes = {};
                                    if (expression.alternate.openingElement.attributes && expression.alternate.openingElement.attributes.length > 0) {

                                        //获取属性
                                        expression.alternate.openingElement.attributes.map((attr, i) => {
                                            var name = attr.name.name;
                                            var val = null;
                                            if (attr.value.type == 'JSXExpressionContainer') {
                                                if (attr.value.expression.type == 'NumericLiteral')
                                                    val = '{' + attr.value.expression.value + '}';
                                                else if (attr.value.expression.type == 'StringLiteral')
                                                    val = '{\'' + attr.value.expression.value + '\'}';
                                            } else if (attr.value.type == 'StringLiteral')//字符串字面值
                                            {
                                                val = '{' + attr.value.value + '}';
                                            }
                                            attributes[name] = val;
                                        });
                                    }
                                    alternate = { [name]: attributes };

                                }

                                json[root].children.push({ Logic: { consequent: consequent, alternate: alternate, expression: literal } });
                            }
                            else if (expression.type == 'Identifier')//引用
                            {
                                //TODO:找出引用的组件类型
                                var name = expression.name;
                                var value = dictionary[name];
                                if (value.type == 'JSXElement') {
                                    //TODO:need to be more specified
                                    //具有属性
                                    if (value.attributes) {
                                        for (var field in value.attributes) {
                                            var attr = value.attributes[field];
                                            ranges.push({ range: attr.loc, key: [root, value.name, field] });
                                        }

                                    }
                                }
                                json[root].children.push({ expression: value });
                            }
                        } else if (argument.type == 'JSXText')//一般为换行
                        {

                        } else if (argument.type == 'JSXElement')//jsx元素
                        {
                            var ele = argument.openingElement;
                            var name = ele.name.name;
                            var content = null
                            if (ele.selfClosing != true || (ele.children && ele.children.length > 0))//非自闭合
                            {
                                if (argument.children && argument.children.length > 0)//所包含的子元素
                                {
                                    //之有当本元素为Text时才提取
                                    if (ele.name.name == 'Text') {

                                        if (content == null)
                                            content = ''
                                        argument.children.map((arg, k) => {
                                            var child = null
                                            if (arg.type == 'JSXText')//纯文本
                                            {
                                                child = arg.value;
                                                //记录词汇的起始下标和最后字符的下标
                                                var lIndex=child.length-child.trimLeft().length
                                                var rIndex=child.trimRight().length-1
                                                content+={
                                                    value:child.trimLeft().trimRight(),
                                                    start:arg.start+lIndex,
                                                    end:arg.start+rIndex
                                                }
                                            } else if (arg.type == 'JSXExpressionContainer')//jsx{}
                                            {
                                                content += '{' + arg.expression.extra.raw + '}'
                                            }

                                        })

                                    }
                                }
                            }
                            if (json[root].children) {
                            } else {
                                json[root].children = [];
                            }

                            var prefix = [root, 'children'];
                            var haff = [root, 'children'].concat(json[root].children.length)
                            //获取元素的首位空位置，以便代码插入
                            var childLoc = []
                            if (argument.openingElement.selfClosing == false && argument.children.length > 0) {
                                argument.children.map((child, i) => {
                                    childLoc.push(child.loc)
                                })
                            }
                            analyseAttributeInJsx(haff, ele, argument.loc, content, childLoc);
                            //获取第三层元素
                            if (argument.children && argument.children.length > 0) {
                                var childSet = argument.children
                                for (var i = 0; i < childSet.length; i++) {
                                    var child = childSet[i];

                                    if (child.type == 'JSXElement')//JSX元素
                                    {
                                        var ele = child.openingElement;
                                        var name = ele.name.name;
                                        var prefix1 = haff
                                        var node = json;
                                        haff.map((pa, i) => {
                                            node = node[pa]
                                        });
                                        //只有当本元素为Text时才提取
                                        if (name == 'Text') {
                                            if (child.selfClosing != true || (child.children && child.children.length > 0))//非自闭合
                                            {

                                                if (content == null)
                                                    content = ''
                                                child.children.map((arg, k) => {
                                                    var origin = null
                                                    if (arg.type == 'JSXText')//纯文本
                                                    {
                                                        origin = arg.value;
                                                        origin = origin.trimLeft()
                                                        origin = origin.trimRight()
                                                        content += origin
                                                    } else if (arg.type == 'JSXExpressionContainer')//jsx{}
                                                    {
                                                        content += '{' + arg.expression.extra.raw + '}'
                                                    }

                                                })

                                            }
                                        }
                                        //获取childLoc
                                        var childLoc = []
                                        if (ele.selfClosing != true || (child.children && child.children.length > 0)) {
                                            child.children.map((child, i) => {
                                                childLoc.push(child.loc)
                                            })
                                        }

                                        if (node.children) { }
                                        else {
                                            node.children = [];
                                        }
                                        var haff1 = prefix1.concat('children').concat(node.children.length)
                                        analyseAttributeInJsx(haff1, ele, child.loc, content, childLoc);
                                        //获取第四层元素
                                        traverseInJsx4(haff1, child)
                                    }
                                }


                            }

                        }
                    });

                } else if (statement.type == 'VariableDeclaration')//声明
                {
                    var declarations = statement.declarations;

                    declarations.map((declar, i) => {
                        var name = null;
                        var value = null;
                        if (declar.id.type == 'Identifier')//声明
                        {
                            name = declar.id.name;
                        }
                        //初始化
                        if (declar.init.type == 'StringLiteral')//字符串初始化
                        {
                            value = { value: declar.init.value, type: 'StringLiteral' };
                        } else if (declar.init.type == 'NumericLiteral')//数字初始化
                        {
                            value = { value: declar.init.value, type: 'NumericLiteral' };
                        } else if (declar.init.type == 'JSXElement')//jsx初始化
                        {
                            var ele = null;

                            ele = declar.init.openingElement;
                            var attributes = null;
                            if (declar.init.openingElement.attributes && declar.init.openingElement.attributes.length > 0) {
                                attributes = {};
                                declar.init.openingElement.attributes.map((attr, j) => {
                                    var attrName = null;
                                    var attrValue = null;
                                    if (attr.name.type == 'JSXIdentifier')
                                        attrName = attr.name.name;
                                    if (attr.value.type == 'StringLiteral')
                                        attrValue = attr.vale.value;
                                    else if (attr.value.type == 'JSXExpressionContainer')//expression
                                    {
                                        if (attr.value.expression.type == 'NumericLiteral')
                                            attrValue = '{' + attr.value.expression.value + '}';
                                        else if (attr.value.expression.type == 'StringLiteral')
                                            attrValue = '{\'' + attr.value.expression.value + '\'}';
                                        else if (attr.value.expression.type == 'Identifier')
                                            attrValue = '{' + attr.value.expression.name + '}';
                                    }
                                    attributes[attrName] = {
                                        value: attrValue, loc: {
                                            start: { line: attr.value.loc.start.line, column: attr.value.loc.start.column + 1 },
                                            end: { line: attr.value.loc.end.line, column: attr.value.loc.end.column - 1 }
                                        }, type: attr.value.type == 'StringLiteral' ? 'StringLiteral' : attr.value.expression.type
                                    };
                                });
                            }
                            value = { type: 'JSXElement', name: ele.name.name, attributes: attributes };

                        } else if (declar.init.type == 'NullLiteral') {
                            value = null
                        }

                        dictionary[name] = value;//往字典里赋值

                    });
                }
                else if (statement.type == 'IfStatement') //条件块
                {
                    var { consequent, alternate } = statement
                    if (consequent.body && consequent.body.length > 0) {
                        consequent.body.map((node, k) => {
                            if (node.type == 'VariableDeclaration')//声明
                            {

                            }
                            else if (node.type == 'ExpressionStatement')//操作
                            {
                                var expression = node.expression
                                if (expression.operator == '=' && expression.type == 'AssignmentExpression')//赋值
                                {
                                    var operated = expression.left//被操作数
                                    var operand = expression.right//操作数
                                    var name = ''
                                    var value = null
                                    //处理被操作数的名称
                                    switch (operated.type) {
                                        case 'Identifier':
                                            name = operated.name
                                            break;
                                    }

                                    //处理操作数的名称和属性
                                    var attributes = null
                                    if (operand.type == 'JSXElement') {
                                        var ele = operand.openingElement
                                        if (ele.attributes && ele.attributes.length > 0) {
                                            attributes = {}
                                            ele.attributes.map((attr, j) => {
                                                var attrName = null;
                                                var attrValue = null;
                                                if (attr.name.type == 'JSXIdentifier')
                                                    attrName = attr.name.name;
                                                if (attr.value.type == 'StringLiteral')
                                                    attrValue = attr.vale.value;
                                                else if (attr.value.type == 'JSXExpressionContainer')//expression
                                                {
                                                    if (attr.value.expression.type == 'NumericLiteral')
                                                        attrValue = '{' + attr.value.expression.value + '}';
                                                    else if (attr.value.expression.type == 'StringLiteral')
                                                        attrValue = '{\'' + attr.value.expression.value + '\'}';
                                                    else if (attr.value.expression.type == 'Identifier')
                                                        attrValue = '{' + attr.value.expression.name + '}';
                                                    else if (attr.value.expression.type == 'BooleanLiteral')
                                                        attrValue = attr.value.expression.value
                                                    else if (attr.value.expression.type == 'CallExpression') {
                                                        var callee = attr.value.expression.callee
                                                        var args = attr.value.expression.arguments
                                                        var argStr = ''
                                                        args.map((arg, z) => {
                                                            if (arg.type == 'ThisExpression')
                                                                argStr += 'this'
                                                            else if (arg.type == 'Identifier')
                                                                argStr += arg.name
                                                            if (z != args.length - 1)
                                                                argStr += ','
                                                        })

                                                        var callStr = ''

                                                        var ob = callee
                                                        while (ob.type == 'MemberExpression') {
                                                            if (ob.property.type == 'Identifier')
                                                                callStr = '.' + ob.property.name + callStr
                                                            ob = ob.object
                                                        }
                                                        if (ob.type == 'Identifier')
                                                            callStr = ob.name + callStr
                                                        else if (ob.type == 'ThisExpression')
                                                            callStr = 'this' + callStr


                                                        attributes[attrName] = { value: callStr + '(' + argStr + ')', callee: callee, arguments: args }
                                                    }
                                                }
                                                if (attr.value.expression && attr.value.expression.type == 'CallExpression') { }
                                                else
                                                    attributes[attrName] = attrValue;
                                            });
                                        }

                                    }

                                    value = { type: 'JSXElement', name: name, attributes: attributes }

                                    dictionary[name] = value
                                }
                            }
                        })
                    }
                }
                else if (statement.type == 'ExpressionStatement') //操作语句
                {
                    var expression = statement.expression;
                    if (expression.operator == '=' && expression.type == 'AssignmentExpression')//赋值
                    {
                        var left = expression.left;
                        var right = expression.right;
                        var name = left.name;
                        var value = null;
                        if (right.type == 'NullLiteral') { }
                        else if (right.type == 'StringLiteral')//字符串初始化
                        {
                            value = { type: 'StringLiteral', value: right.value };
                        }
                        else if (right.type == 'NumericLiteral')//数字初始化
                        {
                            value = { type: 'NumericLiteral', value: right.vale };
                        }
                        else if (right.type == 'JSXElement')//jsx的赋值
                        {
                            var ele = null;

                            ele = right.openingElement;
                            var attributes = null;
                            if (right.openingElement.attributes && right.openingElement.attributes.length > 0) {
                                attributes = {};
                                right.openingElement.attributes.map((attr, j) => {
                                    var attrName = null;
                                    var attrValue = null;
                                    if (attr.name.type == 'JSXIdentifier')
                                        attrName = attr.name.name;
                                    if (attr.value.type == 'StringLiteral')
                                        attrValue = attr.vale.value;
                                    else if (attr.value.type == 'JSXExpressionContainer')//expression
                                    {
                                        if (attr.value.expression.type == 'NumericLiteral')
                                            attrValue = '{' + attr.value.expression.value + '}';
                                        else if (attr.value.expression.type == 'StringLiteral')
                                            attrValue = '{\'' + attr.value.expression.value + '\'}';
                                        else if (attr.value.expression.type == 'Identifier')
                                            attrValue = '{' + attr.value.expression.name + '}';
                                    }
                                    attributes[attrName] = attrValue;
                                });
                            }
                            value = { type: 'JSXElement', name: ele.name.name, attributes: attributes }
                        }
                        dictionary[name] = value;
                    }
                }
            });
            //console.log(JSON.stringify(json));
        }


        //优先处理类的全局变量,该内容单独保存在dictionary键
        parsed.program.body.map(function (node, i) {
            if (node.type == 'VariableDeclaration') {

                var declarations = node.declarations

                declarations.map((declaration, i) => {
                    var name = declaration.id.name
                    var declarationOb = {};
                    var arguments = declaration.init.arguments
                    if (declaration.id.type == 'ObjectPattern') {
                        declaration.id.properties.map((property, k) => {

                            var varName = property.key.name
                            var propOb = {}
                            arguments.map((argument, j) => {
                                if (argument.type == 'StringLiteral')//初始化传参为字符串
                                {
                                    var arg = argument.value
                                    dictionary[varName] = [arg].concat(varName)
                                }
                            })
                        })


                    } else {
                        name = declaration.id.name
                        if (arguments && arguments.length > 0) {
                            arguments.map((argument, j) => {

                                if (argument.properties && argument.properties.length > 0) {
                                    argument.properties.map((prop, k) => {
                                        var propName = prop.key.name
                                        var propOb = {}
                                        if (prop.value.properties && prop.value.properties.length > 0) {
                                            prop.value.properties.map((propVal, z) => {
                                                var valName = propVal.key.name
                                                var valValue = propVal.value.value
                                                propOb[valName] = valValue
                                            })
                                            declarationOb[propName] = propOb
                                        }
                                    })
                                } else {
                                    dictionary[name] = argument.value
                                }

                            })
                        }
                        dictionary[name] = declarationOb
                    }



                })
            }
        })


        parsed.program.body.map(function (node, i) {
            if (node.type == 'ImportDeclaration')//声明语句
            {

                if (node.source.type == 'StringLiteral')//字符串的源
                {

                    //查看是模块名还是路径
                    var font = null
                    if (node.source.value && node.source.value.indexOf('react-native-vector-icons') != -1) {
                        var fontReg = /.*\/(.*)?$/
                        if (fontReg.exec(node.source.value) && fontReg.exec(node.source.value) != null)
                            font = fontReg.exec(node.source.value)[1]
                    }
                    var declarations = null
                    if (node.specifiers && node.specifiers.length > 0) {
                        declarations = []
                        node.specifiers.map((specify, k) => {
                            if (specify.local)
                                declarations.push(specify.local.name)
                        })
                    }

                    imports.push({
                        range: {
                            start: { line: node.source.loc.start.line, column: node.source.loc.start.column + 1 },
                            end: { line: node.source.loc.end.line, column: node.source.loc.end.column - 1 }
                        },
                        name: node.source.value,
                        declarations: declarations,
                        font: font
                    });
                }
            }
            else if (node.type == 'ClassDeclaration')//类声明
            {
                var componentName = node.id.name;
                var body = node.body;
                body.body.map((method, i) => {
                    if (method.type == 'ClassMethod')//类方法
                    {
                        var methodName = method.key.name
                        if (methodName == 'render')//render
                        {
                            extractInfo(method);
                            classMethods['render'] = { methodName:'render', loc: method.loc }
                        } else {
                            if (method.body) {
                                var element = null
                                var ui = null
                                if (method.body.body && method.body.body.length > 0) {
                                    var returnBody = null
                                    var returnName = null
                                    var node = method.body.body[method.body.body.length - 1]
                                    if (node.type == 'ReturnStatement') {
                                        if (node.argument.type == 'Identifier')
                                            returnName = node.argument.name
                                        else if (node.argument.type == 'JSXElement')//直接返回ui,故接下来的returnName将为空
                                        {
                                            ui = analyseUI(node.argument, classMethods, ranges, methodName)//ranges负责提示高亮
                                        }
                                    }
                                    if (returnName != null) {
                                        //查看是否返回变量经过赋值
                                        for (var y = method.body.body.length - 2; y >= 0; y--) {
                                            var nodeI = method.body.body[y]
                                            if (nodeI.type == 'VariableDeclaration') {
                                                for (var x = 0; x < nodeI.declarations.length; x++) {
                                                    var declare = nodeI.declarations[x]
                                                    if (declare.id.type == 'Identifier' && declare.id.name == returnName) {
                                                        if (declare.init.type == 'ArrayExpression')//非ui赋值
                                                            continue
                                                        element = declare.init
                                                        //分析其ui
                                                        ui = analyseUI(element, classMethods, ranges, methodName)
                                                        break
                                                    }
                                                }

                                            }
                                        }
                                    }

                                }

                                classMethods[methodName] = { methodName, loc: method.loc, childLoc: method.body.loc, element, ui }
                            } else {
                                classMethods[methodName] = { methodName, loc: method.loc }
                            }
                        }

                    }
                });
            }
            else if (node.type == 'ExportDefaultDeclaration')//导出语句,loc字段显示范围
            {
                var declaration = node.declaration;
                if (declaration.type == 'ClassDeclaration' && declaration.superClass && declaration.superClass.name == 'Component')//React类
                {
                    var componentName = declaration.id.name;

                    var body = declaration.body;
                    body.body.map((property, i) => {
                        if (property.type == 'ClassMethod')//类方法
                        {
                            var methodName = property.key.name;

                            if (methodName == 'render')//渲染部分
                            {
                                extractInfo(property)
                                //console.log(JSON.stringify(json));
                            }
                            if (property.body) {
                                classMethods[methodName] = { methodName, loc: property.loc, childLoc: property.body.loc }
                            } else {
                                classMethods[methodName] = { methodName, loc: property.loc }
                            }
                        }
                    });
                }
            } else {

            }
        });

        resolve({ re: 1, data: { body: json, ranges: ranges, imports: imports, dictionary: dictionary, classMethods: classMethods } });

    });
}

