import _ from 'lodash'

import {
    UPDATE_COMPONENT_TREE_SCROLL,
} from '../constants/scrollConstants';
import { clearInterval } from 'timers';


const initialState = {
    scrollTop: 0,
    fraction:0.2,
    tasks: []
};

const scroll = (state = initialState, action) => {

    switch (action.type) {
        case UPDATE_COMPONENT_TREE_SCROLL:
            var { scrollTop } = action.payload
            
            
            var ele = document.getElementById('scroll-container')
            var timerId=null
            if (ele)//步进值25
            {
                if(scrollTop>ele.scrollHeight-ele.clientHeight)//大于最大偏移
                {
                    scrollTop=ele.scrollHeight-ele.clientHeight
                }else if(scrollTop<0)
                {
                    scrollTop=0
                }
                var f=function () {
                    var scrollNow = ele.scrollTop
                    
                    
                    if (Math.abs(scrollNow - scrollTop )< 5) {
                        window.clearInterval(timerId) 
                        ele.scrollTop=scrollTop
                    } else {
                        
                        if (scrollNow < scrollTop)
                        {
                            var offset=Math.abs(scrollNow-scrollTop)*state.fraction
                            ele.scrollTop +=offset
                        }
                        else
                        {
                            
                            ele.scrollTop -=Math.abs(scrollNow-scrollTop)*state.fraction
                        }
                    }
                }

                timerId = setInterval(f, 30)
            }

            
            return Object.assign({}, state, {
                scrollTop: scrollTop,
            });
        default:
            return state;
    }
}

export default scroll;
