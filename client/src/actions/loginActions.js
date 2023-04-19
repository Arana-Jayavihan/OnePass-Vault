import { toast } from "react-hot-toast"
import axiosInstance from "../helpers/axios"
import { loginConsts } from "./constants"

export const addUserLogin = (form) => {
    return async dispatch => {
        dispatch({
            type: loginConsts.ADD_USER_LOGIN_REQUEST
        })
        const res = await axiosInstance.post("/contract/add-login", form)

        if(res.status === 201){
            toast.success("Login Saved", {id: 'las'})
            dispatch({
                type: loginConsts.ADD_USER_LOGIN_SUCCESS,
                payload: res.data.payload
            })
        }
        else if(res.response){
            toast.error(res.response.data.message, {id: 'lae'})
            dispatch({
                type: loginConsts.ADD_USER_LOGIN_FAILED
            })
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