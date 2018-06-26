import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import PanelTextView from './PaletteTextView';
import ComponentLinear from '../dragged/ComponentLinear';
import ComponentView from '../dragged/ComponentView';
import ComponentTouchableOpacity from '../dragged/ComponentTouchableOpacity';
import ComponentText from '../dragged/ComponentText'
import ComponentToolbar from '../dragged/ComponentToolbar';
import ComponentListView from '../dragged/ComponentListView';
import ComponentScrollView from '../dragged/ComponentScrollView';
import ComponentTextInputWrapper from '../dragged/ComponentTextInputWrapper';
import ComponentIcon from '../dragged/ComponentIcon';
import ComponentActionSheet from '../dragged/ComponentActionSheet';
import ComponentAnimatedView from '../dragged/ComponentAnimatedView';

class PaletteSpecials extends Component {
    constructor(props) {
        super(props)

        this.state = {
            components: props.components ? props.components : null,
            special: props.special ? props.special : null
        }
    }



    render() {

        var props = this.props;

        var arr = [];
        props.components.map((component, i) => {

            var item = null;
            switch (component.label) {
                case 'Linear':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentLinear />
                        </div>
                    );
                    break;
                case 'View':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentView />
                        </div>);
                    break;
                case 'TouchableOpacity':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentTouchableOpacity />
                        </div>);
                    break;
                case 'ListView':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentListView />
                        </div>);
                    break;
                case 'ScrollView':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentScrollView />
                        </div>);
                    break;
                case 'Animated.View':
                    item = (
                    <div style={styles.comp} key={i}>
                        <ComponentAnimatedView />
                    </div>);
                    break;
                case 'TextView':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentText />
                        </div>);
                    break;
                case 'Toolbar':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentToolbar />
                        </div>);
                    break;
                case 'TextInputWrapper':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentTextInputWrapper />
                        </div>);
                    break;
                case 'Icon':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentIcon />
                        </div>);
                    break;
                case 'ActionSheet':
                    item = (
                        <div style={styles.comp} key={i}>
                            <ComponentActionSheet />
                        </div>);
                    break;
                default:
                    item = (
                        <div style={styles.comp} key={i}>
                            <div style={styles.icon} className={`icon-${component.icon}`}>
                            </div>
                            <div style={Object.assign(styles.item, { flex: '1 1 auto', marginLeft: '2px', alignItems: 'center' })}>
                                {component.label}
                            </div>
                        </div>);
                    break;
            }

            arr.push(item)
        });



        return (
            <div className="palette-row" style={Object.assign(styles.container)}>
                <div style={Object.assign({ display: 'flex', flex: '0 0 auto', flexDirection: 'row', alignItems: 'center' }, { height: '25px' })}>
                    <div style={Object.assign({ display: 'flex', flexDirection: 'row' }, { flex: '0 0 auto' })} className="special">
                    </div>

                    <div style={Object.assign(styles.item, { flex: '1 1 auto', marginLeft: '2px' })}>
                        {props.special}
                    </div>
                </div>
                {arr}
            </div>

        )
    }
}

const styles = {
    container: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        color: '#fff',
        fontSize: '11px',
        padding: '2px',
        paddingLeft: '6px',
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
    comp: {
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        height: '26px',
        marginLeft: '5px'
    },
    icon: {
        display: 'flex',
        flexDirection: 'row',
        flex: '0 0 auto',
        alignItems: 'center'

    }
}


export default connect()(PaletteSpecials);
