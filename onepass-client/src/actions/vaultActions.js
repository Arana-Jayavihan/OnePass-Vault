import { toast } from "react-hot-toast"
import shortid from "shortid"
import CryptoJS from "crypto-js"

import axiosInstance from "../helpers/axios"
import { loginConsts, vaultConsts } from "./constants.js"
import { decryptAES, decryptRSA, encryptAES, encryptRSA, generateMasterEncryptionKey, importRSAPrivKey, importRSAPubKey } from "../helpers/encrypt"

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

                        let encCustomFields = []
                        for (let field of form.customFields) {
                            const encFieldName = await encryptAES(field.name, vaultKey)
                            const encFieldValue = await encryptAES(field.value, vaultKey)
                            encCustomFields.push({
                                name: encFieldName,
                                value: encFieldValue
                            })
                        }

                        form = {
                            email: form.email,
                            vName: form.vName,
                            vDesc: form.vDesc,
                            encVaultKey,
                            vaultKeyHash,
                            "customFields": encCustomFields,
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
                            vaultIndex: form.vaultIndex,
                            email: form.email
                        }
                        const vaultUnlockRes = await axiosInstance.post("/vault/get-vault-unlock-token", getVaultKeyForm)
                        if (vaultUnlockRes.status === 200) {
                            const tokenHash = vaultUnlockRes.data.payload
                            const vaultKeyRes = await axiosInstance.post("/vault/get-enc-vault-key", getVaultKeyForm)
                            if (vaultKeyRes.status === 200) {
                                const encVaultKey = vaultKeyRes.data.payload
                                const vaultKey = (await decryptAES(encVaultKey, masterEncKey)).toString(CryptoJS.enc.Utf8)
                                toast.success("Vault Unlocked", { id: 'vus' })

                                dispatch({
                                    type: vaultConsts.UNLOCK_VAULT_SUCCESS,
                                    payload: vaultKey
                                })
                                const result = {
                                    tokenHash,
                                    status: true
                                }
                                return result

                            }
                            else if (vaultKeyRes.response) {
                                toast.error(vaultKeyRes.response.data.message, { id: 'vuf' })
                                dispatch({
                                    type: vaultConsts.UNLOCK_VAULT_FAILED
                                })
                                return false
                            }
                        }
                        else if (vaultUnlockRes.response) {
                            toast.error(vaultUnlockRes.response.data.message, { id: 'vuf' })
                            dispatch({
                                type: vaultConsts.UNLOCK_VAULT_FAILED
                            })
                            return false
                        }
                    }
                    else if (privKeyRes.response) {
                        toast.error(privKeyRes.response.data.message, { id: 'vuf' })
                        dispatch({
                            type: vaultConsts.UNLOCK_VAULT_FAILED
                        })
                        return false
                    }
                }
                else if (masterKeyRes.response) {
                    toast.error(masterKeyRes.response.data.message, { id: 'vuf' })
                    dispatch({
                        type: vaultConsts.UNLOCK_VAULT_FAILED
                    })
                    return false
                }
            }
            else {
                toast.error("Incorrect Password", { id: 'icp' })
                dispatch({
                    type: vaultConsts.UNLOCK_VAULT_FAILED
                })
                return false
            }

        }
        else if (hashRes.response) {
            toast.error(hashRes.response.data.message, { id: 'vuf' })
            dispatch({
                type: vaultConsts.UNLOCK_VAULT_FAILED
            })
            return false
        }
    }
}

