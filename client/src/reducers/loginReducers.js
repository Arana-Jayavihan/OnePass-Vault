import { loginConsts } from "actions/constants"

const initState = {
    loading: false,
    adding: false,
    updating: false,
    deleting: false,
    logins: []
}

export default (state = initState, action) => {
    switch(action.type){
        default:
            state = {
                ...initState
            }
            break
        case loginConsts.GET_ALL_USER_LOGINS_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break
        case loginConsts.GET_ALL_USER_LOGINS_SUCCESS:
            state = {
                ...state,
                loading: false,
                logins: action.payload
            }
            break
        case loginConsts.GET_ALL_USER_LOGINS_FAILED:
            state = {
                ...state,
                loading: false
            }
            break
        case loginConsts.ADD_USER_LOGIN_REQUEST:
            state = {
                ...state,
                adding: true
            }
            break
        case loginConsts.ADD_USER_LOGIN_SUCCESS:
            state = {
                ...state,
                adding: false,
                logins: action.payload
            }
            break
        case loginConsts.ADD_USER_LOGIN_FAILED:
            state = {
                ...state,
                adding: false
            }
            break
        case loginConsts.REMOVE_USER_LOGIN_REQUEST:
            state = {
                ...state,
                deleting: true
            }
            break
        case loginConsts.REMOVE_USER_LOGIN_SUCCESS:
            state = {
                ...state,
                deleting: false,
                logins: action.payload
            }
            break
        case loginConsts.REMOVE_USER_LOGIN_FAILED:
            state = {
                ...state,
                deleting: false
            }
            break
        case loginConsts.UPDATE_USER_LOGIN_REQUEST:
            state = {
                ...state,
                updating: true
            }
            break
        case loginConsts.UPDATE_USER_LOGIN_SUCCESS:
            state = {
                ...state,
                updating: false,
                logins: action.payload
            }
            break
        case loginConsts.UPDATE_USER_LOGIN_FAILED:
            state = {
                ...state,
                updating: false
            }
            break
        case loginConsts.REMOVE_LOGINS:
            state = {
                ...state,
                logins: []
            }
            break
    }
    return state
}