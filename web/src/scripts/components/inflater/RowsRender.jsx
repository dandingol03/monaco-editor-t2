import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import ActionSheetInflater from './ActionSheetInflater'
import AnimatedView from './AnimatedView';
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


class RowsRender extends Component {


    traverse(component, haff, index) {


        if (component) {






            var clicked = false
            if (ArrayUtils.compare(this.props.selected, haff)) //如果为被拖拽物体
                clicked = true
            
            var styleMap = null
            var name = null
            var tabLabel = null
            var size = null

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

            if (attributes.size && attributes.size != '') {
                var wrappedReg = /^{(.*?)}$/
                var converted = wrappedReg.exec(attributes.size)
                if (converted != null && converted[1] != null) {
                    size = parseInt(converted[1])
                } else {
                    size = parseInt(attributes.size)
                }
            }

            
            var arr = []
            if(component.children&&component.children.length>0)
            {
                component.children.map((child, j) => {
                    arr.push(this.traverse(child, haff.concat('children').concat(j), j))
                })
            }
            


            switch (component.name) {

                case ItemTypes.TEXT_INPUT_WRAPPER:
                    var placeholder = null
                    var val = null
                    if (attributes.placeholder && attributes.placeholder != '')
                        placeholder = attributes.placeholder
                    if (attributes.val && attributes.val != '')
                        val = attributes.val

                    return (
                        <TextInputWrapper index={i} key={index} clicked={clicked}
                            placeholder={placeholder}
                            val={val}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
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


                    return (
                        <Toolbar index={index} key={idnex} styleMap={styleMap} title={title} height={attributes.height}
                            clicked={clicked}
                            cancelIcon={cancelIcon}
                            actions={actions}
                            onSwitch={(drag, hover) => {
                                this.onSwitch(drag, hover);
                            }}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                            onDrop={(hoverIndex) => {
                                ref.onDrop(hoverIndex)
                            }}>
                            {arr}
                        </Toolbar>)
                    break;

                case ItemTypes.IMAGE:

                    var { resizeMode, source } = attributes

                    return (
                        <Image index={index} key={index} styleMap={styleMap} clicked={clicked}
                            resizeMode={resizeMode}
                            source={source}
                            onSwitch={(drag, hover) => {
                                this.onSwitch(drag, hover);
                            }}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                            onDrop={(hoverIndex) => {
                                ref.onDrop(hoverIndex)
                            }}>
                            {arr}
                        </Image>)

                    break;

                case ItemTypes.ANIMATED_VIEW:

                    return (
                        <AnimatedView index={index} key={index} styleMap={styleMap} clicked={clicked}
                            onSwitch={(drag, hover) => {
                                this.onSwitch(drag, hover);
                            }}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                            onDrop={(hoverIndex) => {
                                ref.onDrop(hoverIndex)
                            }}>
                            {arr}
                        </AnimatedView>)

                    break;
                case ItemTypes.VIEW:

                    return(
                        <View index={index} key={index} styleMap={styleMap} clicked={clicked}
                            content={attributes.content}
                            tabLabel={tabLabel}
                            onSwitch={(drag, hover) => {
                                this.onSwitch(drag, hover);
                            }}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                            onDrop={(hoverIndex) => {
                                ref.onDrop(hoverIndex)
                            }}>
                            {arr}
                        </View>)
                    break;
                case ItemTypes.SCROLLVIEW:
                    return(
                        <ScrollView index={index} key={index} styleMap={styleMap} clicked={clicked}
                            content={attributes.content}
                            tabLabel={tabLabel}
                            onSwitch={(drag, hover) => {
                                this.onSwitch(drag, hover);
                            }}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                            onDrop={(hoverIndex) => {
                                ref.onDrop(hoverIndex)
                            }}>
                            {arr}
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

                    return(
                        <ScrollableTabView index={index} key={index} styleMap={styleMap} clicked={clicked}
                            tabLabels={tabLabels}
                            onSwitch={(drag, hover) => {
                                this.onSwitch(drag, hover);
                            }}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                            onDrop={(hoverIndex) => {
                                ref.onDrop(hoverIndex)
                            }}>
                            {arr}
                        </ScrollableTabView>)
                    break;
                case ItemTypes.LISTVIEW:
                    return(
                        <ListView index={index} key={index} styleMap={styleMap} attributes={attributes} isCustom={attributes.isCustom} clicked={clicked}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                        >
                        {arr}
                        </ListView>)
                    break;
                case ItemTypes.ACTIONSHEET:
                    return(
                        <ActionSheetInflater index={index} key={index} styleMap={styleMap} clicked={clicked}
                            attributes={attributes}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                        />)
                    break;
                case ItemTypes.MODAL:
                    return(
                        <ModalInflater index={index} key={index} clicked={clicked}
                            attributes={attributes}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                        />)
                    break;
                case ItemTypes.TEXT:
                    return(
                        <Text index={index} id={uuidV1()} key={index} styleMap={styleMap} content={attributes.content} clicked={clicked}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                        />)
                    break;
                case ItemTypes.TouchableOpacity:
                    return(
                        <TouchableOpacity index={index} key={index} styleMap={styleMap} name={name} clicked={clicked}
                            onSwitch={(drag, hover) => {
                                ref.onSwitch(drag, hover);
                            }}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }}
                        >
                        {arr}
                        </TouchableOpacity>);

                    break;
                case ItemTypes.ICON:
                    return(
                        <Icon index={index} key={index} styleMap={styleMap} name={attributes.name}
                            size={size}
                            color={attributes.color}
                            onClick={() => {
                            }}
                            onSwitch={(drag, hover) => {
                                ref.onSwitch(drag, hover);
                            }}
                        />);
                    break;
                case ItemTypes.IONICONS:
                    return(
                        <Ionicons index={index} key={index} styleMap={styleMap} name={attributes.name} clicked={clicked}
                            color={attributes.color}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
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

                    return(
                        <DatePickerInflater index={index} key={index} clicked={clicked}
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
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }} />)
                    break;
                case ItemTypes.TEXT_INPUT:
                    var { height, placeholder, placeholderTextColor, value } = attributes
                    return(
                        <TextInput index={index} key={index} clicked={clicked}
                            placeholder={placeholder}
                            height={height}
                            placeholderTextColor={placeholderTextColor}
                            styleMap={styleMap}
                            onClick={() => {
                                if (clicked != true) {
                                    this.props.dispatch(setComponentSelected(haff))
                                }
                            }} />)
                    break;
            }

        }
        return arr;
    }

    render() {

        var childNodes = null
        var { components, haff } = this.props
        
        if (components)
            childNodes = this.traverse(components, haff, 0)

        var rows = []
        if (components) {
            for (var i = 0; i < 1; i++) {
                rows.push(
                    <div key={i} style={{
                        display: 'flex', flexDirection: 'row', flex: '0 1 auto', background: '#eee', marginTop: 1
                    }}>
                        {childNodes}
                    </div>)
            }
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto' }}>
                {rows}
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {

    const props = {}

    //已有已选中的组件,只针对第一层子结点
    if (state.palette.component && state.palette.haff) {
        var haff = state.palette.haff
        props.selected = haff
    }

    return props
}

export default connect(mapStateToProps)(RowsRender)