export const getVaultData = (form, vaultKey) => {
    return async dispatch => {
        try {
            dispatch({
                type: vaultConsts.GET_VAULT_DATA_REQUEST
            })
            const res = await axiosInstance.post("/vault/get-vault-data", form)
            if (res.status === 200) {
                toast.success("Vault Data Fetched", { id: 'vds' })
                const vaultData = res.data.payload
                const decCustomFields = await decryptCustomFields(vaultData.customFields, vaultKey)
                const decLogins = await decryptVaultLogins(vaultData.vaultLogins, vaultKey)
                if (decLogins !== false && decCustomFields !== false) {
                    vaultData["vaultLogins"] = decLogins
                    vaultData["customFields"] = decCustomFields
                    dispatch({
                        type: vaultConsts.GET_VAULT_DATA_SUCCESS,
                        payload: vaultData
                    })
                    return true
                }
                else if (decLogins === false) {
                    toast.error("Error Fetching Vault Data", { id: 'gvf' })
                    dispatch({
                        type: vaultConsts.LOCK_VAULT_SUCCESS
                    })
                    dispatch({
                        type: loginConsts.REMOVE_LOGINS
                    })
                    dispatch({
                        type: vaultConsts.GET_VAULT_DATA_FAILED
                    })
                    return false
                }

            }
            else if (res.response) {
                dispatch({
                    type: vaultConsts.LOCK_VAULT_SUCCESS
                })
                dispatch({
                    type: loginConsts.REMOVE_LOGINS
                })
                dispatch({
                    type: vaultConsts.GET_VAULT_DATA_FAILED
                })
                return false
            }
        }
        catch (error) {
            console.log(error)
            toast.error("Error Fetching Vault Data", { id: 'gvf' })
            dispatch({
                type: vaultConsts.LOCK_VAULT_SUCCESS
            })
            dispatch({
                type: loginConsts.REMOVE_LOGINS
            })
            dispatch({
                type: vaultConsts.GET_VAULT_DATA_FAILED
            })
            return false
        }
    }
}

export const addVaultUser = (form) => {
    return async dispatch => {
        try {
            dispatch({
                type: vaultConsts.ADD_VAULT_USER_REQUEST_REQUEST
            })
            const form1 = {
                email: form.addUserEmail,
            }
            const addUserPubKeyRes = await axiosInstance.post("/keys/get-pub-key", form1)
            if (addUserPubKeyRes.status !== 200) {
                toast.error(addUserPubKeyRes.response.data.message, { id: 'vaf' })
                dispatch({
                    type: vaultConsts.ADD_VAULT_USER_REQUEST_FAILED
                })
            }
            const publicKey = await importRSAPubKey(addUserPubKeyRes.data.payload)
            const encVaultKey = await encryptRSA(form.vaultKey, publicKey)
            const vaultUnlockForm = {
                vaultIndex: form.vaultIndex,
                email: form.email,
                addUserEmail: form.addUserEmail,
                encVaultKey: encVaultKey
            }
            const res = await axiosInstance.post("/vault/add-vault-user-request", vaultUnlockForm)
            if (res.status === 200) {
                toast.success(res.data.message, { id: 'vas' })
                dispatch({
                    type: vaultConsts.ADD_VAULT_USER_REQUEST_SUCCESS
                })
            }
            else if (res.response) {
                toast.error(res.response.data.message, { id: 'vaf' })
                dispatch({
                    type: vaultConsts.ADD_VAULT_USER_REQUEST_FAILED
                })
            }
        } catch (error) {
            console.log(error)
            dispatch({
                type: vaultConsts.ADD_VAULT_USER_REQUEST_FAILED
            })
        }

    }
}

export const getVaultInvitationData = (form) => {
    return async dispatch => {
        try {
            dispatch({
                type: vaultConsts.GET_VAULT_INVITE_DATA_REQUEST
            })
            const res = await axiosInstance.post("/vault/get-vault-invite-data", form)
            if (res.status === 200) {
                toast.success("Vault Invitation Data Fetched", { id: 'vids' })
                dispatch({
                    type: vaultConsts.GET_VAULT_INVITE_DATA_SUCCESS,
                    payload: res.data.payload
                })
            }
            else if (res.response) {
                toast.error(res.response.data.message, { id: 'vidf' })
                dispatch({
                    type: vaultConsts.GET_VAULT_INVITE_DATA_FAILED
                })
            }
        } catch (error) {
            console.log(error)
            dispatch({
                type: vaultConsts.GET_VAULT_INVITE_DATA_FAILED
            })
        }
    }
}

