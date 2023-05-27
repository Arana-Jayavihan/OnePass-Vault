import { toast } from "react-hot-toast"
import axiosInstance from "../helpers/axios"
import { loginConsts } from "./constants"
import { encryptAES } from "encrypt"
import { decryptVaultLogins } from "./vaultActions"

export const addUserLogin = (form) => {
    return async dispatch => {
        dispatch({
            type: loginConsts.ADD_USER_LOGIN_REQUEST
        })
        const encLoginName = await encryptAES(form.loginName, form.vaultKey)
        const encLoginUrl = await encryptAES(form.loginUrl, form.vaultKey)
        const encLoginUserName = await encryptAES(form.loginUsername, form.vaultKey)
        const encLoginPassword = await encryptAES(form.loginPassword, form.vaultKey)
        const addLoginForm = {
            loginName: encLoginName,
            loginUrl: encLoginUrl,
            loginUsername: encLoginUserName,
            loginPassword: encLoginPassword,
            vaultIndex: form.vaultIndex,
            email: form.email
        }
        const res = await axiosInstance.post("/login/add-login", addLoginForm)

        if(res.status === 201){
            const decLogins = await decryptVaultLogins(res.data.payload, form.vaultKey)
            toast.success("Login Saved", {id: 'las'})
            dispatch({
                type: loginConsts.ADD_USER_LOGIN_SUCCESS,
                payload: decLogins
            })
            return true
        }
        else if(res.response){
            toast.error(res.response.data.message, {id: 'lae'})
            dispatch({
                type: loginConsts.ADD_USER_LOGIN_FAILED
            })
            return false
        }
    }
}

export const getAllUserLogins = (form) => {
    return async dispatch => {
        dispatch({
            type: loginConsts.GET_ALL_USER_LOGINS_REQUEST
        })
        const res = await axiosInstance.post("contract/get-all-user-logins", form)

        if(res.status === 200){
            toast.success("Logins fetched", {id: 'lfs'})
            dispatch({
                type: loginConsts.GET_ALL_USER_LOGINS_SUCCESS,
                payload: res.data.payload
            })
        }
        else if (res.response){
            toast.error(res.response.data.message, {id: 'lfe'})
            dispatch({
                type: loginConsts.ADD_USER_LOGIN_FAILED
            })
        }
    }
}