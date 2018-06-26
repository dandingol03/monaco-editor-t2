import React, { Component, } from 'react'
import { connect } from 'react-redux'
import {
    activeTab,
    closeTab,
    makeLastTabActive
} from '../actions/tabActions';
import {
    disposeEditor,
    setCurrentDoc
} from '../actions/editorActions';
import {
    backToPrev
} from '../actions/fileActions';

class TabContainer extends Component {

    onClick(name) {
        //TODO:make the editor to be none firstly
        this.props.dispatch(activeTab({ name: name }))
    }

    onScroll(e) {
        e = e || window.event;

        if (e.wheelDelta) {
            var left = parseInt(this.refs.container.style.left.replace('px', ''))
            var width = this.refs.container.clientWidth
            var dValue = 15
            switch (e.wheelDelta) {
                case -120:
                    //滚轮向下,TabContainer往右滑动,当滑到left大于等于0就停止
                    if (left + dValue > 0)
                    { }
                    else {
                        left = left + 15
                        this.refs.container.style.left = left + 'px'
                    }

                    break;
                case 120:
                    //滚轮向上,TabContainer往左滑动
                    if (width + left > 115 + dValue) {
                        left = left - 15
                        this.refs.container.style.left = left + 'px'
                    } else { }
                    break;
            }
        }
    }

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.hover !== this.state.hover)
            this.setState({ hover: nextProps.hover })
    }

    render() {

        var { tabs } = this.props
        var arr = []
        if (tabs && tabs.length > 0) {
            tabs.map((tab, i) => {
                if (tab.changed == true)//tab对应的编辑器内容有所改动
                {
                    arr.push(
                        <li style={styles.row} key={i} className={tab.activate == true ? 'activated' : ''}
                            onClick={() => {
                                this.onClick(tab.name)
                            }}
                        >
                            <span>{tab.name}</span>
                            {
                                this.state.hover == true ?
                                    <span className='fa fa-times' style={styles.icon}
                                        onMouseLeave={() => {
                                            this.setState({ hover: false })
                                        }}>

                                    </span> :
                                    <span className='fa fa-circle' style={styles.icon}
                                        onMouseEnter={() => {
                                            this.setState({ hover: true })
                                        }}
                                    >

                                    </span>
                            }

                        </li>
                    )
                }
                else if (tab.activate == true) //选中tab
                {
                    arr.push(
                        <li key={i} className='activated' style={styles.row} onClick={() => {
                            this.onClick(tab.name)
                        }}>
                            <span>{tab.name}</span>
                            <span className='fa fa-times' style={styles.icon}
                                onClick={(event) => {
                                    this.props.dispatch(disposeEditor(tab.path))
                                    this.props.dispatch(closeTab(tab.path))
                                    this.props.dispatch(makeLastTabActive())
                                    this.props.dispatch(backToPrev())
                                    event.preventDefault();
                                    event.stopPropagation()
                                }}
                            >
                            </span>
                        </li>
                    )
                } else {
                    arr.push(
                        <li style={styles.row} key={i}
                            onClick={() => {
                                this.onClick(tab.name)
                            }}
                            onMouseEnter={() => {
                                this.setState({ hover: true })
                            }}
                            onMouseLeave={() => {
                                this.setState({ hover: false })
                            }}
                        >
                            <span>{tab.name}</span>
                            {
                                this.state.hover == true ?
                                    <span className='fa fa-times' style={styles.icon}
                                        onClick={() => {
                                            this.props.dispatch(disposeEditor(tab.path))
                                            this.props.dispatch(closeTab(tab.path))
                                        }}
                                    >
                                    </span> :
                                    null
                            }

                        </li>
                    )
                }
            })
        }


        return (
            <div className='Tab-Container' style={{ display: 'flex', flex: '0 0 auto' }}>
                <ul ref='container' style={{
                    display: 'flex', flex: '0 0 auto', flexDirection: 'row', position: 'absolute',
                    top: '0px', left: '0px'
                }}>
                    {arr}

                </ul>
            </div>
        )
    }

    componentDidMount() {

        this.refs.container.onmousewheel = this.onScroll.bind(this)
    }

}

const styles = {
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginLeft: '10px'
    }
}



const mapStateToProps = (state, ownProps) => {


    let doc = null
    const docId = state.monaco.openDocId
    const docCache = state.monaco.docCache
    if (docId && docCache) {
        if (docCache[docId]) {
            doc = docCache[docId]
        }
    }


    const props = {
        docCache: state.monaco.docCache,
        monacoDoc: doc,
        tabs: state.tab.tabs
    }

    return props
}

export default connect(mapStateToProps)(TabContainer)