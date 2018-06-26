
import Middleware from '../Middleware'

/**
 * Middleware for editing monaco ranges and apply content edit
 */
class MonacoMiddleware extends Middleware {

    constructor() {
        super()
        this.getIndentInLine.bind(this)
        this.convertTemplateByIndent.bind(this)
    }

    bindEditor(editor) {
        this._editor = editor
    }

    get editor() {
        if (!this._editor) {
            throw new Error('Middleware not property initialized with dispatch function')
        }
        return this._editor
    }

    appendDecorations(olds, news) {
        if (!this._editor) {
            throw new Error('Middleware not properly initialized with editor')
        }
        this._editor.deltaDecorations(olds, news)
    }

    executeEdits(operations) {
        if (!this._editor) {
            throw new Error('monaco middleware not property initialized with editor ')
        } else if (operations == undefined || operations == null) {
            throw new Error('operatios not properly set')
        } else {
            var ops = []
            operations.map((op, j) => {
                var { range, content } = op
                var statement = {
                    identifier: 'modify',
                    range: range,
                    text: content,
                    forceMoveMarkers: false
                }
                ops.push(statement)
            })
        }
        this._editor.executeEdits('danding', ops);
    }

    /**
     * switch the contents of two components
     */
    switchContent(loc1, loc2) {

        var editor = this._editor
        var lines1 = [];
        var lines2 = [];
        var decorations1 = []
        var decorations2 = []
        var tempLocs = []
        for (var i = loc1.start.line; i <= loc1.end.line; i++) {
            lines1.push(i)
            var lineDecorations = editor.getModel().getLineDecorations(i)
            if (lineDecorations && lineDecorations.length > 0) {
                decorations1.push({ multiple: lineDecorations })
                //去除影响行的所有decoration
                lineDecorations.map((lineDecoration, k) => {
                    editor.deltaDecorations([lineDecoration.id], [])
                })
            }
        }

        for (var j = loc2.start.line; j <= loc2.end.line; j++) {
            lines2.push(j)
            var lineDecorations = editor.getModel().getLineDecorations(j)
            if (lineDecorations && lineDecorations.length > 0) {
                decorations2.push({ multiple: lineDecorations })
                lineDecorations.map((lineDecoration, k) => {
                    editor.deltaDecorations([lineDecoration.id], [])
                })
            }
        }


        var line1 = editor.getModel().getValueInRange(new monaco.Range(loc1.start.line, loc1.start.column + 1, loc1.end.line, loc1.end.column + 1))
        var line2 = editor.getModel().getValueInRange(new monaco.Range(loc2.start.line, loc2.start.column + 1, loc2.end.line, loc2.end.column + 1))
        this.executeEdits([
            { range: new monaco.Range(loc2.start.line, loc2.start.column + 1, loc2.end.line, loc2.end.column + 1), content: line1 },
            { range: new monaco.Range(loc1.start.line, loc1.start.column + 1, loc1.end.line, loc1.end.column + 1), content: line2 },
        ])





        //TODO:re-append the decorations
        var wholeDecorations = editor.getModel().getAllDecorations();
        //config offset
        var offset_margin = loc2.start.line - loc1.end.line
        var newDecorations = [];
        //decorations1存放loc1的decorations
        decorations1.map((decoration, i) => {
            var multiple = decoration.multiple
            multiple.map((single, j) => {
                if (loc1.start.line < loc2.start.line)//loc1位于之上,替换后将跑到下方
                {

                    single.range.startLineNumber = loc2.end.line - loc2.start.line + offset_margin + single.range.startLineNumber
                    single.range.endLineNumber = loc2.end.line - loc2.start.line + offset_margin + single.range.endLineNumber
                } else {
                    //loc1位于之下,替换后跑到上方
                    single.range.startLineNumber = loc2.start.line + single.range.startLineNumber - loc1.start.line
                    single.range.endLineNumber = loc2.start.line + single.range.endLineNumber - loc1.start.line
                }

                newDecorations.push(single)
            })

        });

        //decorations2存放loc2的decorations
        decorations2.map((decoration, i) => {
            var multiple = decoration.multiple
            multiple.map((single, j) => {
                if (loc2.start.line > loc1.start.line)//loc1位于loc2之上
                {
                    single.range.startLineNumber = loc1.start.line + single.range.startLineNumber - loc2.start.line
                    single.range.endLineNumber = loc1.start.line + single.range.endLineNumber - loc2.start.line
                } else {
                    //loc2位于其上
                    single.range.startLineNumber = loc1.start.line + single.range.startLineNumber - loc2.start.line
                    single.range.endLineNumber = loc1.start.line + single.range.endLineNumber - loc2.start.line
                }
                newDecorations.push(single)
            })
        })

        if (loc1.start.line < loc2.start.line)//loc1位于loc2上方
        {
            //新的loc1位置
            tempLocs.push({
                start: {
                    line: loc2.end.line - loc2.start.line + offset_margin + loc1.start.line,
                    column: loc2.start.column
                },
                end: {
                    line: loc2.end.line - loc2.start.line + offset_margin + loc1.end.line,
                    column: loc1.end.column
                }
            })

            //新的loc2位置
            tempLocs.push({
                start: {
                    line: loc1.start.line,
                    column: loc1.start.column
                },
                end: {
                    line: loc1.start.line + loc2.end.line - loc2.start.line,
                    column: loc2.end.column
                }
            })
        } else {

        }

        //add decorations
        this.appendDecorations(wholeDecorations, newDecorations)
        return tempLocs
    }

