import axiosInstance from "helpers/axios"
import { vaultConsts } from "./constants"
import { toast } from "react-hot-toast"
import shortid from "shortid"
import { encryptRSA, generateMasterEncryptionKey, importRSAPubKey } from "encrypt"
import CryptoJS from "crypto-js"

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

export const addUserVault = (form) => {
    return async dispatch => {

        const tempVaultSecret = shortid.generate()
        const vaultKey = await generateMasterEncryptionKey(tempVaultSecret)
        const pubKey = await importRSAPubKey(form.publicKey)
        const encVaultKey = await encryptRSA(vaultKey, pubKey)
        const vaultKeyHash = CryptoJS.SHA512(vaultKey).toString()

        form = {
            ...form,
            encVaultKey,
            vaultKeyHash
        }
        dispatch({
            type: vaultConsts.ADD_USER_VAULT_REQUEST
        })
        const res = await axiosInstance.post("/vault/add-vault", form)
        if (res.status === 201){
            toast.success(res.data.message, {id: 'vas'})
            dispatch({
                type: vaultConsts.ADD_USER_VAULT_SUCCESS,
                payload: res.data.payload
            })
        }
        else if (res.response) {
            toast.error(res.response.data.message, { id: 'vaf' })
            dispatch({
                type: vaultConsts.GET_USER_ASSIGN_VAULTS_FAILED
            })
        }
    }
}