import React, { Component, } from 'react'
import { connect } from 'react-redux'
import CodeEditorDropTarget from '../components/CodeEditorDropTarget';
import DragAndDropMiddleware from '../middleware/editor/DragAndDropMiddleware';
import MonacoMiddleware from '../middleware/monaco/MonacoMiddleware';


/**
 * 在这里去做子结点的渲染
 * 1.循环迭代
 */


class TabbedEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            
        }
    }

    

    render() {

        var { tabs, visible, design } = this.props;

        var arr = []
        tabs.map((tab, i) => {

            var path = tab.path
            var buf = new Buffer(path);
            var id = buf.toString('hex');
            var doc = this.props.docCache[id]


            arr.push(
                <CodeEditorDropTarget key={i} display={tab.activate == true} docId={id} visible={visible}
                    middleware={{ monaco: MonacoMiddleware(this.props.dispatch, this.props._IStandaloneCodeEditor) }}
                    onImportItem={this.props.onImportItem}
                    _IStandaloneCodeEditor={this.props._IStandaloneCodeEditor}
                    path={tab.path}
                    content={doc.data}
                />
            )
        })

        var substitute = null
        if (tabs.length == 0) {
            substitute = (
                <div style={{
                    display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center', color: '#ccc',
                    fontSize: '3em', fontFamily: 'sans-serif'
                }}>
                    no content
            </div>)
        }

        var defaultStyle = {
            flexDirection: 'column',
            flex: '1 1 auto',
            alignItems: 'stretch',
            display: 'flex',
            background: '#222'
        }

        if (visible != true)
            defaultStyle.display = 'none'


        return (
            <div style={defaultStyle}>
                {arr}
                {
                    substitute
                }
            </div>
        )


    }
}

const styles = {
    container: {
        flexDirection: 'column',
        flex: '1 1 auto',
        alignItems: 'stretch',
        display: 'flex',
        background: '#222'
    }
}

const mapStateToProps = (state, ownProps) => {

    const props = {
        docCache: state.monaco.docCache,
        _IStandaloneCodeEditor: state.monaco._IStandaloneCodeEditor,
        tabs: state.tab.tabs,
    }

    if (state.designMode.status == 'code')
        props.visible = true;
    else
        props.visible = false;

    return props
}




export default connect(mapStateToProps)(TabbedEditor)