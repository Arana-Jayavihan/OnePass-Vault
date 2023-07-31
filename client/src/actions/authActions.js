import { toast } from "react-hot-toast"
import axiosInstance from "../helpers/axios"
import { authConsts } from "./constants"
import Cookies from 'universal-cookie'
import { decryptAES, decryptRSA, importRSAPrivKey } from "encrypt"
import CryptoJS from "crypto-js"

export const genKeys = (form) => {
    return async dispatch => {
        dispatch({
            type: authConsts.KEY_GEN_REQUEST
        })

        const res = await axiosInstance.post("/auth/genkeys", form)

        if (res.status === 201) {
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
        if (res.status === 201) {
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

        if (res.status === 200) {
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

            const decPrivate = (await decryptAES(user.privateKey, password)).toString(CryptoJS.enc.Utf8)
            const importedPrivKey = await importRSAPrivKey(decPrivate)

            const masterKey = await decryptRSA(user.masterKey, importedPrivKey)
            const firstName = (await decryptAES(user.firstName, masterKey)).toString(CryptoJS.enc.Utf8)
            const lastName = (await decryptAES(user.lastName, masterKey)).toString(CryptoJS.enc.Utf8)
            const contact = (await decryptAES(user.contact, masterKey)).toString(CryptoJS.enc.Utf8)

            const decUser = {
                'firstName': firstName,
                'lastName': lastName,
                'email': user.email,
                'contact': contact,
                'pubKey': user.publicKey
            }

            toast.success(`Login Success, Welcome ${decUser.firstName}`, {
                id: 'login'
            })

            sessionStorage.setItem('user', JSON.stringify(decUser))
            dispatch({
                type: authConsts.LOGIN_SUCCESS,
                payload: {
                    'user': decUser
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
        const user = JSON.parse(sessionStorage.getItem('user'))
        if (user) {
            const res = await axiosInstance.post('/auth/isloggedin', { 'email': user.email })
            if (res.status === 200) {
                dispatch({
                    type: authConsts.LOGIN_SUCCESS,
                    payload: {
                        'user': user
                    }
                })
            }
            else if (res.response) {
                toast.error(res.response.data.message)
                dispatch({
                    type: authConsts.LOGIN_FALIURE
                })
            }
        }
        else {
            signout()
        }
    }
}

export const signout = () => {
    return async (dispatch) => {

        dispatch({ type: authConsts.LOGOUT_REQUEST })
        const res = await axiosInstance.post(`/auth/signout`)

        if (res.status === 200) {
            toast.success("Logged Out Successfully!", { id: 'lOut' })
            sessionStorage.clear()
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
    return async () => {
        const user = JSON.parse(sessionStorage.getItem('user'))
        if (user){
            const form = {
                'email': user.email
            }
            const res = await axiosInstance.post('/auth/token', form)
            if (res.status === 200) {
                toast.success("Session Extended!", { id: 'token' })
            }
        }
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