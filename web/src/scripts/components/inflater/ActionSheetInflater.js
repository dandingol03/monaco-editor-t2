import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'

import {
    onActionSheetInit,
    onActionSheetDestroy
} from '../../actions/actionSheetActions'

class ActionSheetInflater extends Component {


    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render() {

        var state = this.state;
        var props = this.props;
        //以json格式存放style属性
        var { styleMap, haff, pickerVisible, attributes, clicked } = this.props;
        var { title, options, ref } = attributes
        //do filering
        var className = 'row';
        var style = {
            height: 45,
            paddingTop: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: '#66CDAA',
            flex: '0 1 auto'
        };


        if (props.clicked == true)
            className += ' clicked'

        if (styleMap) {
            if (styleMap.marginTop) {
                style.marginTop = styleMap.marginTop
            }
            if (styleMap.padding) {
                style.padding = styleMap.padding
            }
            if (styleMap.paddingTop) {
                style.paddingTop = styleMap.paddingTop
            }
        }





        var optionItems = []
        if (options && options.length > 0) {
            options.map((option, i) => {

                if (i != options.length - 1) {
                    optionItems.push(
                        <div key={i} style={{
                            display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                            backgroundColor: '#eee', alignItems: 'center', padding: 17, borderRadius:3,marginBottom:1
                        }}>
                            <span style={{ color: '#4c8aca', fontSize: 16 }}>{option}</span>
                        </div>
                    )
                } else {
                    optionItems.push(
                        <div key={i}
                            style={{
                                display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                                backgroundColor: '#eee', alignItems: 'center', padding: 17,borderRadius:3
                                
                            }}>
                            <span style={{ color: '#4c8aca', fontSize: 16 }}>{option}</span>
                        </div>
                    )
                }
            })
        } else {
            var defaultOptions = ['option1', 'option2', 'option3']
            defaultOptions.map((option, i) => {

                if (i != defaultOptions.length - 1) {
                    optionItems.push(
                        <div key={i} style={{
                            display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                            backgroundColor: '#eee', alignItems: 'center', padding: 17,borderRadius:3,marginBottom:1
                        }}>
                            <span style={{ color: '#4c8aca', fontSize: 16 }}>{option}</span>
                        </div>
                    )
                } else {
                    optionItems.push(
                        <div key={i}
                            style={{
                                display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                                backgroundColor: '#eee', alignItems: 'center', padding: 17,borderRadius:3
                            }}>
                            <span style={{ color: '#4c8aca', fontSize: 16 }}>{option}</span>
                        </div>
                    )
                }
            })
        }

        var className = 'ActionSheet'
        if (clicked == true)
            className += ' visible'

        return (
            <div className={className}
                style={{ display: 'flex', width: '100%', height: 200, backgroundColor: 'transparent', position: 'absolute',left:0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', padding: 6 }}>

                    <div style={{
                        display: 'flex', flex: '1 1 auto', flexDirection: 'column',
                        marginBottom: 10
                    }}>
                        <div style={{
                            display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                            backgroundColor: '#ddd', alignItems: 'center', padding: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4,
                            marginBottom: 1
                        }}>
                            <span style={{ color: '#666', fontSize: 14 }}>{title}</span>
                        </div>

                        {optionItems}

                    </div>

                    <div style={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'center', flex: '0 1 auto', alignItems: 'center',
                        borderRadius: 3, backgroundColor: '#eee', padding: 12
                    }}>
                        <span style={{ color: 'rgb(224, 80, 71)', fontSize: 15 }}>Cancel</span>
                    </div>
                </div>
            </div>
        )

    }

    componentDidMount() {
        //将该组件实例在actionSheetReducer中进行登记
        if (this.props.haff) {
            var { attributes } = this.props
            var { ref } = attributes
            if (ref && ref != '')
            {
                if(Object.prototype.toString.call(ref)=='[object Object]')
                {
                    var keys=_.keys(ref)
                    var ob=ref[keys[0]]
                    //求导出赋值到的成员
                    var refName=null
                    while(ob.type!='ThisExpression'&&ob.type!='Identifier')
                    {
                        refName=ob.property.name
                        ob=ob.object
                    }
                    if(ob.type=='ThisExpression'&&refName!=null)
                    {
                        this.refName=refName
                        this.props.dispatch(onActionSheetInit(refName, this.props.haff))
                    }
                        
                }
                
            }
        }
    }

    componentWillUnmount() {

        //取消登记
        if (this.props.haff) {
            if(this.refName)
                this.props.dispatch(onActionSheetDestroy(this.refName, this.props.haff))
        }

    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '0 0 auto',
        width: '320px',
        height: '560px',
        flexDirection: 'column',
        justifyContent: 'center'
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

export default connect()(ActionSheetInflater);

