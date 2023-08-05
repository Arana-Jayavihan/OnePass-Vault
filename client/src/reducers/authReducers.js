import { authConsts } from "../actions/constants"

const initState = {
    authChecking: false,
    user: {},
    verifying: false,
    authenticated: false,
    authenticating: false,
    loading: false,
    generating: false,
    hashPass: undefined
}

export default (state = initState, action) => {
    switch (action.type) {
        case authConsts.USER_LOGIN_REQUEST:
            state = {
                ...state,
                verifying: true
            }
            break
        case authConsts.USER_LOGIN_REQUEST_SUCCESS:
            state = {
                ...state,
                verifying: false,
                hashPass: action.payload
            }
            break
        case authConsts.USER_LOGIN_REQUEST_FAILED:
            state = {
                ...state,
                verifying: false
            }
            break
        case authConsts.LOGIN_REQUEST:
            state = {
                ...state,
                authenticating: true
            }
            break

        case authConsts.LOGIN_SUCCESS:
            state = {
                ...state,
                user: action.payload.user,
                authenticated: true,
                authenticating: false
            }
            break

        case authConsts.LOGIN_FALIURE:
            state = {
                ...state,
                authenticating: false
            }
            break

        case authConsts.LOGOUT_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break

        case authConsts.LOGOUT_SUCCESS:
            state = {
                ...initState
            }
            break

        case authConsts.LOGOUT_FAILED:
            state = {
                ...initState,
                loading: false,
            }
            break
        case authConsts.KEY_GEN_REQUEST:
            state = {
                ...state,
                generating: true
            }
            break
        case authConsts.KEY_GEN_SUCCESS:
            state = {
                ...state,
                generating: false
            }
            break
        case authConsts.KEY_GEN_FAILED:
            state = {
                ...state,
                generating: false
            }
            break
        case authConsts.USER_DATA_ADD_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break
        case authConsts.USER_DATA_ADD_SUCCESS:
            state = {
                ...state,
                loading: false
            }
            break
        case authConsts.USER_DATA_ADD_FAILED:
            state = {
                ...state,
                loading: false
            }
            break
        case authConsts.IS_LOGGEDIN_REQUEST:
            state = {
                ...state,
                authChecking: true
            }
            break
        case authConsts.IS_LOGGEDIN_SUCCESS:
            state = {
                ...state,
                authChecking: false,
            }
            break
        case authConsts.IS_LOGGEDIN_FAILED:
            state = {
                ...state,
                authChecking: false,
            }
            break
    }
    return state
}