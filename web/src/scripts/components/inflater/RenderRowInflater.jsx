import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import ActionSheetInflater from './ActionSheetInflater'
import AnimatedView from './AnimatedView';
import CommIcon from './CommIcon';
import DatePickerModal from './DatePickerModal'
import DatePickerInflater from './DatePickerInflater';
import Icon from './Icon'
import Image from './Image';
import Ionicons from './Ionicons';
import ListView from './ListViewInflater'
import ModalInflater from './ModalInflater'
import ScrollView from './ScrollView'
import ScrollableTabView from './ScrollableTabView'
import Text from './Text'
import Toolbar from './ToolbarInflater'
import TextInputWrapper from './TextInputWrapperInflater'
import TouchableOpacity from './TouchableOpacity'
import TextInput from './TextInput'
import View from './View'
import Container from '../monitor/Container'
import LinearLayout from '../monitor/LinearLayout'
import _ from 'lodash'
import update from 'react/lib/update';
import ItemTypes from '../../constants/ItemTypes';
const uuidV1 = require('uuid/v1');
import ArrayUtils from '../../utils/ArrayUtils';

import {
    LAYOUT_FIELDS,
} from '../../constants/LayoutConstants'

import {
    setComponentSelected,
    setComponentUnSelected
} from '../../actions/paletteActions';
import {
    switchComponent
} from '../../actions/editorActions';
import {
    makeBackDropUnVisible
} from '../../actions/actionSheetActions'
import {
    makeComponentTreeScroll,
} from '../../actions/scrollActions'
import {
    makeNodeVisible
} from '../../actions/componentTreeActions'


class RenderRowInflater extends Component {


    constructor(props) {
        super(props)

        // this.state={
        // components:[
        //     {type:ItemTypes.ROW,tag:'View'},
        //     {type:ItemTypes.LINEAR_LAYOUT,tag:'linear'},
        //     {type:ItemTypes.ROW,tag:'Button'},
        //     {type:ItemTypes.ROW,tag:'View'},
        //     {type:ItemTypes.ROW,tag:'Row'},
        //     {type:ItemTypes.ROW,tag:'ScrollView'},
        //     {type:ItemTypes.ROW,tag:'Row'},
        // ]
        // }
        this.state = {
        }
    }

    //一级组件的交换,当交换成功后需要dispatch，请求文档改变
    onSwitch(dragIndex, hoverIndex) {

        try {
            const { components } = this.state;
            const row = components.Container.children[dragIndex];
            this.state.dragIndex = dragIndex

            //TODO:如果需要迁移已选中的组件，则保持clicked属性的跟综

            this.setState(update(this.state, {
                components: {
                    Container: {
                        children: {
                            $splice: [
                                [dragIndex, 1],
                                [hoverIndex, 0, row]
                            ]
                        }
                    }
                }
            }));



        } catch (e) {
            //TODO:make this to logger
            console.log(e)
        }
    }

    onDrop(hoverIndex) {
        var { dragIndex } = this.state;
        // this.props.dispatch(switchComponent(this.props.docId,['Container','children',dragIndex],['Container','children',hoverIndex]))            

        var { docId, haff1, haff2 } = { docId: this.props.docId, haff1: ['Container', 'children', dragIndex], haff2: ['Container', 'children', hoverIndex] }
        var doc = this.props.cache[docId]
        var component1 = doc.components
        var component2 = doc.components
        haff1.map((pa, i) => {
            component1 = component1[pa]
        })
        haff2.map((pa, i) => {
            component2 = component2[pa]
        })


        var editor = this.props.editor
        if (component1.loc.start.line < component2.loc.start.line) {
            var [newLoc2, newLoc1] = this.props.monacoMiddleware.switchContent(component1.loc, component2.loc)
            this.props.dispatch(switchComponent(docId, haff1, haff2, newLoc1, newLoc2))
        } else {
            var [newLoc1, newLoc2] = this.props.monacoMiddleware.switchContent(component2.loc, component1.loc)
            this.props.dispatch(switchComponent(docId, haff1, haff2, newLoc1, newLoc2))
        }


        // editor.getModel().pushEditOperations(null,[
        //     { identifier: 'modify' , range: new monaco.Range(component2.loc.start.line, component2.loc.start.column+1, component2.loc.end.line, component2.loc.end.column+1), text:line1, forceMoveMarkers: false },
        //     { identifier: 'modify' , range: new monaco.Range(component1.loc.start.line, component1.loc.start.column+1, component1.loc.end.line, component1.loc.end.column+1), text:line2, forceMoveMarkers: false }
        //     ])


        console.log('drag=>' + dragIndex + ',hover=>' + hoverIndex)
    }


