
import _ from 'lodash'
import {
    ON_DATE_PICKER_INIT,
    ON_DATE_PICKER_DESTROY,
    MAKE_DATE_PICKER_MODAL_VISIBLE,
    MAKE_DATE_PICKER_MODAL_INVISIBLE,
    MAKE_BACK_DROP_VISIBLE,
    MAKE_BACK_DROP_UNVISIBLE
} from '../constants/datePickerConstants';

/**
 * instance,保存着对应单个页面datepicker的唯一标识,这里采用路径,并通过64编程成id  =>    
 *      const buffer = new Buffer(haff);
        const id = buffer.toString('hex');

        var buf = new Buffer(id, 'hex')
        filePath = buf.toString()
 * 
 */

const initialState = {
    instance: {},
    pickerVisible: false
};

const datePicker = (state = initialState, action) => {

    switch (action.type) {
        case ON_DATE_PICKER_INIT:
            var { haff, ref } = action.payload

            return Object.assign({}, state, {
                instance: Object.assign(state.instance, { [ref]: { haff, ref } })
            });
        case ON_DATE_PICKER_DESTROY:
            var { haff, ref } = action.payload
            var _instance = _.cloneDeep(state.instance)
            if (_instance[ref])
                delete _instance[ref]
            return Object.assign({}, state, {
                instance: _instance
            });
        case MAKE_BACK_DROP_VISIBLE:
            return Object.assign({}, state, {
                backdrop: true
            });
        case MAKE_BACK_DROP_UNVISIBLE:
            return Object.assign({}, state, {
                backdrop: false
            });
        case MAKE_DATE_PICKER_MODAL_VISIBLE:
            return Object.assign({}, state, {
                pickerVisible: true
            });
        case MAKE_DATE_PICKER_MODAL_INVISIBLE:
            return Object.assign({}, state, {
                pickerVisible: false
            });

        default:
            return state;
    }
}

export default datePicker;
