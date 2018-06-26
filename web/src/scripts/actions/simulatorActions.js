import _ from 'lodash'
import {
    SET_PHONE_SIMULATOR,
  } from '../constants/simulatorConstants';
  
  export const setPhoneSimulator=(name)=>{
    return (dispatch) => {
      dispatch({
        type: SET_PHONE_SIMULATOR,
        payload: {
            name
        }
      })
    }
  }
  
  
  