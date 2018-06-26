import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import Rodal from 'rodal';
import '../../../../../node_modules/rodal/lib/rodal.css';
var Spinner = require('react-spinkit')
import {
    makeLibraryWarningVisible,
    makeLibraryWarningUnVisible
} from '../../actions/rodalActions'
import {
    makeConsoleVisible,
} from '../../actions/consoleActions'
import {
    intergrateWithLibrary
} from '../../actions/npmActions'
import {
    getProjPath
} from '../../actions/projectActions'

class LibraryWarningRodal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            visible: props.visible ? props.visible : false,
            animation: 'zoom',
            doingInstall: false
        }
    }

    show(animation) {
        this.setState({
            animation,
            visible: true
        });
    }

    hide() {
        this.setState({ visible: false });
    }

    render() {

        var props = this.props
        let types = ['zoom', 'fade', 'flip', 'door', 'rotate', 'slideUp', 'slideDown', 'slideLeft', 'slideRight'];

        var { doingInstall } = this.state

        let buttons = types.map((value, index) => {
            let style = {
                animationDelay: index * 100 + 'ms',
                WebkitAnimationDelay: index * 100 + 'ms'
            };
            return (
                <button key={index} className="btn scale" onClick={this.show.bind(this, value)} style={style}>
                    {value}
                </button>
            )
        });


        const { text, onRequestClose } = this.props;
        return (
            <Rodal visible={this.props.visible}
                onClose={() => {
                    props.dispatch(makeLibraryWarningUnVisible())
                }}
                animation={this.state.animation}
                height={100}
                width={300}
                className=' library-warning-modal'
            >
                <div className="header"
                    style={{ fontFamily: 'sans-serif', color: '#222', marginBottom: 10, textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em' }}>
                    Warning
                </div>
                {
                    doingInstall ?
                        <div style={{ display: 'flex', flexDirection: 'row', flex: '1 0 auto', justifyContent: 'center', padding: 3 }}>
                            <Spinner spinnerName="circle" />
                        </div> :
                        <div className="body" style={{ fontFamily: 'sans-seif', color: '#555', textAlign: 'center' }}>
                            install {props.npmName} ?
                        </div>
                }

                <hr />

                {
                    doingInstall ?
                        null :
                        <button style={{ fontSize: '1.4em', color: '#6fc3df', position: 'absolute', left: '20%', border: 0, background: 'transparent', cursor: 'pointer' }}
                            onClick={() => {
                                //打开控制台
                                //props.dispatch(makeConsoleVisible())
                            
                                this.setState({ doingInstall: true })
                                props.dispatch(intergrateWithLibrary(getProjPath(), props.npmName)).then((json) => {
                                    this.setState({ doingInstall: false })
                                    props.dispatch(makeLibraryWarningUnVisible())
                                })
                            

                            }}>
                            OK
                        </button>
                }

                {
                    doingInstall?
                        null:
                        <div style={{ height: 35, background: '#aaa', width: 1, position: 'absolute', left: '50%' }}></div>
                }


                <button style={{ fontSize: '1.4em', color: '#6fc3df', position: 'absolute', right: '20%', border: 0, background: 'transparent', cursor: 'pointer' }}
                    onClick={() => {
                        props.dispatch(makeLibraryWarningUnVisible())
                    }}>
                    cancel
                </button>


            </Rodal>
        );
    }

}

const styles = {


}


const mapStateToProps = (state, ownProps) => {

    var props = {}
    props.visible = state.rodal.libraryWarning.visible
    props.npmName = state.rodal.libraryWarning.npmName
    return props
}

export default connect(mapStateToProps)(LibraryWarningRodal)

