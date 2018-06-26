import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import reactCSS from 'reactcss'
import _ from 'lodash';
import 'react-select/dist/react-select.css';
import { SketchPicker, ChromePicker } from 'react-color';
import {
    updateDocStyle,
    updateCustomProperty
} from '../../actions/paletteActions';
import ArrayUtils from '../../utils/ArrayUtils'
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import {
    makeClassMethodDirty, makeClassMethodClean
} from '../../actions/editorActions'
import {
    makeFieldsRodalVisible,
    makeListViewTemplateRodalVisible,
    makeRenderRowRodalVisible,
    makeRenderRowRodalUnVisible
} from '../../actions/rodalActions'


/**
 *  负责组件属性的刷出
 */
class Properties extends Component {



    onCustomPropertyChange(key, value) {
        var { haff } = this.props
        var path = haff.concat('attributes').concat(key)


        //更新components属性
        this.props.dispatch(updateCustomProperty(path, value))
        //更新代码

        var { decorationsMap, editor, haff, middleware } = this.props
        var monacoMiddleware = middleware.monaco
        debugger
        decorationsMap.map((decoration, i) => {

            if (ArrayUtils.compare(decoration.key, path) == true) {
                var id = decoration.decorationId
                //通过decorationId获取range
                var range = editor.getModel().getDecorationRange(id)
                var valueStr = null
                if (Object.prototype.toString.call(value) == '[object Object]') {
                    if (key == 'content')
                        valueStr = value.value
                    else
                        valueStr = JSON.stringify(value)
                }
                else
                    valueStr = value
                monacoMiddleware.executeEdits([{ range, content: valueStr }])
            }
        })
    }


