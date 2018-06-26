
import request from '../ipc/Request'
import Proxy from '../utils/Proxy';
import Config from '../../../../config';
import {
    UPDATE_COMPONENT_TREE_SCROLL
} from '../constants/scrollConstants';

//设置组件树滚动
export const makeComponentTreeScroll=(scrollTop)=>{
    return {
        type:UPDATE_COMPONENT_TREE_SCROLL,
        payload:{
            scrollTop
        }
    }
}
