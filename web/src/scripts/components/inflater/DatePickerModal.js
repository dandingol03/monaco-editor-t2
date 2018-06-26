import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';
import FontAwesome from '../../../fonts/FontAwesome/FontAwesome'
import Ionicons from '../../../fonts/Ionicons/Ionicons'

import {
    onDatePickerInit,
    onDatePickerDestroy
} from '../../actions/datePickerActions'


/**
 * date-picker 共用模态框
 */
class DatePickerModal extends Component {


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
        var { data, options } = attributes
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
                            backgroundColor: '#eee', alignItems: 'center', padding: 17, borderRadius: 3, marginBottom: 1
                        }}>
                            <span style={{ color: '#4c8aca', fontSize: 16 }}>{option}</span>
                        </div>
                    )
                } else {
                    optionItems.push(
                        <div key={i}
                            style={{
                                display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                                backgroundColor: '#eee', alignItems: 'center', padding: 17, borderRadius: 3

                            }}>
                            <span style={{ color: '#4c8aca', fontSize: 16 }}>{option}</span>
                        </div>
                    )
                }
            })
        } else {

            var date = new Date()
            var curMonth = date.getMonth() + 1
            var curDate = date.getDate()
            var curDay = date.getDay()
            var pm = '上午'
            var curHour = date.getHours()
            //TODO:判断当前时间的上下午
            if (curHour > 12) {
                pm = '下午'
                curHour = curHour - 12
            }

            //构造日期数据
            var defaultOptions = []
            defaultOptions.push({ date: curMonth + '月' + (curDate - 2) + '日', day: '周' + (curDay - 2), pm: '', hour: curHour - 2 })
            if (pm == '下午')
                defaultOptions.push({ date: curMonth + '月' + (curDate - 1) + '日', day: '周' + (curDay - 1), pm: '上午', hour: curHour - 1 })
            else
                defaultOptions.push({ date: curMonth + '月' + (curDate - 1) + '日', day: '周' + (curDay - 1), pm: '', hour: curHour - 1 })

            defaultOptions.push({ date: '今天', day: '', pm: pm, hour: curHour })


            if (pm == '上午')
                defaultOptions.push({ date: curMonth + '月' + (curDate + 1) + '日', day: '周' + (curDay + 1), pm: '下午', hour: curHour + 1 })
            else
                defaultOptions.push({ date: curMonth + '月' + (curDate + 1) + '日', day: '周' + (curDay + 1), pm: '', hour: curHour + 1 })
            defaultOptions.push({ date: curMonth + '月' + (curDate + 2) + '日', day: '周' + (curDay + 2), pm: '', hour: curHour + 2 })




            defaultOptions.map((option, i) => {

                if (i != defaultOptions.length - 1) {

                    if (i == 2)//中间加亮
                    {
                        optionItems.push(
                            <div key={i}
                                style={{
                                    display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                                    backgroundColor: '#eee', alignItems: 'center', padding: 17, borderRadius: 3,marginTop:1,marginBottom:1
                                }}>

                                <span style={{ color: '#444', fontSize: 16,marginRight:6 }}>{option.date}</span>
                                <span style={{ color: '#444', fontSize: 16 ,marginRight:25}}>{option.day}</span>
                                <span style={{ color: '#444', fontSize: 16 }}>{option.pm}</span>
                                <span style={{ color: '#444', fontSize: 16 }}>{option.hour}</span>
                            </div>
                        )
                    } else {
                        optionItems.push(
                            <div key={i} style={{
                                display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                                backgroundColor: '#fff', alignItems: 'center', padding: 17, borderRadius: 3
                            }}>
                                <span style={{ color: '#ccc', fontSize: 16 ,marginRight:6}}>{option.date}</span>
                                <span style={{ color: '#aaa', fontSize: 16 ,marginRight:25}}>{option.day}</span>
                                <span style={{ color: '#aaa', fontSize: 16 }}>{option.pm}</span>
                                <span style={{ color: '#aaa', fontSize: 16 }}>{option.hour}</span>
                            </div>
                        )
                    }
                } else {


                    optionItems.push(
                        <div key={i}
                            style={{
                                display: 'flex', flexDirection: 'row', flex: '0 1 auto', justifyContent: 'center',
                                backgroundColor: '#fff', alignItems: 'center', padding: 17, borderRadius: 3
                            }}>



                            <span style={{ color: '#ccc', fontSize: 16 ,marginRight:6}}>{option.date}</span>
                            <span style={{ color: '#aaa', fontSize: 16 ,marginRight:25}}>{option.day}</span>
                            <span style={{ color: '#aaa', fontSize: 16 }}>{option.pm}</span>
                            <span style={{ color: '#aaa', fontSize: 16 }}>{option.hour}</span>
                        </div>
                    )


                }
            })
        }

        var className = 'DatePicker-Modal'
        if (pickerVisible == true)
            className += ' visible'

        return (
            <div className={className}
                style={{ display: 'flex', width: '100%', height: 240, backgroundColor: 'transparent', position: 'absolute' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>

                    <div style={{
                        display: 'flex', flex: '1 1 auto', flexDirection: 'column',

                    }}>
                        <div style={{
                            display: 'flex', flexDirection: 'row', flex: '0 1 auto', backgroundColor: '#ddd',
                            alignItems: 'center', padding: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4,
                             paddingTop: 15, paddingBottom: 15,border:'1px solid #bbb'
                        }}>

                            <div style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'row', alignItems: 'center' }}>
                                <span style={{ color: 'rgb(212, 88, 88)', fontSize: 16 }}>取消</span>
                            </div>

                            <div style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <span style={{ color: 'rgb(34, 173, 53)', fontSize: 16 }}>确认</span>
                            </div>

                        </div>

                        {optionItems}

                    </div>


                </div>
            </div>
        )

    }

    componentDidMount() {
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

const mapStateToProps = (state, ownProps) => {
    
        const props = {}
    
        props.pickerVisible = state.datePicker.pickerVisible
    
        return props
    }

export default connect(mapStateToProps)(DatePickerModal);

