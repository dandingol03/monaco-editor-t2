
import React, { Component, PropTypes, } from 'react'
import Folder from './Folder';
import File from './File';


/**
 * 上下文菜单是针对
 */

class FileTree extends Component {

    constructor(props) {
        super(props)
        this.state={
            stats:[
                {
                    type:'folder',name:'public',files:
                    [
                        {type:'file',name:'index.js'},
                        {type:'file',name:'config.js'},
                        {type:'folder',name:'components',files:
                            [
                                {type:'file',name:'CodeEditor.jsx'}
                            ]}
                    ]
                },
                {
                    type:'file',name:'webpack.config.js'
                }

            ]
        }
    }

    onFolderClick(parent,i)
    {
        console.log();
        console.log();
        console.log();
        console.log();

        if(parent)
            parent['files'][i].collapsed=(parent['files'][i].collapsed!=true);
        else
            this.state.stats[i].collapsed=(this.state.stats[i].collapsed!=true);
        this.setState({stats:this.state.stats});
    }

    traverse(tree,parent)
    {
        var arr=[];

        tree.map((sub,i)=>{
           if(sub.type=='folder')
           {
               //文件夹
                arr.push(
                    <Folder key={i} filename={sub.name} collapsed={sub.collapsed}
                            onClick={()=>{
                                this.onFolderClick(parent,i)
                            }}
                    >
                        {
                            sub.files!=null&&sub.files.length>0?
                                <ul>
                                    {this.traverse(sub.files,parent==null?this.state.stats[i]:parent[i])}
                                </ul>:null
                        }
                    </Folder>
                );
           }else{
               //文件
               arr.push(
                   <File key={i} filename={sub.name}
                         onClick={()=>{
                             this.onFolderClick(parent,i)
                         }}
                   />
               )
           }
        });

        return arr;
    }

    render() {

        var state=this.state;
        var props=this.props;
        var stats=state.stats;


        return (
            <ul className="file-tree" ref="file-browser">
                {
                    this.traverse(stats,null,0)
                }
            </ul>
        )
    }

    componentDidMount() {

    }

}

const styles={
    container:{
        flex: '1 1 auto',
        display: 'flex',
        height:'500px'
    },
    row:{
        display:'flex',
        flex:'1 1 auto',
        flexDirection:'row',
        alignItems:'center'
    }
}


export default FileTree