    traverse(root, haff) {
        var arr = [];

        if (root) {
            root.map((component, i) => {

                var prefix = haff.concat('children').concat(i)
                var clicked = false
                if (ArrayUtils.compare(this.props.haff, prefix)) //如果为被拖拽物体
                    clicked = true
                var styleMap = null
                var name = null
                var tabLabel = null
                var textInputStyle = null
                var size=null

                var attributes = component.attributes
                if (attributes == undefined || attributes == null)
                    attributes = {}
                if (attributes.style && attributes.style != '') {
                    if (Object.prototype.toString.call(attributes.style) == '[object Object]') {
                        styleMap = attributes.style
                    } else {
                        try {
                            var ob = attributes.style.substring(1, attributes.style.length - 1);
                            styleMap = JSON.parse(ob);
                        } catch (e) {
                            var styleStr = attributes.style.substring(1, attributes.style.length - 1)
                            var reg = /^(.*)?\.(.*)$/
                            if (reg.exec(styleStr)) {
                                var member = reg.exec(styleStr)[1]
                                var property = reg.exec(styleStr)[2]
                                if (member && property) {
                                    //TODO:look up this member in dictionary
                                    var dictionary = props.dictionary
                                    styleMap = dictionary[member][property]
                                }
                            }
                        }
                    }

                    //如果源代码中采用合并样式的写法
                    if (Object.prototype.toString.call(styleMap) == '[object Array]') {
                        var mergedStyle = {}
                        styleMap.map((styleChild, k) => {
                            mergedStyle = Object.assign(mergedStyle, styleChild)
                        })
                        styleMap = mergedStyle
                    }
                }
                if (attributes.name && attributes.name != '')
                    name = attributes.name.substring(1, attributes.name.length - 1);

                if (attributes.tabLabel && attributes.tabLabel != '')
                    tabLabel = attributes.tabLabel

                if (attributes.textInputStyle && attributes.textInputStyle != '') {
                    var jsonWrapperdReg=/^{(.*?)}$/
                    var converted=jsonWrapperdReg.exec(attributes.textInputStyle)
                    if(converted!=null&&converted[1]!=null)
                        textInputStyle=JSON.parse(converted[1])
                }

                if(attributes.size&&attributes.size!='')
                {
                    var wrappedReg=/^{(.*?)}$/
                    var converted=wrappedReg.exec(attributes.size)
                    if(converted!=null&&converted[1]!=null)
                    {
                        size=parseInt(converted[1])
                    }else{
                        size=parseInt(attributes.size)
                    }
                }

                switch (component.name) {

                    case ItemTypes.TEXT_INPUT_WRAPPER:
                        var placeholder = null
                        var val = null
                        if (attributes.placeholder && attributes.placeholder != '')
                            placeholder = attributes.placeholder
                        if (attributes.val && attributes.val != '')
                            val = attributes.val


                        arr.push(
                            <TextInputWrapper index={i} key={i} clicked={clicked}
                                textInputStyle={textInputStyle}
                                placeholder={placeholder}
                                val={val}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }} />)

                        break;
                    case ItemTypes.TOOLBAR:

                        var title = null
                        if (attributes.title && attributes.title != '')
                            title = attributes.title

                        var cancelIcon = null
                        if (attributes.cancelIcon && attributes.cancelIcon != '')
                            cancelIcon = attributes.cancelIcon

                        var actions = null
                        if (attributes.actions && attributes.actions != '') {
                            var actionsStr = attributes.actions.substring(1, attributes.actions.length - 1)
                            try {
                                actions = eval(actionsStr)
                            } catch (e) {
                                console.error(e)
                            }
                        }


                        arr.push(
                            <Toolbar index={i} key={i} styleMap={styleMap} clicked={clicked} title={title} height={attributes.height}
                                cancelIcon={cancelIcon}
                                actions={actions}
                                haff={prefix}
                                onSwitch={(drag, hover) => {
                                    this.onSwitch(drag, hover);
                                }}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }}
                                onDrop={(hoverIndex) => {
                                    ref.onDrop(hoverIndex)
                                }}>
                                {this.traverse(component.children, prefix)}
                            </Toolbar>)
                        break;

                    case ItemTypes.IMAGE:

                        var { resizeMode, source } = attributes

                        arr.push(
                            <Image index={i} key={i} styleMap={styleMap} clicked={clicked} haff={prefix}
                                resizeMode={resizeMode}
                                source={source}
                                onSwitch={(drag, hover) => {
                                    this.onSwitch(drag, hover);
                                }}
                                onClick={() => {
                                    if (clicked != true) {
                                        //设置该结点的所有父结点展开
                                        this.props.dispatch(makeNodeVisible(prefix))
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }}
                                onDrop={(hoverIndex) => {
                                    ref.onDrop(hoverIndex)
                                }}>
                                {this.traverse(component.children, prefix)}
                            </Image>)

                        break;

                    case ItemTypes.ANIMATED_VIEW:

                        arr.push(
                            <AnimatedView index={i} key={i} styleMap={styleMap} clicked={clicked} haff={prefix}
                                onSwitch={(drag, hover) => {
                                    this.onSwitch(drag, hover);
                                }}
                                onClick={() => {
                                    if (clicked != true) {

                                        //设置该结点的所有父结点展开
                                        this.props.dispatch(makeNodeVisible(prefix))
                                        //todo:算出滑动高度
                                        this.props.dispatch(makeComponentTreeScroll(200))
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }}
                                onDrop={(hoverIndex) => {
                                    ref.onDrop(hoverIndex)
                                }}>
                                {this.traverse(component.children, prefix)}
                            </AnimatedView>)

                        break;
                    case ItemTypes.VIEW:

                        arr.push(
                            <View index={i} key={i} styleMap={styleMap} clicked={clicked} haff={prefix}
                                tabLabel={tabLabel}
                                onSwitch={(drag, hover) => {
                                    this.onSwitch(drag, hover);
                                }}
                                onClick={() => {
                                    if (clicked != true) {

                                        //设置该结点的所有父结点展开
                                        this.props.dispatch(makeNodeVisible(prefix))
                                        //todo:算出滑动高度
                                        this.props.dispatch(makeComponentTreeScroll(200))
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }}
                                onDrop={(hoverIndex) => {
                                    ref.onDrop(hoverIndex)
                                }}>
                                {this.traverse(component.children, prefix)}
                            </View>)
                        break;
                    case ItemTypes.SCROLLVIEW:
                        arr.push(
                            <ScrollView index={i} key={i} styleMap={styleMap} clicked={clicked} haff={prefix}
                                content={attributes.content}
                                tabLabel={tabLabel}
                                onSwitch={(drag, hover) => {
                                    this.onSwitch(drag, hover);
                                }}
                                onClick={() => {
                                    if (clicked != true) {

                                        //设置该结点的所有父结点展开
                                        this.props.dispatch(makeNodeVisible(prefix))
                                        //todo:算出滑动高度
                                        this.props.dispatch(makeComponentTreeScroll(200))
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }}
                                onDrop={(hoverIndex) => {
                                    ref.onDrop(hoverIndex)
                                }}>
                                {this.traverse(component.children, prefix)}
                            </ScrollView>)

                        break;
                    case ItemTypes.SCROLLABLE_TAB_VIEW:

                        var tabLabels = []
                        if (component.children && component.children.length > 0) {
                            component.children.map((child, z) => {
                                if (child.attributes && child.attributes.tabLabel && child.attributes.tabLabel != '')
                                    tabLabels.push(child.attributes.tabLabel)
                            })
                        }

                        arr.push(
                            <ScrollableTabView index={i} key={i} styleMap={styleMap} clicked={clicked} haff={prefix}
                                tabLabels={tabLabels}
                                onSwitch={(drag, hover) => {
                                    this.onSwitch(drag, hover);
                                }}
                                onClick={() => {
                                    if (clicked != true) {

                                        //设置该结点的所有父结点展开
                                        this.props.dispatch(makeNodeVisible(prefix))
                                        //todo:算出滑动高度
                                        this.props.dispatch(makeComponentTreeScroll(200))
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }}
                                onDrop={(hoverIndex) => {
                                    ref.onDrop(hoverIndex)
                                }}>
                                {this.traverse(component.children, prefix)}
                            </ScrollableTabView>)
                        break;
                    case ItemTypes.LISTVIEW:
                        arr.push(
                            <ListView index={i} key={i} styleMap={styleMap} clicked={clicked} attributes={attributes} isCustom={attributes.isCustom}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }

                                }}
                            >
                                {this.traverse(component.children, prefix)}
                            </ListView>)
                        break;
                    case ItemTypes.ACTIONSHEET:
                        arr.push(
                            <ActionSheetInflater index={i} key={i} styleMap={styleMap} clicked={clicked}
                                haff={prefix}
                                attributes={attributes}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                            />)
                        break;
                    case ItemTypes.MODAL:
                        arr.push(
                            <ModalInflater index={i} key={i} clicked={clicked}
                                haff={prefix}
                                attributes={attributes}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                            />)
                        break;
                    case ItemTypes.TEXT:
                        arr.push(
                            <Text index={i} id={uuidV1()} key={i} styleMap={styleMap} content={attributes.content} clicked={clicked}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                            />)
                        break;
                    case ItemTypes.TouchableOpacity:
                        arr.push(
                            <TouchableOpacity index={i} key={i} styleMap={styleMap} name={name} clicked={clicked}
                                onSwitch={(drag, hover) => {
                                    ref.onSwitch(drag, hover);
                                }}
                                onClick={() => {

                                    if (clicked != true) {
                                        //设置该结点的所有父结点展开
                                        this.props.dispatch(makeNodeVisible(prefix))
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                            >
                                {this.traverse(component.children, prefix)}
                            </TouchableOpacity>);

                        break;
                    case ItemTypes.COMM_ICON:

                        arr.push(
                            <CommIcon index={i} key={i} styleMap={styleMap} name={attributes.name} clicked={clicked}
                                color={attributes.color}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                onSwitch={(drag, hover) => {
                                    ref.onSwitch(drag, hover);
                                }}
                            />);
                        break;
                    case ItemTypes.ICON:
                        arr.push(
                            <Icon index={i} key={i} styleMap={styleMap} name={attributes.name} clicked={clicked}
                                size={size}
                                color={attributes.color}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                onSwitch={(drag, hover) => {
                                    ref.onSwitch(drag, hover);
                                }}
                            />);
                        break;
                    case ItemTypes.IONICONS:
                        arr.push(
                            <Ionicons index={i} key={i} styleMap={styleMap} name={attributes.name} clicked={clicked}
                                color={attributes.color}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                    }
                                }}
                                onSwitch={(drag, hover) => {
                                    ref.onSwitch(drag, hover);
                                }}
                            />);
                        break;
                    case ItemTypes.DatePicker:

                        var { mode, placeholder, confirmBtnText, cancelBtnText, iconComponent, showIcon, customStyles } = attributes

                        if (showIcon && showIcon[0] == '{')
                            showIcon = showIcon.substring(1, showIcon.length - 1) == 'true' ? true : false
                        else
                            showIcon = showIcon == 'true' ? true : false

                        try {
                            JSON.parse(customStyles)
                            customStyles = JSON.parse(customStyles)
                        } catch (e) {
                            customStyles = customStyles.substring(1, customStyles.length - 1)
                            customStyles = JSON.parse(customStyles)
                        }

                        arr.push(
                            <DatePickerInflater index={i} key={i} clicked={clicked}
                                placeholder={placeholder}
                                customStyles={customStyles}
                                mode={val}
                                confirmBtnText={confirmBtnText}
                                cancelBtnText={cancelBtnText}
                                showIcon={showIcon}
                                styleMap={styleMap}
                                iconComponent={iconComponent}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                        //TODO:make DatePickerModal visible

                                    }

                                }} />)
                        break;
                    case ItemTypes.TEXT_INPUT:
                        var { height, placeholder, placeholderTextColor, value } = attributes
                        arr.push(
                            <TextInput index={i} key={i} clicked={clicked}
                                placeholder={placeholder}
                                height={height}
                                placeholderTextColor={placeholderTextColor}
                                styleMap={styleMap}
                                onClick={() => {
                                    if (clicked != true) {
                                        this.props.dispatch(setComponentSelected(prefix))
                                        //TODO:make DatePickerModal visible

                                    }

                                }} />)
                        break;
                }

            });
        }

        return arr;
    }



    //组件挂载
    render() {

        var state = this.state;
        var props = this.props;


        var ref = this;



        var container = props.components.View;
        if (container.direction == undefined || container.direction == null) {
            container.direction = 'column'
        }
        var styleMap = null
        if (container.style) {
            var styleOb = container.style
            if (styleOb.type == 'MemberExpression')//成员属性引用
            {
                var styleStr = styleOb.value.substring(1, styleOb.value.length - 1)
                var reg = /^(.*)?\.(.*)$/
                if (reg.exec(styleStr)) {
                    var member = reg.exec(styleStr)[1]
                    var property = reg.exec(styleStr)[2]
                    if (member && property) {
                        //TODO:look up this member in dictionary
                        var dictionary = props.dictionary
                        styleMap = dictionary[member][property]
                    }
                }
            } else if (styleOb.type == 'ObjectExpression') {
                if (Object.prototype.toString.call(styleOb.value) == '[object String]') {
                    styleMap = JSON.parse(styleMap.value)
                } else if (Object.prototype.toString.call(styleOb.value) == '[object Object]') {
                    styleMap = styleOb.value
                }
            }
        }
        styleMap.position = 'relative'



        var childNodes = this.traverse(props.components.View.children, ['View'])




        return (
            <div className="LayoutInflater" style={styles.container}>
                <div style={{ display: 'flex', flex: '0 1 auto', flexDirection: 'column', height: props.inflaterHeight, position: 'relative' }}>
                    {
                        container ?
                            <Container direction={container.direction} styleMap={styleMap}>
                                {
                                    this.props.backdropVisible == true ?
                                        <div
                                            style={{
                                                width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1010,
                                                backgroundColor: 'rgba(68, 68, 68, 0.38)'
                                            }}
                                            onClick={(event) => {
                                                this.props.dispatch(makeBackDropUnVisible())
                                                //TODO:设置无选中
                                                this.props.dispatch(setComponentUnSelected())
                                                event = event || window.event;
                                                event.preventDefault();
                                                event.stopPropagation()
                                            }}
                                        >
                                            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

                                            </div>
                                        </div> : null
                                }
                                <DatePickerModal attributes={{}} />


                                {childNodes}
                            </Container> : null
                    }


                </div>

            </div>

        )
    }


}

const styles = {
    container: {
        display: 'flex',
        flex: '0 0 auto',
        width: '300px',
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: '10px',

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
    }
}


const mapStateToProps = (state, ownProps) => {

    const props = {}

    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
            props.components = doc.components
            props.dictionary = doc.dictionary
            props.docId = docId
            props.cache = docCache
            props.editor = state.monaco._IStandaloneCodeEditor
        }
    }

    //已有已选中的组件,只针对第一层子结点
    if (state.palette.component && state.palette.haff) {
        var haff = state.palette.haff
        props.haff = haff
    }

    props.backdropVisible = state.actionSheet.backdrop

    //模拟器高度设置
    props.inflaterHeight = state.ui[LAYOUT_FIELDS.INFLATER_HEIGHT]

    return props
}
export default connect(mapStateToProps)(RenderRowInflater);