    //根据decoration改变style属性
    onStyleChange(style) {

        //更改width的复杂属性值为字面值
        var style_1 = _.cloneDeep(style)
        if (style_1.width && Object.prototype.toString.call(style_1.width) == '[object Object]') {

            if (style_1.width.type == 'BinaryExpression') {
                style_1.width = style_1.width.left + style_1.width.operator + style_1.width.right
            }
        }

        var { decorationsMap, editor, haff, middleware } = this.props
        var monacoMiddleware = middleware.monaco

        var path = haff.concat('attributes').concat('style')
        //进行文本更改
        decorationsMap.map((decoration, i) => {

            if (ArrayUtils.compare(decoration.key, path) == true) {
                var id = decoration.decorationId
                //通过decorationId获取range
                var range = editor.getModel().getDecorationRange(id)
                debugger

                var styleStr = JSON.stringify(style_1)
                //从styleStr中转换关于width以及width表达式的double quote
                var styleWidthReg = /\:\"width\"/
                var widthReg1 = /\:\"width([\*|\/|\+\-]\d+){1,}\"/
                var widthReg2 = /\:\"width([\*|\/|\+\-]\d+){0,}([\*|\/|\+|\-]{1,})\"/
                if (styleWidthReg.exec(styleStr) != null)
                    styleStr = styleStr.replace(styleWidthReg, ':width')
                else if (widthReg1.exec(styleStr) != null) {
                    var matched = widthReg1.exec(styleStr)[0]
                    matched = matched.replace(/\"/g, '')
                    styleStr = styleStr.replace(widthReg1, matched)
                }
                else if (widthReg2.exec(styleStr) != null) {
                    var matched = widthReg1.exec(styleStr)[0]
                    matched = matched.replace(/\"/g, '')
                    styleStr = styleStr.replace(widthReg2, matched)
                }


                monacoMiddleware.executeEdits([{ range, content: styleStr.substring(1, styleStr.length - 1) }])
            }
        })
        
        //TODO:更新components属性
        this.props.dispatch(updateDocStyle(path, '{' + JSON.stringify(style) + '}'))

    }

    constructor(props) {
        super(props)

        this.state = {
            basic: props.basic ? props.basic : null,
            optional: props.optional ? props.optional : null,
            propertyMap: props.propertyMap ? props.propertyMap : null,
            colorPicker: false,
            backgroundColorPicker: false,
            paddingPicker: false,
            width: '',
            height:''
        }
    }

    componentWillReceiveProps(nextProps) {
        var props = {};
        var propertyMap = nextProps.propertyMap
        if (this.props.propertyMap !== nextProps.propertyMap)
            props.propertyMap = nextProps.propertyMap

        if (this.props.component !== nextProps.component)
            props.component = nextProps.component

        if (propertyMap && propertyMap.style) {

            if (Object.prototype.toString.call(propertyMap.style) == '[object Object]') {
                var style = propertyMap.style
                var widthStr = ''
                if (style && style.width && style.width !== undefined && style.width !== null) {
                    if (Object.prototype.toString.call(style.width) == '[object Object]') {
                        if (style.width.type == 'BinaryExpression') {
                            widthStr = style.width.left + style.width.operator + style.width.right
                        }
                    } else {
                        widthStr = style.width
                    }
                } else {
                }
                props.width = widthStr

                var heightStr=''
                if(style&&style.height&&style.height!==undefined&&style.height!==null)
                {
                    if (Object.prototype.toString.call(style.height) == '[object Object]') {
                        if (style.height.type == 'BinaryExpression') {
                            heightStr = style.height.left + style.height.operator + style.height.right
                        }
                    } else {
                        heightStr = style.height
                    }
                }else{}
                props.height=heightStr
            }
        }


        this.setState(props)
    }

    render() {

        var state = this.state;
        var props = this.props;


        var arr = [];
        var componentName = props.componentName;
        var propertyMap = state.propertyMap;
        var style = null;
        var attributes = null
        if (propertyMap) {
            if (propertyMap.style) {

                if (Object.prototype.toString.call(propertyMap.style) == '[object Object]') {
                    style = propertyMap.style
                } else {
                    var styleStr = propertyMap.style.substring(1, propertyMap.style.length - 1)
                    try {
                        style = JSON.parse(styleStr)
                    } catch (e) {
                        var reg = /^(.*)?\.(.*)$/
                        if (reg.exec(styleStr)) {
                            var member = reg.exec(styleStr)[1]
                            var property = reg.exec(styleStr)[2]
                            if (member && property) {
                                //TODO:look up this member in dictionary
                                var dictionary = props.dictionary
                                style = dictionary[member][property]
                            }
                        }
                    }
                }
            }
        }

        if (props.component && props.component.attributes) {
            attributes = props.component.attributes
        }

        var colorPickerStyle = {}
        var backgroundColorPickerStyle = {}

        if (style && style.color) {
            colorPickerStyle.backgroundColor = style.color
        }
        if (style && style.backgroundColor) {
            backgroundColorPickerStyle.backgroundColor = style.backgroundColor
        }

        var dataSource = null
        if (attributes && attributes.dataSource) {
            dataSource = attributes.dataSource.substring(1, attributes.dataSource.length - 1)
        }

        var renderRow = null
        if (attributes && attributes.dataSource) {
            renderRow = attributes.renderRow.substring(1, attributes.renderRow.length - 1)
        }

        var classMethods = []
        if (props.classMethods && _.keys(props.classMethods).length > 0) {
            classMethods.push(<option value={null} key={-1}>null</option>)
            _.keys(props.classMethods).map((methodName, i) => {
                classMethods.push(<option value={methodName} key={i}>{methodName}</option>)
            })
        }

        //width属性显示
        var widthStr = ''
        if (style && style.width && style.width !== undefined && style.width !== null) {
            if (Object.prototype.toString.call(style.width) == '[object Object]') {
                if (style.width.type == 'BinaryExpression') {
                    widthStr = style.width.left + style.width.operator + style.width.right
                }
            } else {
                widthStr = style.width
            }
        } else {
            widthStr = this.state.width
        }

        if (this.state.width) {
            var widthReg1 = /width([\*|\/|\+\-]\d+){1,}$/
            var widthReg2 = /width([\*|\/|\+\-]\d+){0,}([\*|\/|\+|\-]{1,})$/
            if (widthReg1.exec(this.state.width) != null || widthReg2.exec(this.state.width) != null) {
                widthStr = this.state.width
            }
        }

        //height属性显示
        var heightStr=''
        if (style && style.height && style.height !== undefined && style.height !== null) {
            if (Object.prototype.toString.call(style.height) == '[object Object]') {
                if (style.height.type == 'BinaryExpression') {
                    heightStr = style.height.left + style.height.operator + style.height.right
                }
            } else {
                heightStr = style.height
            }
        } else {
            heightStr = this.state.height
        }

        if (this.state.height) {
            var heightReg1 = /height([\*|\/|\+\-]\d+){1,}$/
            var heightReg2 = /height([\*|\/|\+\-]\d+){0,}([\*|\/|\+|\-]{1,})$/
            if (heightReg1.exec(this.state.height) != null || heightReg2.exec(this.state.height) != null) {
                heightStr = this.state.height
            }
        }
        



        return (
            <div className="Properties" style={Object.assign(styles.container)} >



                <div className="basic" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', border: '2px solid #222' }}>



                    {/*flex*/}
                    {
                        componentName == 'Modal' || componentName == 'Text' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px', fontSize: '16px', color: '#4e94ce' }}>
                                    flex
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={style && style.flex ? style.flex : ''} onChange={(event) => {
                                        if (event.target.value == '')
                                            delete style.flex
                                        else
                                            style.flex = parseInt(event.target.value)
                                        this.onStyleChange(style)
                                    }} />
                                </div>
                            </div>
                    }

                    {/*width*/}
                    {
                        componentName == 'Modal' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px', color: '#2ebfab' }}>
                                    width
                            </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={widthStr} onChange={(event) => {

                                        var widthVal = event.target.value
                                        try {

                                            var widthExpressionReg = /width([\*|\/|\+\-]\d+){1,}$/
                                            var widthReg = /^width$/
                                            //满足width或者width算式
                                            if (widthReg.exec(widthVal) != null || widthExpressionReg.exec(widthVal) != null) {
                                                style.width = widthVal
                                                this.setState({ width: widthVal })
                                                this.onStyleChange(style)
                                            } else {
                                                //单纯的value
                                                var tmp = parseInt(widthVal)
                                                if (!isNaN(tmp)) {
                                                    style.width = tmp
                                                    this.onStyleChange(style)
                                                } else {

                                                    if (widthVal == '') {
                                                        style.width = null
                                                        this.onStyleChange(style)
                                                        this.setState({ width: '' })
                                                    } else {
                                                        this.setState({ width: widthVal })
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            //处理BinaryException
                                            console.error(e)
                                        }
                                    }} />
                                </div>
                            </div>
                    }

                    {/*height*/}
                    {
                        componentName == 'Modal' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px', color: '#2ebfab' }}>
                                    height
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={heightStr} onChange={(event) => {
                                        var heightVal = event.target.value
                                        try {

                                            var heightExpressionReg = /height([\*|\/|\+\-]\d+){1,}$/
                                            var heightReg = /^height$/
                                            //满足height或者height算式
                                            if (heightReg.exec(heightVal) != null || heightExpressionReg.exec(heightVal) != null) {
                                                style.height = heightVal
                                                this.setState({ height: heightVal })
                                                this.onStyleChange(style)
                                            } else {
                                                //单纯的value
                                                var tmp = parseInt(heightVal)
                                                if (!isNaN(tmp)) {
                                                    style.height = tmp
                                                    this.onStyleChange(style)
                                                } else {

                                                    if (heightVal == '') {
                                                        style.height = null
                                                        this.onStyleChange(style)
                                                        this.setState({ height: '' })
                                                    } else {
                                                        this.setState({ height: heightVal })
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            //处理BinaryException
                                            console.error(e)
                                        }
                                    }} />
                                </div>
                            </div>
                    }



                    {/*flexDirection*/}
                    {
                        componentName == 'Modal' || componentName == 'Text' || componentName == 'ScrollView' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    flexDirection
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '2 1 auto', justifyContent: 'flex-end', paddingRight: '32px' }}>

                                    <select value={style && style.flexDirection ? style.flexDirection : ''} onChange={(event) => {
                                        //选中类型
                                        style.flexDirection = event.target.value;
                                        this.onStyleChange(style)
                                    }}>>

                                        <option value="row">row</option>
                                        <option value="column">column</option>
                                    </select>


                                </div>
                            </div>
                    }

                    {/*justifyContent*/}
                    {
                        componentName == 'Modal' || componentName == 'Text' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    justifyContent
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', justifyContent: 'flex-end', paddingRight: '32px' }}>

                                    <select value={style && style.justifyContent ? style.justifyContent : ''} onChange={(event) => {
                                        //选中类型
                                        if (event.target.value == '')
                                            delete style.justifyContent
                                        else
                                            style.justifyContent = event.target.value;
                                        this.onStyleChange(style)
                                    }}>>
                                        <option value=''>null</option>
                                        <option value="flex-start">flex-start</option>
                                        <option value="center">center</option>
                                        <option value="flex-end">flex-end</option>
                                    </select>
                                </div>
                            </div>
                    }


                    {/*alignItems*/}
                    {
                        componentName == 'Modal' || componentName == 'Text' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    alignItems
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', justifyContent: 'flex-end', paddingRight: '32px' }}>

                                    <select value={style && style.alignItems ? style.alignItems : ''} onChange={(event) => {
                                        //选中类型
                                        if (event.target.value == '')
                                            delete style.alignItems
                                        else
                                            style.alignItems = event.target.value;
                                        this.onStyleChange(style)

                                    }}>>
                                        <option value=''>null</option>
                                        <option value="flex-start">flex-start</option>
                                        <option value="center">center</option>
                                        <option value="flex-end">flex-end</option>
                                    </select>
                                </div>
                            </div>
                    }





                    {/*seperator*/}
                    <div style={{
                        display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '1px',
                        backgroundColor: '#777', marginRight: '2px'
                    }}>
                    </div>

                    <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '35px' }}>
                        <div style={{
                            display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '15px', justifyContent: 'flex-start',
                            fontSize: '15px', color: '#fff'
                        }}>
                            {componentName}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', justifyContent: 'flex-end', paddingRight: '20px' }}>
                        </div>
                    </div>

                    {/*dataSource*/}
                    {
                        componentName == 'ListView' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    dataSource
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>

                                    <select value={dataSource ? dataSource : ''} onChange={(event) => {

                                        var dataSourceStr = event.target.value
                                        this.onCustomPropertyChange('dataSource', '{' + dataSourceStr + '}')
                                    }}>>
                                        <option value=""></option>
                                        <option value="row">row</option>
                                        <option value="column">column</option>
                                    </select>

                                </div>
                            </div> : null
                    }

                    {/*renderRow*/}
                    {
                        componentName == 'ListView' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    renderRow
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', justifyContent: 'flex-end', paddingRight: '32px' }}>

                                    <input type="text" className='border-bottom'
                                        value={attributes && attributes.renderRow ?attributes.renderRow.methodName : ''}
                                        style={{ width: 100, background: 'transparent', borderBottom: '1px solid rgb(111, 195, 223)' }}
                                        onChange={(event) => {
                                            var methodName = event.target.value;
                                            var args = ['rowData', 'sectionId', 'rowId']
                                            this.onCustomPropertyChange('renderRow', { methodName: methodName,ui:{}})
                                            if (methodName != '' && methodName[0] >= 'A' && methodName[0] <= 'z') {
                                                //清除之前设置的所有脏的类方法
                                                this.props.dispatch(makeClassMethodClean(this.props.haff))
                                                //设置该方法为脏标志
                                                this.props.dispatch(makeClassMethodDirty(methodName, this.props.haff))
                                            }
                                        }} />

                                    <select value={attributes && attributes.renderRow ? attributes.renderRow.methodName : ''}
                                        style={{ border: 0, width: 14 }}
                                        onChange={(event) => {

                                            var methodName = event.target.value;
                                            
                                            this.onCustomPropertyChange('renderRow', JSON.stringify({ name: methodName }))
                                            if (methodName != '' && methodName[0] >= 'A' && methodName[0] <= 'z') {
                                                //设置该方法为脏,此语句存在逻辑错误
                                                this.props.dispatch(makeClassMethodDirty(methodName, this.props.haff))
                                            }
                                        }}>>
                                        {classMethods}
                                    </select>
                                </div>
                            </div> : null
                    }

                    {/*listview isCustom*/}
                    {
                        componentName == 'ListView' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    isCustom
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', paddingRight: '32px' }}>

                                    <div className='button no' style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', justifyContent: 'center', alignItems: 'center' }}
                                        onClick={(event) => {
                                            if (attributes.isCustom == true)
                                                this.onCustomPropertyChange('isCustom', false)
                                            event = event || window.event;
                                            event.preventDefault();
                                            event.stopPropagation()
                                        }}
                                    >
                                        {
                                            attributes && attributes.isCustom == true ?
                                                <FontAwesome name='square-o' size={18} color="#ccc" style={{ paddingLeft: 5 }} /> :
                                                <FontAwesome name='check-square-o' size={17} color="#6fc3df" style={{ paddingLeft: 5 }} />
                                        }
                                        {
                                            attributes && attributes.isCustom == true ?
                                                <span style={{ color: '#ccc', marginLeft: 5 }}>no</span> :
                                                <span style={{ color: '#6fc3df', marginLeft: 5 }}>no</span>
                                        }


                                    </div>

                                    <div className='button yes' style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', justifyContent: 'center', alignItems: 'center' }}
                                        onClick={(event) => {
                                            if (attributes.isCustom != true)
                                            {

                                                this.props.dispatch(makeRenderRowRodalVisible(this.props.haff))
                                                this.onCustomPropertyChange('isCustom', true)
                                                event = event || window.event;
                                                event.preventDefault();
                                                event.stopPropagation()
                                            }
                                            

                                            event = event || window.event;
                                            event.preventDefault();
                                            event.stopPropagation()
                                        }}
                                    >
                                        {
                                            attributes && attributes.isCustom == true ?
                                                <FontAwesome name='check-square-o' size={17} color="#6fc3df" style={{ paddingLeft: 5 }} /> :
                                                <FontAwesome name='square-o' size={18} color="#ccc" style={{ paddingLeft: 5 }} />
                                        }
                                        {
                                            attributes && attributes.isCustom == true ?
                                                <span style={{ color: '#6fc3df', marginLeft: 5 }}>yes</span> :
                                                <span style={{ color: '#ccc', marginLeft: 5 }}>yes</span>
                                        }


                                    </div>


                                </div>
                            </div> : null

                    }

                    {/*listview fields*/}
                    {
                        componentName == 'ListView' && attributes.isCustom != true ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    fields
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <button style={{
                                        width: 120, background: '#4c8aca', color: '#fff', border: 0,
                                        paddingTop: 1, paddingBottom: 1, fontSize: 14
                                    }}
                                        onClick={(event) => {

                                            this.props.dispatch(makeFieldsRodalVisible(this.props.haff))
                                            event = event || window.event;
                                            event.preventDefault();
                                            event.stopPropagation()
                                        }}
                                    >
                                        click
                                    </button>
                                </div>
                            </div> : null
                    }

                    {/*listview template*/}
                    {
                        componentName == 'ListView' && attributes.isCustom == true ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    template
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <button style={{
                                        width: 120, background: '#4c8aca', color: '#fff', border: 0,
                                        paddingTop: 1, paddingBottom: 1, fontSize: 14
                                    }}
                                        onClick={(event) => {

                                            this.props.dispatch(makeListViewTemplateRodalVisible(this.props.haff))
                                            event = event || window.event;
                                            event.preventDefault();
                                            event.stopPropagation()
                                        }}
                                    >
                                        click
                                    </button>
                                </div>
                            </div> : null
                    }

                    {/*border-top-width*/}
                    {
                        componentName == 'View' ?
                        <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                border-top-width
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                <input type="text" value={style && style.borderTopWidth ? style.borderTopWidth : ''}
                                    onChange={(event) => {
                                        style.borderTopWidth = parseInt(event.target.value)
                                        var styleStr = '{' + JSON.stringify(style) + '}';
                                        this.onStyleChange(style)
                                    }} />
                            </div>
                        </div> : null
                    }

                    {/*border-bottom-width*/}
                    {
                        componentName == 'View' ?
                        <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                border-bottom-width
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                <input type="text" value={style && style.borderBottomWidth ? style.borderBottomWidth : ''}
                                    onChange={(event) => {
                                        style.borderBottomWidth = parseInt(event.target.value)
                                        var styleStr = '{' + JSON.stringify(style) + '}';
                                        this.onStyleChange(style)
                                    }} />
                            </div>
                        </div> : null
                    }

                    {/*border-radius*/}
                    {
                        componentName == 'View' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    borderRadius
                                                    </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={style && style.borderRadius ? style.borderRadius : ''}
                                        onChange={(event) => {
                                            style.borderRadius = parseInt(event.target.value)
                                            var styleStr = '{' + JSON.stringify(style) + '}';
                                            this.onStyleChange(style)
                                        }} />
                                </div>
                            </div> : null
                    }

                    {/*border-color*/}
                    {
                        componentName == 'View' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: 27 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    border-color
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={style && style.borderColor ? style.borderColor : ''}
                                        onChange={(event) => {
                                            style.borderColor = event.target.value
                                            var styleStr = '{' + JSON.stringify(style) + '}';
                                            this.onStyleChange(style)
                                        }} />
                                </div>
                            </div> : null
                    }
                    

                    {/*title*/}
                    {
                        componentName == 'Toolbar' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    title
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={attributes && attributes.title ? attributes.title : ''}
                                        onChange={(event) => {
                                            var title = event.target.value
                                            this.onCustomPropertyChange('title', title)
                                            //this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                        }} />
                                </div>
                            </div> :
                            null

                    }

                    {/*placeholder*/}
                    {
                        componentName == 'TextInputWrapper' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    placeholder
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={attributes && attributes.placeholder ? attributes.placeholder : ''}
                                        onChange={(event) => {
                                            var placeholder = event.target.value
                                            this.onCustomPropertyChange('placeholder', placeholder)
                                            //this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                        }} />
                                </div>
                            </div> :
                            null

                    }

                    {/*text content*/}
                    {
                        componentName == 'Text' ?
                            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 5 }}>
                                <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                        content (text)
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: 300, justifyContent: 'flex-end', paddingLeft: 10, paddingRight: 22 }}>
                                    <input type="text" style={{ fontSize: 14, border: 0 }} 
                                        value={attributes && attributes.content ?  attributes.content.value?attributes.content.value:attributes.content : ''}
                                        onChange={(event) => {
                                            
                                            if(attributes.content.value)
                                                attributes.content.value = event.target.value
                                            else
                                                attributes.content=event.target.value
                                            this.onCustomPropertyChange('content', attributes.content)
                                        }} />
                                </div>
                            </div>
                            : null
                    }

                    {/*fontSize*/}
                    {
                        componentName == 'View' || componentName == 'ListView' || componentName == 'Modal'
                            || componentName == 'TextInputWrapper' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    fontSize
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={style && style.fontSize !== undefined && style.fontSize !== null ? style.fontSize : ''} onChange={(event) => {
                                        style.fontSize = parseInt(event.target.value)
                                        var styleStr = '{' + JSON.stringify(style) + '}';
                                        this.onStyleChange(style)
                                        //this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })

                                    }} />
                                </div>
                            </div>
                    }

                    {/*val*/}
                    {
                        componentName == 'TextInputWrapper' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    val
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '161px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={attributes && attributes.val !== undefined && attributes.val !== null ? attributes.val : ''} onChange={(event) => {
                                        var val = event.target.value
                                        this.onCustomPropertyChange('val', val)
                                        //this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })

                                    }} />
                                </div>
                            </div> : null
                    }


                    {/*margin*/}
                    {
                        componentName == 'View' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    margin
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={style && style.margin !== undefined && style.margin !== null ? style.margin : ''} onChange={(event) => {
                                        style.margin = event.target.value;
                                        var styleStr = '{' + JSON.stringify(style) + '}';
                                        this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })

                                    }} />
                                </div>
                            </div> : null
                    }


                    {/*marginBottom*/}
                    {
                        componentName == 'View' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    marginBottom
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={style && style.marginBottom !== undefined && style.marginBottom !== null ? style.marginBottom : ''} onChange={(event) => {
                                        style.marginBottom = event.target.value;
                                        var styleStr = '{' + JSON.stringify(style) + '}';
                                        this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })

                                    }} />
                                </div>
                            </div> : null
                    }