    /**
     * 取消cursorDecoration
     */
    cancelCursorDecoration(cursorDecoration) {
        if (cursorDecoration) {
            var editor = this._editor
            editor.deltaDecorations(cursorDecoration, [])
        }
    }

    /**
     * 更新cursorDecoration
     */
    updateCursorDecoration(cursorDecoration, x, y) {
        var editor = this._editor
        var decoration = []
        if (cursorDecoration) {
            decoration = cursorDecoration
        }
        else { }
        var mouseTarget = editor.getTargetAtClientPoint(x, y)
        if (mouseTarget) {
            console.log('range=>' + mouseTarget.range)
            decoration = editor.deltaDecorations(decoration, [{ range: mouseTarget.range, options: { isWholeLine: false, className: 'cursor-decoration' } }])
            return decoration
        } else {
            return null
        }
    }

    /**
     * 根据decoration获取range
     * 
     */
    getRangeFromDecorationId(decorationId) {
        var editor = this._editor
        return editor.getModel().getDecorationRange(decorationId)
    }

    /**
     * 计算行首indent
     */
    getIndentInLine(line) {
        var indent = 0
        var editor = this._editor
        var firstNotWhiteSpaceColumn = editor.getModel().getLineFirstNonWhitespaceColumn(line)
        var content = editor.getModel().getLineContent(line)
        if (firstNotWhiteSpaceColumn > 0)
            content = content.substring(0, firstNotWhiteSpaceColumn - 1)
        content.replace(/\t/g, '  ')
        indent = content.length
        return indent
    }

