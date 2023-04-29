import axiosInstance from "helpers/axios"
import { vaultConsts } from "./constants"
import { toast } from "react-hot-toast"

export const getUserAssignedVaults = (form) => {
    return async dispatch => {
        dispatch({
            type: vaultConsts.GET_USER_ASSIGN_VAULTS_REQUEST
        })
        const res = await axiosInstance.post("/vault/get-assigned-vaults", form)
        if (res.status === 200) {
            toast.success("Vaults list updated", {id: 'vfs'})
            dispatch({
                type: vaultConsts.GET_USER_ASSIGN_VAULTS_SUCCESS,
                payload: res.data.payload
            })
        }
        else if (res.response) {
            toast.error(res.response.data.message, { id: 'vff' })
            dispatch({
                type: vaultConsts.GET_USER_ASSIGN_VAULTS_FAILED
            })
        }
    }
}