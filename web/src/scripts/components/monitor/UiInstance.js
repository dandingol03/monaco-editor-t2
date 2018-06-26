import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import Utils from '../../utils/ArrayUtils';
import {
    setComponentSelected,
} from '../../actions/paletteActions';






class UiInstance extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }



    render() {

        var state = this.state;
        var props = this.props;

        //根据ref生成的单页面非ui组件实例,目前支持actionSheet
        var { instance ,selected} = this.props

        var arr = [];
        if (instance && _.keys(instance) && _.keys(instance).length > 0) {
            var keys = _.keys(instance)
            keys.map((refName, i) => {
                
                var isSelected=false
                var ref=instance[refName]
                if(Utils.compare(selected,ref.haff)==true)
                    isSelected=true

                

                arr.push(
                    <div key={i} className={isSelected?'instance activate':'instance'}
                        style={{
                            display: 'flex', flexDirection: 'row', flex: '0 1 auto', height: 22, justifyContent: 'center',
                            alignItems: 'center',borderRadius:2
                        }}
                        onClick={(event) => {
                            //TODO:比对是否该组件已选中
                            if(isSelected)
                            {}
                            else{
                                this.props.dispatch(setComponentSelected(ref.haff)) 
                            }
                            event = event || window.event;
                            event.preventDefault();
                            event.stopPropagation()
                        }}
                    >
                        <span className='icon-ref'></span>
                        <span style={{  fontSize: 11 }}>{refName}</span>
                    </div>)
            })
        }


        return (
            <div className="ui-instance" style={Object.assign(styles.container, { marginLeft: '1px' })}>
                <div style={{
                    display: 'flex', flex: '0 1 auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    height: 16, fontSize: 11, color: '#eee', padding: 4, background: '#666', border: 2, borderStyle: 'solid', borderColor: '#333',
                    borderBottomWidth: 0, borderTopWidth: 0,
                }}>
                    Ui instance
                </div>

                <div style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', border: '2px solid #222', backgroundColor: '#222' }}>
                    {arr}
                </div>

            </div>

        )
    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '2 1 auto',
        flexDirection: 'column',
        fontFamily: 'sans-serif'
    },
    row: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
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
        borderBottom: 0,
        padding: '4px',
        background: '#4c8aca'
    }
}

const mapStateToProps = (state, ownProps) => {

    var uiInstance = {}

    var actionSheet = state.actionSheet.instance
    var modal=state.modal.instance

    if (actionSheet)
        uiInstance = Object.assign(uiInstance, actionSheet)

    if(modal)
        uiInstance = Object.assign(uiInstance,modal)
    
    const props = {
        instance: uiInstance
    }

    if(state.palette.haff)
        props.selected=state.palette.haff

    return props
}

export default connect(mapStateToProps)(UiInstance);
