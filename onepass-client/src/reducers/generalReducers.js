import { toast } from "react-hot-toast"
import { generalConstatnts, authConsts } from '../actions/constants'

let mode = localStorage.getItem('mode')
if (mode === null || mode === undefined) {
    mode = 'dark'
    localStorage.setItem('mode', 'dark')
}
const initState = {
    mode: mode,
    loading: false,
    keyExTriggered: false
}
export default (state = initState, action) => {
    switch (action.type) {
        case generalConstatnts.MODE_CHANGE_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break
        case generalConstatnts.SET_MODE_DARK:
            toast('Hello Darkness!',
                {
                    icon: '🌙',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                    id: 'dMode'
                }
            );
            state = {
                ...state,
                mode: 'dark',
                loading: false
            }
            localStorage.setItem('mode', 'dark')
            break

        case generalConstatnts.SET_MODE_LIGHT:
            toast('Hello Sunshine!',
                {
                    icon: '🔆',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                    id: 'dMode'
                }
            );
            state = {
                ...state,
                mode: 'light',
                loading: false
            }
            localStorage.setItem('mode', 'light')
            break
        
        case generalConstatnts.KEY_EXCHANGE_SUCCESS:
            state = {
                ...state,
                keyExTriggered: true
            }
            break
        
        case authConsts.LOGOUT_SUCCESS:
            state = {
                ...initState
            }
            break
    }

    return state
}