/**
 * 该reducer处理以下信息:
 * 1.模式切换
 * 2.组件树的展开状态维护
 */

import {
    SWITCH_TO_DESIGN,
    SWITCH_TO_CODE
} from '../constants/SwitchConstants';





const initialState = {
    status: 'code'
};

const design = (state = initialState, action) => {

    switch (action.type) {


        case SWITCH_TO_CODE:

            return Object.assign({}, state, {
                status: 'code',
            });
     
        case SWITCH_TO_DESIGN:

            return Object.assign({}, state, {
                status: 'design'
            })

        default:
            return state;
    }
}

export default design;