                    {/*padding*/}
                    {
                        componentName == 'ListView' || componentName == 'Modal' || componentName == 'Text' ?
                            null :
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    padding
                                </div>
                                <div style={{
                                    display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end',
                                    paddingRight: '5px', position: 'relative'
                                }}>
                                    <input type="text" value={style && style.padding !== undefined && style.padding !== null ? style.padding : ''} onChange={(event) => {
                                        style.padding = event.target.value
                                        this.onStyleChange(style)
                                    }} />

                                    {/*padding picker*/}
                                    {
                                        state.paddingPicker == true ?
                                            <div style={{
                                                display: 'flex', position: 'absolute', width: 121, height: 94, backgroundColor: '#eee', top: '100%',
                                                'WebkitBoxShadow': '2px 2px 5px #333333', 'boxShadow': '2px 2px 5px #333333', zIndex: 1000
                                            }}>
                                                <div style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', padding: 3, paddingTop: 2 }}>
                                                    {/*padding-top*/}
                                                    <div style={{ display: 'flex', flex: '0 1 auto', minHeight: 23, flexDirection: 'row', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', color: '#9236a2', fontSize: 12 }}>padding-top:</div>
                                                        <div style={{ display: 'flex', flex: '1 1 auto' }}></div>
                                                        <input style={{
                                                            display: 'flex', color: '#555', width: 21, outline: 'none', padding: 0, border: '2px solid rgb(77, 146, 204)',
                                                            borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0
                                                        }}
                                                            value={style ? style.paddingTop !== undefined && style.paddingTop !== null ?
                                                                style.paddingTop : style.padding !== undefined && style.padding !== null ? style.padding : '' : ''}
                                                            onChange={(event) => {
                                                                style.paddingTop = event.target.value;
                                                                var styleStr = '{' + JSON.stringify(style) + '}';
                                                                this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                                                //todo:校验

                                                            }}
                                                        />
                                                    </div>

                                                    {/*padding-right*/}
                                                    <div style={{ display: 'flex', flex: '0 1 auto', minHeight: 23, flexDirection: 'row', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', color: '#9236a2', fontSize: 12 }}>padding-right:</div>
                                                        <div style={{ display: 'flex', flex: '1 1 auto' }}></div>
                                                        <input style={{
                                                            display: 'flex', color: '#555', width: 21, outline: 'none', padding: 0, border: '2px solid rgb(77,146,204)',
                                                            borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0
                                                        }}
                                                            value={style ? style.paddingRight !== undefined && style.paddingRight !== null ?
                                                                style.paddingRight : style.padding !== undefined && style.padding !== null ? style.padding : '' : ''}
                                                            onChange={(event) => {
                                                                style.paddingRight = event.target.value;
                                                                var styleStr = '{' + JSON.stringify(style) + '}';
                                                                this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                                                //todo:校验

                                                            }}
                                                        />
                                                    </div>

                                                    {/*padding-bottom*/}
                                                    <div style={{ display: 'flex', flex: '0 1 auto', minHeight: 23, flexDirection: 'row', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', color: '#9236a2', fontSize: 12 }}>padding-bottom:</div>
                                                        <div style={{ display: 'flex', flex: '1 1 auto' }}></div>
                                                        <input style={{
                                                            display: 'flex', color: '#555', width: 21, outline: 'none', padding: 0, border: '2px solid rgb(77,146,204)',
                                                            borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0
                                                        }}
                                                            value={style ? style.paddingBottom !== undefined && style.paddingBottom !== null ?
                                                                style.paddingBottom : style.padding !== undefined && style.padding !== null ? style.padding : '' : ''}
                                                            onChange={(event) => {
                                                                style.paddingBottom = event.target.value;
                                                                var styleStr = '{' + JSON.stringify(style) + '}';
                                                                this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                                                //todo:校验

                                                            }}
                                                        />
                                                    </div>

                                                    {/*padding-left*/}
                                                    <div style={{ display: 'flex', flex: '0 1 auto', minHeight: 23, flexDirection: 'row', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', color: '#9236a2', fontSize: 12 }}>padding-left:</div>
                                                        <div style={{ display: 'flex', flex: '1 1 auto' }}></div>
                                                        <input style={{
                                                            display: 'flex', color: '#555', width: 21, outline: 'none', padding: 0, border: '2px solid rgb(77,146,204)',
                                                            borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0
                                                        }}
                                                            value={style ? style.paddingLeft !== undefined && style.paddingLeft !== null ?
                                                                style.paddingLeft : style.padding !== undefined && style.padding !== null ? style.padding : '' : ''}
                                                            onChange={(event) => {
                                                                style.paddingLeft = event.target.value;
                                                                var styleStr = '{' + JSON.stringify(style) + '}';
                                                                this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                                                //todo:校验

                                                            }}
                                                        />
                                                    </div>



                                                </div>
                                            </div> : null
                                    }
                                </div>

                                {/*padding button*/}
                                <div style={{
                                    display: 'flex', flexDirection: 'row', width: '19px', height: '18px', flex: '0 1 auto', background: '#f3f3f3',
                                    borderRadius: '4px', color: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: '5px', marginLeft: 4
                                }}
                                    onClick={(event) => {
                                        if (state.paddingPicker == true) {


                                        }
                                        this.setState({ paddingPicker: !state.paddingPicker })
                                    }}
                                >
                                    {
                                        state.paddingPicker == true ?
                                            <div className='padding-picker-close'></div> :
                                            <div className='picker-config'></div>
                                    }
                                </div>
                            </div>
                    }


                    {/*animationType*/}
                    {
                        componentName == 'Modal' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    animationType
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '2 1 auto', justifyContent: 'flex-end', paddingRight: '32px' }}>

                                    <select value={attributes && attributes.animationType ? attributes.animationType : ''} onChange={(event) => {
                                        var animationType = event.target.value
                                        this.onCustomPropertyChange('animationType', animationType)
                                    }}>>
                                        <option value=""></option>
                                        <option value="{'none'}">none</option>
                                        <option value="{'slide'}">slide</option>
                                        <option value="{'fade'}">fade</option>
                                    </select>
                                </div>
                            </div> : null
                    }

                    {/*transparent*/}
                    {
                        componentName == 'Modal' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    transparent
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '2 1 auto', justifyContent: 'flex-end', paddingRight: '32px' }}>

                                    <select value={attributes && attributes.transparent ? attributes.transparent : ''} onChange={(event) => {
                                        var transparent = event.target.value
                                        this.onCustomPropertyChange('transparent', transparent)
                                    }}>>
                                        <option value="{false}">false</option>
                                        <option value="{true}">true</option>
                                    </select>
                                </div>
                            </div> : null
                    }

                    {/*modal visible*/}
                    {
                        componentName == 'Modal' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    visible
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', width: '121px', justifyContent: 'flex-end', paddingRight: '32px' }}>
                                    <input type="text" value={attributes && attributes.visible ? attributes.visible : ''}
                                        onChange={(event) => {
                                            var visible = event.target.value
                                            this.onCustomPropertyChange('visible', visible)
                                            //this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })

                                        }} />
                                </div>
                            </div> : null
                    }



                    {/*color*/}
                    {
                        componentName == 'Text' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px', position: 'relative' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    color
                                </div>
                                <div style={{ display: 'flex', width: '120px', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'flex-end', paddingRight: '5px' }}>
                                    <input type="text" style={{ width: '100%' }} value={style && style.color ? style.color : ''} onChange={(event) => {
                                        style.color = event.target.value;
                                        var styleStr = '{' + JSON.stringify(style) + '}';
                                        this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })


                                        //进行修正之前确保是有效的格式
                                        var color = event.target.value
                                        var reg = /^rgb\(.*\)$|^rgba\(.*\)$|^\#[a-fA-F0-9]{3}$|^\#[a-fA-F0-9]{6}$/
                                        if (reg.exec(color)) {
                                            style.color = event.target.value
                                            this.onStyleChange(style)
                                        }
                                    }} />
                                </div>

                                <div style={{
                                    display: 'flex', flexDirection: 'row', width: '23px', height: '22px', flex: '0 1 auto',
                                    borderRadius: '4px', color: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: '5px'
                                }}
                                    onClick={(event) => {

                                        if (this.state.colorPicker == true) //picker仍在显示
                                        {
                                            if (this.state.pickedColor) {
                                                var color = this.state.pickedColor;
                                                if (style.color && style.color != '') {
                                                    if (style.color.indexOf('#') != -1)
                                                        style.color = color.hex
                                                    else {
                                                        style.color = 'rgba(' + color.rgb.r + ',' + color.rgb.g +
                                                            ',' + color.rgb.b + ',' + color.rgb.a + ')';
                                                    }
                                                } else if (style.color == undefined || style.color == null) {
                                                    style.color = color.hex
                                                }
                                                var styleStr = '{' + JSON.stringify(style) + '}';
                                                //TODO:make this change to be reflected in Inflater.jsx
                                                this.setState({ colorPicker: false, propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                            } else {
                                                this.setState({ colorPicker: false })
                                            }
                                        } else {
                                            this.setState({ colorPicker: !this.state.colorPicker })
                                        }

                                    }}>
                                    {
                                        state.colorPicker != true ?
                                            style && style.color ? <div style={Object.assign({ width: '22px', height: '22px' }, colorPickerStyle)}></div> : <div className='color-picker'></div> :
                                            <div className='picker-close'></div>
                                    }
                                </div>

                                {/*color picker*/}
                                {
                                    state.colorPicker == true ?
                                        <div style={{ top: '28px', right: '25px', position: 'absolute', zIndex: 10 }}>
                                            <ChromePicker
                                                color={style.color}
                                                onChange={(color) => {

                                                    this.state.pickedColor = color
                                                }} />
                                        </div> : null
                                }



                            </div> : null

                    }

                    {/*backgroundColor*/}
                    {
                        componentName == 'View' ?
                            <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center', height: '27px', position: 'relative' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', flex: '1 1 auto', paddingLeft: '10px' }}>
                                    backgroundColor
                                </div>
                                <div style={{ display: 'flex', width: '120px', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'flex-end', paddingRight: '5px' }}>
                                    <input type="text" style={{ width: '100%' }} value={style && style.backgroundColor ? style.backgroundColor : ''} onChange={(event) => {
                                        style.backgroundColor = event.target.value;
                                        var styleStr = '{' + JSON.stringify(style) + '}';
                                        this.setState({ propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })

                                        //进行修正之前确保是有效的格式
                                        var backgroundColor = event.target.value
                                        var reg = /^rgb\(.*\)$|^rgba\(.*\)$|^\#[a-fA-F0-9]{3}$|^\#[a-fA-F0-9]{6}$/
                                        if (reg.exec(backgroundColor)) {
                                            style.backgroundColor = event.target.value
                                            this.onStyleChange(style)
                                        }

                                    }} />
                                </div>

                                <div style={{
                                    display: 'flex', flexDirection: 'row', width: '23px', height: '22px', flex: '0 1 auto',
                                    borderRadius: '4px', color: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: '5px'
                                }}
                                    onClick={(event) => {

                                        if (this.state.backgroundColorPicker == true) //background-picker仍在显示
                                        {
                                            if (this.state.pickedBackgroundColor) {
                                                var color = this.state.pickedBackgroundColor;
                                                if (style.backgroundColor && style.backgroundColor != '') {
                                                    if (style.backgroundColor.indexOf('#') != -1)
                                                        style.backgroundColor = color.hex
                                                    else {
                                                        style.backgroundColor = 'rgba(' + color.rgb.r + ',' + color.rgb.g +
                                                            ',' + color.rgb.b + ',' + color.rgb.a + ')';
                                                    }
                                                } else if (style.backgroundColor == undefined || style.backgroundColor == null) {
                                                    style.backgroundColor = color.hex
                                                }
                                                var styleStr = '{' + JSON.stringify(style) + '}';
                                                //TODO:make this change to be reflected in Inflater.jsx
                                                this.setState({ backgroundColorPicker: false, propertyMap: Object.assign(this.state.propertyMap, { style: styleStr }) })
                                                this.onStyleChange(style)
                                            } else {
                                                this.setState({ backgroundColorPicker: false })
                                            }

                                        } else {
                                            this.setState({ backgroundColorPicker: !this.state.backgroundColorPicker })
                                        }

                                    }}>

                                    {
                                        state.backgroundColorPicker != true ?
                                            style && style.backgroundColor ? <div style={Object.assign({ width: '20px', height: '20px', borderRadius: 2 }, backgroundColorPickerStyle)}></div> : <div className='color-picker'></div> :
                                            <div className='picker-close'></div>
                                    }
                                    {/*
                                   {
                                state.backgroundColorPicker == true ?
                                    <div className='picker-close'></div> :
                                    <div className='color-picker'></div>
                            }
                            */}
                                </div>

                                {/*backgroundColor picker*/}
                                {
                                    state.backgroundColorPicker == true ?
                                        <div style={{ top: '28px', right: '25px', position: 'absolute', zIndex: 10 }}>
                                            <ChromePicker
                                                color={style.backgroundColor}
                                                onChange={(color) => {
                                                    this.state.pickedBackgroundColor = color
                                                }} />
                                        </div> : null
                                }



                            </div> : null

                    }




                </div>


            </div>

        )
    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
    },
    row: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        alignItems: 'center'
    },
    body: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
    },
    item: {
        display: 'flex',
        flexDirection: 'row'
    },
    header: {
        height: '16px',
        fontSize: '11px',
        color: '#eee',
        border: '2px solid #222',
        borderBottom: '2px solid #666',
        padding: '4px',
        paddingLeft: '6px'
    }
}

const mapStateToProps = (state, ownProps) => {

    const props = {};


    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.dictionary = doc.dictionary
            props.decorationsMap = doc.decorationsMap

        }

    }

    //选中组件的路径编码
    if (state.palette.haff) {
        //TODO:this should be modifed to haff
        var haff = state.palette.haff
        props.haff = state.palette.haff
        var component = doc.components
        var classMethods = doc.classMethods
        if (haff[0] == 'classMethods') {
            component = classMethods
            for (var i = 1; i < haff.length; i++)
                component = component[haff[i]]
        } else {
            haff.map((pa, i) => {
                component = component[pa]
            })
        }
        props.component = component;
        props.componentName = component.name
        props.propertyMap = component.attributes
        props.classMethods = doc.classMethods

        var ranges = doc.ranges
        ranges.map((range, i) => {
            if (range.key == haff.concat('children').concat('style')) {
                //TODO:获取更改后的range位置
            }
        })

        console.log()
    }

    return props
}


export default connect(mapStateToProps)(Properties);
