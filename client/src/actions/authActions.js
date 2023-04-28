import { toast } from "react-hot-toast"
import axiosInstance from "../helpers/axios"
import { authConsts } from "./constants"
import Cookies from 'universal-cookie'
import { decryptAES, decryptRSA, importRSAPrivKey } from "encrypt"
import CryptoJS from "crypto-js"

const cookies = new Cookies()

export const genKeys = (form) => {
    return async dispatch => {
        dispatch({
            type: authConsts.KEY_GEN_REQUEST
        })
        
        const res = await axiosInstance.post("/auth/genkeys", form)

        if(res.status === 201) {
            toast.success("Key Generation Success")
            dispatch({
                type: authConsts.KEY_GEN_SUCCESS
            })
            return true
        }
        else if (res.response) {
            toast.error(res.response.data.message)
            dispatch({
                type: authConsts.KEY_GEN_FAILED
            })
            return false
        }
    }
}

export const addData = (form) => {
    return async dispatch => {
        dispatch({
            type: authConsts.USER_DATA_ADD_REQUEST
        })
        const res = await axiosInstance.post("/auth/add-user-data", form)
        if(res.status === 201) {
            toast.success("Registered")
            dispatch({
                type: authConsts.USER_DATA_ADD_SUCCESS
            })
            return true
        }
        else if (res.response) {
            toast.error(res.response.data.message)
            dispatch({
                type: authConsts.USER_DATA_ADD_FAILED
            })
            return false
        }
    }
}

export const signInReq = (form) => {
    return async dispatch => {
        dispatch({
            type: authConsts.USER_LOGIN_REQUEST
        })
        const res = await axiosInstance.post("/auth/signin-request", form)

        if(res.status === 200){
            toast.success("User verification success")
            dispatch({
                type: authConsts.USER_LOGIN_REQUEST_SUCCESS,
                payload: res.data.payload
            })
            return true
        }
        else if (res.response) {
            toast.error(res.response.data.message)
            dispatch({
                type: authConsts.USER_LOGIN_REQUEST_FAILED
            })
            return false
        }
    }
}

export const login = (form, password) => {
    return async (dispatch) => {
        
        dispatch({ type: authConsts.LOGIN_REQUEST })
        const res = await axiosInstance.post('/auth/signin', form)
        if (res.status === 200) {
            const user = res.data.user
            const token = res.data.token
            const refreshToken = res.data.refreshToken

            const decPrivate = (await decryptAES(user.privateKey, password)).toString(CryptoJS.enc.Utf8)
            const importedPrivKey = await importRSAPrivKey(decPrivate)
            console.log(importedPrivKey)

            const masterKey = await decryptRSA(user.masterKey, importedPrivKey)
            const firstName = (await decryptAES(user.firstName, masterKey)).toString(CryptoJS.enc.Utf8)
            const lastName = (await decryptAES(user.lastName, masterKey)).toString(CryptoJS.enc.Utf8)
            const contact = (await decryptAES(user.contact, masterKey)).toString(CryptoJS.enc.Utf8)

            const decUser = {
                'firstName': firstName,
                'lastName':lastName,
                'email':user.email,
                'contact': contact
            }

            const decUserState = {
                'firstName': firstName,
                'lastName':lastName,
                'email':user.email,
                'contact': contact,
                'masterKey': masterKey
            }
    
            toast.success(`Login Success, Welcome ${decUser.firstName}`, {
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

            sessionStorage.setItem('user', JSON.stringify(decUser))
            dispatch({
                type: authConsts.LOGIN_SUCCESS,
                payload: {
                    'user':decUserState,
                    token
                }
            })
        } 
        else if (res.response) {
            toast.error(res.response.data.message)
            dispatch({
                type: authConsts.LOGIN_FALIURE
            })
            return false
        }
    }
}

export const isLoggedIn = () => {
    return async (dispatch) => {
        const token = cookies.get('token')
        if (token) {
            const user = JSON.parse(sessionStorage.getItem('user'))
            if (user) {
                dispatch({
                    type: authConsts.LOGIN_SUCCESS,
                    payload: {
                        token,
                        'user':user
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
            sessionStorage.clear()
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
    const user = JSON.parse(sessionStorage.getItem('user'))
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
            window.location.href = '/'
        }
        else if (res.response) {
            toast.error(res.response.data.message)
            window.location.href = '/'
        }
    }

}

export const passResetRequest = (form) => {
    return async dispatch => {
        const res = await axiosInstance.post("/auth/pass-reset-request", form)

        if (res.status === 201) {
            toast.success("Password Reset Email Sent")
        }
        else if (res.response) {
            console.log(res.response)
            toast.error(res.response.data.message)
        }
    }
}