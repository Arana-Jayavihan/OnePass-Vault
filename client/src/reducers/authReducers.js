import { authConsts } from "../actions/constants"

const initState = {
    user: {},
    authenticated: false,
    authenticating: false,
    loading: false,
}

export default (state = initState, action) => {
    switch (action.type) {
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
                ...state,
                loading: false
            }
            break
        case authConsts.SIGNUP_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break
        case authConsts.SIGNUP_SUCCESS:
            state = {
                ...state,
                loading: false
            }
            break
        case authConsts.SIGNUP_FAILED:
            state = {
                ...state,
                loading: false
            }
            break
    }
    return state
}