import { toast } from "react-hot-toast"
import { generalConstatnts } from "../actions/constants"

const initState = {
    mode: 'light',
    loading: false
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
            break
    }

    return state
}