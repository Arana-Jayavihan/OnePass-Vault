import axiosInstance from "helpers/axios"
import { vaultConsts } from "./constants"
import { toast } from "react-hot-toast"
import shortid from "shortid"
import { decryptAES, decryptRSA, encryptAES, generateMasterEncryptionKey, importRSAPrivKey } from "encrypt"
import CryptoJS from "crypto-js"

export const getUserAssignedVaults = (form) => {
    return async dispatch => {
        dispatch({
            type: vaultConsts.GET_USER_ASSIGN_VAULTS_REQUEST
        })
        const res = await axiosInstance.post("/vault/get-assigned-vaults", form)
        if (res.status === 200) {
            toast.success("Vaults list updated", { id: 'vfs' })
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
        dispatch({
            type: vaultConsts.ADD_USER_VAULT_REQUEST
        })
        const getKeysForm = {
            email: form.email
        }
        const hashRes = await axiosInstance.post("/keys/get-user-hash-pass", getKeysForm)
        if (hashRes.status === 200) {
            const userHashPass = hashRes.data.payload
            if (CryptoJS.SHA512(form.pass).toString(CryptoJS.enc.Base64) === userHashPass) {
                const masterKeyRes = await axiosInstance.post("/keys/get-master-key", getKeysForm)
                if (masterKeyRes.status === 200) {
                    const encMasterKey = masterKeyRes.data.payload
                    const privKeyRes = await axiosInstance.post("/keys/get-priv-key", getKeysForm)
                    if (privKeyRes.status === 200) {
                        const encPrivKey = privKeyRes.data.payload
                        const encodedPrivateKey = (await decryptAES(encPrivKey, form.pass)).toString(CryptoJS.enc.Utf8)
                        const privateKey = await importRSAPrivKey(encodedPrivateKey)
                        const masterEncKey = await decryptRSA(encMasterKey, privateKey)

                        const tempVaultSecret = shortid.generate()
                        const vaultKey = await generateMasterEncryptionKey(tempVaultSecret)
                        const encVaultKey = await encryptAES(vaultKey, masterEncKey)
                        const vaultKeyHash = CryptoJS.SHA512(vaultKey).toString()

                        form = {
                            email: form.email,
                            vName: form.vName,
                            vDesc: form.vDesc,
                            encVaultKey,
                            vaultKeyHash
                        }

                        const res = await axiosInstance.post("/vault/add-vault", form)
                        if (res.status === 201) {
                            toast.success(res.data.message, { id: 'vas' })
                            dispatch({
                                type: vaultConsts.ADD_USER_VAULT_SUCCESS,
                                payload: res.data.payload
                            })
                        }
                        else if (res.response) {
                            toast.error(res.response.data.message, { id: 'vaf' })
                            dispatch({
                                type: vaultConsts.ADD_USER_VAULT_FAILED
                            })
                        }
                    }
                    else if (privKeyRes.response) {
                        toast.error(privKeyRes.response.data.message, { id: 'vaf' })
                        dispatch({
                            type: vaultConsts.ADD_USER_VAULT_FAILED
                        })
                    }
                }
                else if (masterKeyRes.response) {
                    toast.error(masterKeyRes.response.data.message, { id: 'vaf' })
                    dispatch({
                        type: vaultConsts.ADD_USER_VAULT_FAILED
                    })
                }
            }
            else {
                toast.error("Incorrect Password", { id: 'icp' })
                dispatch({
                    type: vaultConsts.ADD_USER_VAULT_FAILED
                })
            }

        }
        else if (hashRes.response) {
            toast.error(hashRes.response.data.message, { id: 'vaf' })
            dispatch({
                type: vaultConsts.ADD_USER_VAULT_FAILED
            })
        }
    }
}

export const unlockUserVault = (form) => {
    return async dispatch => {
        const getKeysForm = {
            email: form.email
        }
        dispatch({
            type: vaultConsts.UNLOCK_VAULT_REQUEST
        })
        const hashRes = await axiosInstance.post("/keys/get-user-hash-pass", getKeysForm)
        if (hashRes.status === 200) {
            const userHashPass = hashRes.data.payload
            if (CryptoJS.SHA512(form.pass).toString(CryptoJS.enc.Base64) === userHashPass) {
                const masterKeyRes = await axiosInstance.post("/keys/get-master-key", getKeysForm)
                if (masterKeyRes.status === 200) {
                    const encMasterKey = masterKeyRes.data.payload
                    const privKeyRes = await axiosInstance.post("/keys/get-priv-key", getKeysForm)
                    if (privKeyRes.status === 200) {
                        const encPrivKey = privKeyRes.data.payload
                        const encodedPrivateKey = (await decryptAES(encPrivKey, form.pass)).toString(CryptoJS.enc.Utf8)
                        const privateKey = await importRSAPrivKey(encodedPrivateKey)
                        const masterEncKey = await decryptRSA(encMasterKey, privateKey)
                        const getVaultKeyForm = {
                            vaultIndex: form.vaultIndex
                        }
                        const vaultKeyRes = await axiosInstance.post("/vault/get-vault-key-hash", getVaultKeyForm)
                        if(vaultKeyRes.status === 200){
                            getVaultKeyForm["email"] = form.email
                            const vaultKeyRes = await axiosInstance.post("/vault/get-enc-vault-key", getVaultKeyForm)
                            if(vaultKeyRes.status === 200){
                                const encVaultKey = vaultKeyRes.data.payload
                                const vaultKey = (await decryptAES(encVaultKey, masterEncKey)).toString(CryptoJS.enc.Utf8)
                                toast.success("Vault Unlocked", { id: 'vus' })
                                dispatch({
                                    type: vaultConsts.UNLOCK_VAULT_SUCCESS,
                                    payload: []
                                })
                                //
                            }
                            else if(vaultKeyRes.response){
                                toast.error(vaultKeyRes.response.data.message, { id: 'vuf' })
                                dispatch({
                                    type: vaultConsts.UNLOCK_VAULT_FAILED
                                })
                            }
                        }
                        else if(vaultKeyRes.response){
                            toast.error(vaultKeyRes.response.data.message, { id: 'vuf' })
                            dispatch({
                                type: vaultConsts.UNLOCK_VAULT_FAILED
                            })
                        }
                    }
                    else if (privKeyRes.response) {
                        toast.error(privKeyRes.response.data.message, { id: 'vuf' })
                        dispatch({
                            type: vaultConsts.UNLOCK_VAULT_FAILED
                        })
                    }
                }
                else if (masterKeyRes.response) {
                    toast.error(masterKeyRes.response.data.message, { id: 'vuf' })
                    dispatch({
                        type: vaultConsts.UNLOCK_VAULT_FAILED
                    })
                }
            }
            else {
                toast.error("Incorrect Password", { id: 'icp' })
                dispatch({
                    type: vaultConsts.UNLOCK_VAULT_FAILED
                })
            }

        }
        else if (hashRes.response) {
            toast.error(hashRes.response.data.message, { id: 'vuf' })
            dispatch({
                type: vaultConsts.UNLOCK_VAULT_FAILED
            })
        }
    }
}