
import {
    ON_FUNCTION_SELECT
} from '../constants/functionConstants';

//选中功能模板
export const selectFunction=(type)=>{
    return {
        type:ON_FUNCTION_SELECT,
        payload:{
            type
        }
    }
}