export const acceptVaultInvitation = (form) => {
    return async dispatch => {
        try {
            dispatch({
                type: vaultConsts.VAULT_INVITE_ACCEPT_REQUEST
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
                            try {
                                const encodedPrivateKey = (await decryptAES(encPrivKey, form.pass)).toString(CryptoJS.enc.Utf8)
                                const privateKey = await importRSAPrivKey(encodedPrivateKey)
                                try {
                                    const vaultKey = await decryptRSA(form.encVaultKey, privateKey)
                                    const masterEncKey = await decryptRSA(encMasterKey, privateKey)
                                    const encVaultKey = await encryptAES(vaultKey, masterEncKey)
                                    const addVaultUserForm = {
                                        vaultIndex: form.vaultIndex,
                                        email: form.email,
                                        encVaultKey: encVaultKey,
                                        token: form.token
                                    }
                                    const res = await axiosInstance.post("/vault/accept-vault-invite", addVaultUserForm)
                                    if (res.status === 201) {
                                        toast.success(res.data.message, { id: 'vas' })
                                        dispatch({
                                            type: vaultConsts.VAULT_INVITE_ACCEPT_SUCCESS
                                        })
                                        return true
                                    }
                                    else if (res.response) {
                                        toast.error(res.response.data.message, { id: 'vaf' })
                                        dispatch({
                                            type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                                        })
                                    }
                                } catch (error) {
                                    toast.error('Incorrect Private Key', { id: 'vuf' })
                                    dispatch({
                                        type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                                    })
                                }
                            } catch (error) {
                                toast.error("Incorrect Password", { id: 'icp' })
                                dispatch({
                                    type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                                })
                                return false
                            }
                        }
                        else if (privKeyRes.response) {
                            toast.error(privKeyRes.response.data.message, { id: 'vuf' })
                            dispatch({
                                type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                            })
                            return false
                        }
                    }
                    else if (masterKeyRes.response) {
                        toast.error(masterKeyRes.response.data.message, { id: 'vuf' })
                        dispatch({
                            type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                        })
                        return false
                    }
                }
                else {
                    toast.error("Incorrect Password", { id: 'icp' })
                    dispatch({
                        type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                    })
                    return false
                }
            }
            else if (hashRes.response) {
                toast.error(hashRes.response.data.message, { id: 'vuf' })
                dispatch({
                    type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                })
                return false
            }
        } catch (error) {
            console.log(error)
            dispatch({
                type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
            })
        }
    }
}

export const lockUserVault = () => {
    return async dispatch => {
        toast.success("Vault Locked", { id: 'vls' })
        dispatch({
            type: vaultConsts.LOCK_VAULT_SUCCESS
        })
        dispatch({
            type: loginConsts.REMOVE_LOGINS
        })
    }
}

export const decryptCustomFields = async (customFields, vaultKey) => {
    try {
        let customFieldsArr = []
        if (customFields.length > 0) {
            for (let field in customFields) {
                const name = (await decryptAES(customFields[field].name, vaultKey)).toString(CryptoJS.enc.Utf8)
                const value = (await decryptAES(customFields[field].value, vaultKey)).toString(CryptoJS.enc.Utf8)
                customFieldsArr.push({
                    name,
                    value
                })
            }
            return customFieldsArr
        }
        else {
            return []
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

export const decryptVaultLogins = async (logins, vaultKey) => {
    try {
        let loginArr = []
        for (let i = 0; i < logins.length; i++) {
            const login = {}
            login["loginName"] = (await decryptAES(logins[i].loginName, vaultKey)).toString(CryptoJS.enc.Utf8)
            login["loginUrl"] = (await decryptAES(logins[i].loginUrl, vaultKey)).toString(CryptoJS.enc.Utf8)
            login["loginUsername"] = (await decryptAES(logins[i].loginUsername, vaultKey)).toString(CryptoJS.enc.Utf8)
            login["loginPassword"] = (await decryptAES(logins[i].loginPassword, vaultKey)).toString(CryptoJS.enc.Utf8)
            login["customFields"] = await decryptCustomFields(logins[i].customFields, vaultKey)
            loginArr.push(login)
        }
        return loginArr
    } catch (error) {
        console.log(error)
        return false
    }
}