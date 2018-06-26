import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import ItemTypes from '../../constants/ItemTypes';


class ListRow extends Component {

    constructor(props) {
        super(props)

        this.state = {
            tag: props.tag ? props.tag : null,
            index: props.index ? props.index : null,
        }
    }

    render() {





        var props = this.props;
        //以json格式存放style属性
        var styleMap = props.styleMap;
        var className = '';
        var style = {};
        style.display = 'flex'

        

        if (props.clicked == true)
            className += ' clicked'

        var row = 0
        if (props.row) {
            row = props.row
        }
        var column = 4
        if (props.column)
            column = props.column
        
        var fields=['field1','field2','field3','field4']
        if(props.fields)
            fields=props.fields

        var rows = []
        for (var i = 0; i < row; i++) {
            var columns = []
            for (var j = 0; j < column; j++) {
                if (i % 2 == 0) {
                    columns.push(
                        <div key={j} style={{
                            flex: '1 1 auto', flexDirection: 'row', justifyContent: 'center', background: '#eee',
                            alignItems: 'center', display: 'flex'
                        }}>
                        ...
                        </div>)
                } else {
                    columns.push(
                        <div key={j} style={{
                            flex: '1 1 auto', flexDirection: 'row', justifyContent: 'center', background: '#fff',
                            alignItems: 'center', display: 'flex'
                        }}>
                        ...
                        </div>)
                }

            }
            rows.push(
                <div key={i} style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 27 }}>
                    {columns}
                </div>)
        }

        var headerItems = []
        for (var j = 0; j < fields.length; j++) {
            headerItems.push(
                <div key={j} style={{
                    flex: '1 1 auto', flexDirection: 'row', justifyContent: 'center',fontSize:12,
                    alignItems: 'center', display: 'flex',color:'#222'
                }}>
                    {fields[j]}
                </div>
            )
        }





        return (

            <div id={props.id} className={'ListRow'} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }} >
                <div key={-1} style={{ display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 27 }}>
                    {headerItems}
                </div>
                {rows}
            </div>

        )
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


export default connect()(ListRow);
