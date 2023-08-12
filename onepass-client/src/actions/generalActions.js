import { generalConstatnts } from "./constants.js";

export const switchMode = (mode) => {
    return async (dispatch) => {
        dispatch({
            type: generalConstatnts.MODE_CHANGE_REQUEST
        })
        if (mode === 'dark') {
            dispatch({ type: generalConstatnts.SET_MODE_LIGHT })
            localStorage.setItem('mode', 'light')

        }
        else {
            dispatch({ type: generalConstatnts.SET_MODE_DARK })
            localStorage.setItem('mode', 'dark')
        }
    }
}
