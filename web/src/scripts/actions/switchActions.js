/**
 * Created by danding on 17/5/9.
 */
import {
    SWITCH_TO_DESIGN,
    SWITCH_TO_CODE
} from '../constants/SwitchConstants';

//切入代码模式
export const switchToCode  = ()=> {
    return {
        type: SWITCH_TO_CODE,
        payload:{}
    }
}

//切入设计模式
export const switchToDesign=()=>{
    return {
        type:SWITCH_TO_DESIGN,
        payload:{}
    }
}

//比对2个文件
