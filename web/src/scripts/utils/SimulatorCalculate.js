
import _ from 'lodash'

import { 
    simulators
 } from '../constants/simulatorConstants'

export default {
    mapToSimulatorSize(monitor,size) {
        var {width,height,dpi}=monitor
        try{
            var mappedSize=(parseInt(size)*dpi/160)*300/width
            return Math.floor(mappedSize)
        }catch(e)
        {
            console.error(e)
            return null
        }
        
    }
}