    convertTemplateByIndent(template, indent, range) {
        var strTemplate = ''
        var previousBlank = ''
        var { line, column } = range
        for (var j = 0; j < indent; j++)
            previousBlank += ' '
        var lines = template.split('\n')
        var prefix = this._editor.getModel().getValueInRange(new monaco.Range(range.line, 0, range.line, column))
        var suffix = this._editor.getModel().getWordAtPosition({ lineNumber: range.line, column: column + 1 })
        var blankBeforeInsert = false
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i]
            if (line == '') {
                strTemplate += '\n'
            } else {
                //成立的前提是插入处前缀为空格
                if (i == 0 && column != 0 && prefix.trim().length == 0) {
                    strTemplate += line + '\n'
                    blankBeforeInsert = true
                } else {
                    strTemplate += previousBlank + line + '\n'
                }
            }
            if (i == lines.length - 1 && suffix.word.trim().length != 0 && blankBeforeInsert)//插入处前面为空格，后面为字符
                strTemplate += previousBlank

        }
        return strTemplate

    }

    /**
     * 自动计算插入处的indent，并完成代码文本的偏移转换
     * 不进行插入处的文本判断，即不自动换行
     * 结尾不插入换行
     * @method insertTemplate
     * @param {*} range 
     * @param {*} template 
     */
    insertTemplate(range, template) {
        var { line, column } = range
        var indent = 0
        var strTemplate = ''
        indent = this.getIndentInLine(line)
        strTemplate = this.convertTemplateByIndent(indent)
        //进行插入
        this.executeEdits([{ range: new monaco.Range(line, column, line, column), content: strTemplate }])
    }

    /**
     * 批量的生成类方法的新内容
     * @param {*} inserts 
     */
    insertClassMethodsInBatch(inserts) {
        if (inserts && inserts.length > 0) {
            var edits = []
            var getIndentInLine = this.getIndentInLine.bind(this)
            var convertTemplateByIndent = this.convertTemplateByIndent.bind(this)
            inserts.map((inserted, i) => {
                var { range, template } = inserted
                var { line, column } = range
                var indent = getIndentInLine(line)
                var strTemplate = convertTemplateByIndent(template, indent, range)
                debugger
                debugger
                console.log()
                edits.push({ range: new monaco.Range(line, column, line, column), content: strTemplate })
            })
            debugger
            debugger
            this.executeEdits(edits)
        }
    }


    /**
     * 专门为代码片拽入提供代码转换
     * @param {*} range 
     * @param {*} template 
     */
    convertCodeTemplateForCodeDrop(range, template) {
        var { startLineNumber, startColumn } = range
        var editor = this._editor
        var indent = 0  //缩进
        var column = editor.getModel().getLineFirstNonWhitespaceColumn(startLineNumber)
        var strTemplate = ''//转换后的代码模板
        var previousBlank = ''

        //增加开标签的缩进,判断是否为开标签
        var blankReg = /([^\t|\s])/
        var isSelfOpen = false//默认为开标签
        var indentAdjustEnable=false//自动缩进调整 -> false
        if (column == 0)//插入行为空
        {
            if (startColumn == 1)//首列插入,自动缩进
            {
                indentAdjustEnable=true
                for (var j = startLineNumber - 1; j >= 1; j--) {
                    var content = editor.getModel().getLineContent(j)
                    if (blankReg.exec(content) && blankReg.exec(content)[1])//非空行
                    {
                        //总共要处理三种情况 -> 1).开标签，增加缩进  2).闭标签,默认缩进  3).非标签性文本,默认缩进
                        var suffix = content.trimRight()
                        var firstColumn = editor.getModel().getLineFirstNonWhitespaceColumn(j)
                        //形若<xxx>的元素为开标签
                        if (suffix[suffix.length - 1] == '>' && suffix[suffix.length - 2] != '/' && suffix[firstColumn - 1] == '<' && suffix[firstColumn] != '/')
                            isSelfOpen = true
                        //获取indent   
                        var previous = editor.getModel().getValueInRange(new monaco.Range(j, 1, j, firstColumn))
                        previous.replace(/\t/g, '  ')
                        indent = previous.length
                        break;
                    }
                }
            } else //不进行缩进调整
            {
                indent=startColumn-1
            }
        } else //不进行缩进调整
        {
            
        }



        for (var k = 0; k < indent; k++)
            previousBlank += ' '
        if (isSelfOpen == true)
            previousBlank += '    '     //默认缩进4格为1单位
        var lines = template.split('\n')//转换文本
        lines.map((line, i) => {
            if(i==0&&indentAdjustEnable!=true)
            {}
            else
                strTemplate += previousBlank
            strTemplate += line
            if (i != lines.length - 1)
                strTemplate += '\n'
        })
        return strTemplate
    }


    /**
     * 代码转换,插入indent等操作
     */
    convertCodeTemplate(range, template, ploc) {
        var { startLineNumber, startColumn } = range
        var { pline, pcolumn } = ploc
        var editor = this._editor
        var indent = 0
        var pindent = 0
        var column = editor.getModel().getLineFirstNonWhitespaceColumn(startLineNumber)
        var strTemplate = ''//转换后的代码模板
        var previousBlank = ''

        if (column != 0)//存在空格或者tab键,方案获取当前editor的默认tabSize,将\t->\s,再计算个数
        {
            //batch 1,column+2->column
            var content = editor.getModel().getValueInRange(new monaco.Range(startLineNumber, 1, startLineNumber, column))
            content.replace(/\t/g, '  ')
            indent = content.length

            for (var j = 0; j < indent; j++)
                previousBlank += ' '

            if (ploc) {
                var pTagContent = editor.getModel().getValueInRange(new monaco.Range(pline, 1, pline, pcolumn))
                pTagContent.replace(/\t/g, '  ')
                //父元素的缩进值
                pindent = pTagContent.length
                previousBlank = ''
                for (var j = 0; j < pindent; j++)
                    previousBlank += ' '
            }



            //插入不根据父元素的位置进行插入而是根据同级子元素的相邻位置进行插入
            //增加邻接jsx元素的判断
            var isSelfOpen = false
            var isEndAdjacent = false//作为插入处元素的同级元素进行插入
            //获取插入行包括缩进到前2个字符的内容
            content = editor.getModel().getValueInRange(new monaco.Range(startLineNumber, 1, startLineNumber, column + 2))
            var _content = content.trimRight()
            if (_content[_content.length - 2] == '<' && _content[_content.length - 1] == '/') {
                previousBlank += '    '
                isEndAdjacent = true
            }
            if (_content[_content.length - 1] == '>' && _content[_content.length - 2] != '/') {
                previousBlank += '    '
                isSelfOpen = true
            }
            if (_content[_content.length - 2] == '<' && _content[_content.length - 1] != '/') {
                previousBlank += '    '
                isSelfOpen = true
            }


            //确定所插入的位置前是否有文本，如有则加入换行符
            var changeLine = false
            if (column == range.startColumn) {
            }
            else {
                changeLine = true
            }
            //对于代码片进行位移 

            if (changeLine == true)
                strTemplate += '\n'
            var lines = template.split('\n')
            lines.map((line, i) => {
                if (line != '') {
                    if (i != 0)
                        strTemplate += previousBlank
                    else if (i == 0) {
                        if (isEndAdjacent == true)
                            strTemplate += previousBlank
                        else {
                            strTemplate += previousBlank
                        }
                    }
                    strTemplate += line
                    if (i != lines.length - 1)
                        strTemplate += '\n'
                }
            })
            //如果邻近父元素的结尾标签，则增加空格保持结尾标签排版照常
            if (isEndAdjacent) {
                strTemplate += previousBlank.substring(4, previousBlank.length)
            }

            //what does this make for?
            //如果最后一个转换后的模板代码为换行，并且插入的父元素为开标签，需将换行剔除
            // if (strTemplate[strTemplate.length - 1] == '\n' && isSelfOpen == true)
            //     strTemplate = strTemplate.substring(0, strTemplate.length - 1)

        } else {
            //增加开标签的缩进,判断是否为开标签
            var blankReg = /([^\t|\s])/
            var isSelfOpen = true//默认为开标签
            for (var j = startLineNumber - 1; j >= 1; j--) {
                var content = editor.getModel().getLineContent(j)
                if (blankReg.exec(content) && blankReg.exec(content)[1])//非空行
                {
                    var suffix = content.trimRight()
                    if (suffix[suffix.length - 1] == '>' && suffix[suffix.length - 2] == '/')
                        isSelfOpen = false
                    //获取indent   
                    var firstColumn = editor.getModel().getLineFirstNonWhitespaceColumn(j)
                    var previous = editor.getModel().getValueInRange(new monaco.Range(j, 1, j, firstColumn))
                    previous.replace(/\t/g, '  ')
                    indent = previous.length
                    break;
                }
            }
            for (var k = 0; k < indent; k++)
                previousBlank += ' '
            if (isSelfOpen == true)
                previousBlank += '    '
            var lines = template.split('\n')
            lines.map((line, i) => {
                strTemplate += previousBlank
                strTemplate += line
                if (i != lines.length - 1)
                    strTemplate += '\n'
            })
        }
        return strTemplate

    }

    isReplacedInExpression(range) {
        var editor = this._editor
        var { startLineNumber, startColumn, endLineNumber, endColumn } = range
        var prevContent = editor.getModel().getValueInRange(new monaco.Range(startLineNumber, 1, startLineNumber, startColumn))
        var nextContent = editor.getModel().getValueInRange(new monaco.Range(endLineNumber, endColumn, endLineNumber, 1000))
        if (prevContent.trim() != '' || nextContent.trim() != '')
            return true
        else
            return false
    }

    /**
     * 插入代码
     */
    insertCodeTemplate(range, template) {
        var strTemplate = this.convertCodeTemplateForCodeDrop(range, template)
        var { startLineNumber, startColumn } = range
        this.executeEdits([{ range: new monaco.Range(startLineNumber, startColumn, startLineNumber, startColumn), content: strTemplate }])
    }

    /**
     * 批量插入代码
     */
    insertCodeTemplateInBatch(inserts) {
        if (inserts && inserts.length > 0) {
            var edits = []
            for (let i = 0; i < inserts.length; i++) {
                var insert = inserts[i]
                var { ploc, range, text, deleted } = insert
                var strTemplate = this.convertCodeTemplate(range, text, ploc)
                var { startLineNumber, startColumn, endLineNumber, endColumn } = range
                if (deleted == true) {
                    if (this.isReplacedInExpression(range))//what does this mean?
                        edits.push({ range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn), content: strTemplate })
                    else
                        edits.push({ range: new monaco.Range(startLineNumber, 1, endLineNumber + 1, 1), content: strTemplate })
                }
                else
                    edits.push({ range: new monaco.Range(startLineNumber, startColumn, startLineNumber, startColumn), content: strTemplate })
            }
            if (edits && edits.length > 0)
                this.executeEdits(edits)
        }
    }




}

const middleware = new MonacoMiddleware()

export default (dispatch, editor) => {
    //do enhance
    middleware.dispatch = dispatch
    middleware.bindEditor(editor)
    return middleware
}


