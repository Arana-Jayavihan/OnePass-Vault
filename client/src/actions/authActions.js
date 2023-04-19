import { toast } from "react-hot-toast"
import axiosInstance from "../helpers/axios"
import { authConsts } from "./constants"
import Cookies from 'universal-cookie'

const cookies = new Cookies()

export const signup = (form) => {
    return async dispatch => {
        dispatch({
            type: authConsts.SIGNUP_REQUEST
        })
        const res = await axiosInstance.post("/auth/signup", form)
        if(res.status === 201){
            toast.success("Sign Up Success")
            dispatch({
                type: authConsts.SIGNUP_SUCCESS
            })
        }
        else if(res.response){
            toast.error(res.response.data.message)
            dispatch({
                type: authConsts.SIGNUP_FAILED
            })
        }
    }
}

export const login = (form) => {
    return async (dispatch) => {
        dispatch({ type: authConsts.LOGIN_REQUEST })
        const res = await axiosInstance.post('/auth/signin', form)
        if (res.status === 200) {
            const user = res.data.user
            const token = res.data.token
            const refreshToken = res.data.refreshToken
            toast.success(`Login Success, Welcome ${user.firstName}`, {
                id: 'login'
            })
            cookies.set("token", token, {
                path: '/',
                maxAge: '3600000',
                sameSite: "lax",
                secure: true,
                httpOnly: false
            })
            cookies.set("refreshToken", refreshToken, {
                path: '/',
                maxAge: '86400000',
                sameSite: "lax",
                secure: true,
                httpOnly: false
            })

            localStorage.setItem('user', JSON.stringify(user))
            dispatch({
                type: authConsts.LOGIN_SUCCESS,
                payload: {
                    user,
                    token
                }
            })
        } else {
            if (res.response.status === 400) {
                toast.error("Something Went Wrong!")
                dispatch({
                    type: authConsts.LOGIN_FALIURE
                })
            }
            else if (res.response.status === 402) {
                toast.error("Invalid Credentials...")
                dispatch({
                    type: authConsts.LOGIN_FALIURE
                })
            }
            else if (res.response.status === 404) {
                toast.error("User Not Found...")
                dispatch({
                    type: authConsts.LOGIN_FALIURE
                })
            }
        }
    }
}

export const isLoggedIn = () => {
    return async (dispatch) => {
        const token = cookies.get('token')
        if (token) {
            const user = JSON.parse(localStorage.getItem('user'))
            if (user) {
                dispatch({
                    type: authConsts.LOGIN_SUCCESS,
                    payload: {
                        token,
                        user
                    }
                })
            }

        } else {
            dispatch({
                type: authConsts.LOGIN_FALIURE,
                payload: { error: 'Failed to login' }
            })
        }
    }
}

export const signout = () => {
    return async (dispatch) => {
        dispatch({ type: authConsts.LOGOUT_REQUEST })
        let refreshToken = cookies.get('refreshToken')
        let token = cookies.get('token')
        const form = {
            'refreshToken': refreshToken,
            'token': token
        }
        const res = await axiosInstance.post(`/auth/signout`, form)

        if (res.status === 200) {
            toast.success("Logged Out Successfully!", { id: 'lOut' })
            localStorage.clear()
            cookies.remove('token', {
                path: '/'
            })
            cookies.remove('refreshToken', {
                path: '/'
            })
            dispatch(
                { type: authConsts.LOGOUT_SUCCESS }
            )
        }
        else {
            dispatch(
                {
                    type: authConsts.LOGOUT_FAILED
                })
        }
    }
}

export const tokenRefresh = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    let refreshToken = cookies.get('refreshToken')
    let token = cookies.get('token')
    const form = {
        'refreshToken': refreshToken,
        'token': token,
        'email': user.email
    }

    return async () => {
        const res = await axiosInstance.post('/auth/token', form)
        token = res.data.token
        refreshToken = res.data.refreshToken
        cookies.set("token", token, {
            path: '/',
            maxAge: '3600000',
            sameSite: "lax",
            secure: true,
            httpOnly: false
        })
        cookies.set("refreshToken", refreshToken, {
            path: '/',
            maxAge: '86400000',
            sameSite: "lax",
            secure: true,
            httpOnly: false
        })
        toast.success("Session Extended!", { id: 'token' })
    }
}

export const passReset = (form) => {
    return async dispatch => {
        const res = await axiosInstance.post("/auth/pass-reset", form)

        if (res.status === 201) {
            toast.success("Password Reset Success")
            window.location.href='/'
        }
        else if (res.response) {
            toast.error(res.response.data.message)
            window.location.href='/'
        }
    }

}

export const passResetRequest = (form) => {
    return async dispatch => {
        const res = await axiosInstance.post("/auth/pass-reset-request", form)

        if(res.status === 201){
            toast.success("Password Reset Email Sent")
        }
        else if(res.response){
            console.log(res.response)
            toast.error(res.response.data.message)
        }
    }
}