import { toast } from "react-hot-toast"
import shortid from "shortid"
import CryptoJS from "crypto-js"

import axiosInstance from "../helpers/axios"
import { loginConsts, vaultConsts } from "./constants.js"
import { decryptAES, decryptRSA, generateHighEntropyKey, encryptAES, encryptRSA, importRSAPrivKey, importRSAPubKey } from "../helpers/encrypt"
import { encryptRequest, decryptRequest, keyExchange } from "./webSessionActions"

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
        const derivedHighEntropyPassword = await generateHighEntropyKey(form.pass)
        const getKeysForm = {
            email: form.email,
            hashPass: CryptoJS.SHA512(derivedHighEntropyPassword).toString(CryptoJS.enc.Base64)
        }
        const validateReq = await axiosInstance.post("/keys/validate-user-pass", getKeysForm)
        if (validateReq.status === 200) {
            const masterKeyRes = await axiosInstance.post("/keys/get-master-key", getKeysForm)
            if (masterKeyRes.status === 200) {
                const encMasterKey = masterKeyRes.data.payload
                const privKeyRes = await axiosInstance.post("/keys/get-priv-key", getKeysForm)
                if (privKeyRes.status === 200) {
                    const encPrivKey = privKeyRes.data.payload
                    const encodedPrivateKey = await decryptAES(encPrivKey, derivedHighEntropyPassword)
                    const userPrivateKey = await importRSAPrivKey(encodedPrivateKey)
                    const masterEncKey = await decryptRSA(encMasterKey, userPrivateKey)

                    const tempVaultSecret = shortid.generate()
                    const vaultKey = await generateHighEntropyKey(tempVaultSecret, true)
                    const encVaultKey = await encryptAES(vaultKey, masterEncKey)
                    const vaultKeyHash = CryptoJS.SHA512(vaultKey).toString(CryptoJS.enc.Base64)

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
                    const webAESKey = sessionStorage.getItem('requestEncKey')
                    const { encForm, privateKey } = await encryptRequest(form, webAESKey)

                    const res = await axiosInstance.post("/vault/add-vault", { 'encData': encForm })
                    if (res.status === 201) {
                        const decData = await decryptRequest(res.data.payload, res.data.serverPubKey, privateKey, webAESKey)
                        toast.success(res.data.message, { id: 'vas' })
                        dispatch({
                            type: vaultConsts.ADD_USER_VAULT_SUCCESS,
                            payload: decData
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
        else if (validateReq.response) {
            toast.error(validateReq.response.data.message, { id: 'vaf' })
            dispatch({
                type: vaultConsts.ADD_USER_VAULT_FAILED
            })
        }
    }
}

export const unlockUserVault = (form) => {
    return async dispatch => {
        dispatch({
            type: vaultConsts.UNLOCK_VAULT_REQUEST
        })
        const derivedHighEntropyPassword = await generateHighEntropyKey(form.pass)
        const getKeysForm = {
            email: form.email,
            hashPass: CryptoJS.SHA512(derivedHighEntropyPassword).toString(CryptoJS.enc.Base64)
        }
        const validateReq = await axiosInstance.post("/keys/validate-user-pass", getKeysForm)
        if (validateReq.status === 200) {
            const masterKeyRes = await axiosInstance.post("/keys/get-master-key", getKeysForm)
            if (masterKeyRes.status === 200) {
                const encMasterKey = masterKeyRes.data.payload
                const privKeyRes = await axiosInstance.post("/keys/get-priv-key", getKeysForm)
                if (privKeyRes.status === 200) {
                    const encPrivKey = privKeyRes.data.payload
                    const encodedPrivateKey = await decryptAES(encPrivKey, derivedHighEntropyPassword)
                    const userPrivateKey = await importRSAPrivKey(encodedPrivateKey)
                    const masterEncKey = await decryptRSA(encMasterKey, userPrivateKey)
                    const getVaultKeyForm = {
                        vaultIndex: form.vaultIndex,
                        email: form.email
                    }
                    let webAESKey = sessionStorage.getItem('requestEncKey')
                    let { encForm, privateKey } = await encryptRequest(getVaultKeyForm, webAESKey)
                    const privateKey1 = privateKey
                    const webAESKey1 = webAESKey
                    const vaultUnlockRes = await axiosInstance.post("/vault/get-vault-unlock-token", { 'encData': encForm })
                    if (vaultUnlockRes.status === 200) {
                        const decData = await decryptRequest(vaultUnlockRes.data.payload, vaultUnlockRes.data.serverPubKey, privateKey1, webAESKey1)
                        const tokenHash = decData
                        let webAESKey = sessionStorage.getItem('requestEncKey')
                        let { encForm, privateKey } = await encryptRequest(getVaultKeyForm, webAESKey)
                        const privateKey2 = privateKey
                        const webAESKey2 = webAESKey
                        const vaultKeyRes = await axiosInstance.post("/vault/get-enc-vault-key", { 'encData': encForm })
                        if (vaultKeyRes.status === 200) {
                            const decData = await decryptRequest(vaultKeyRes.data.payload, vaultKeyRes.data.serverPubKey, privateKey2, webAESKey2)
                            const encVaultKey = decData
                            const vaultKey = await decryptAES(encVaultKey, masterEncKey)
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
        else if (validateReq.response) {
            toast.error(validateReq.response.data.message, { id: 'vuf' })
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
            const addVaultUserForm = {
                vaultIndex: form.vaultIndex,
                email: form.email,
                addUserEmail: form.addUserEmail,
                encVaultKey: encVaultKey
            }
            const webAESKey = sessionStorage.getItem('requestEncKey')
            const { encForm, privateKey } = await encryptRequest(addVaultUserForm, webAESKey)
            const res = await axiosInstance.post("/vault/add-vault-user-request", { 'encData': encForm })
            if (res.status === 200) {
                const decData = await decryptRequest(res.data.payload || undefined, res.data.serverPubKey, privateKey, webAESKey)
                if (decData !== false) {
                    toast.success(res.data.message, { id: 'vas' })
                    dispatch({
                        type: vaultConsts.ADD_VAULT_USER_REQUEST_SUCCESS
                    })
                }
                else {
                    dispatch(keyExchange())
                    dispatch({
                        type: vaultConsts.ADD_VAULT_USER_REQUEST_FAILED
                    })
                }
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
            const derivedHighEntropyPassword = await generateHighEntropyKey(form.pass)
            const getKeysForm = {
                email: form.email,
                hashPass: CryptoJS.SHA512(derivedHighEntropyPassword).toString(CryptoJS.enc.Base64)
            }
            const validateReq = await axiosInstance.post("/keys/validate-user-pass", getKeysForm)
            if (validateReq.status === 200) {
                const masterKeyRes = await axiosInstance.post("/keys/get-master-key", getKeysForm)
                if (masterKeyRes.status === 200) {
                    const encMasterKey = masterKeyRes.data.payload
                    const privKeyRes = await axiosInstance.post("/keys/get-priv-key", getKeysForm)
                    if (privKeyRes.status === 200) {
                        const encPrivKey = privKeyRes.data.payload
                        try {
                            const encodedPrivateKey = await decryptAES(encPrivKey, derivedHighEntropyPassword)
                            const userPrivateKey = await importRSAPrivKey(encodedPrivateKey)
                            try {
                                const vaultKey = await decryptRSA(form.encVaultKey, userPrivateKey)
                                const masterEncKey = await decryptRSA(encMasterKey, userPrivateKey)
                                const encVaultKey = await encryptAES(vaultKey, masterEncKey)
                                const addVaultUserForm = {
                                    vaultIndex: form.vaultIndex,
                                    email: form.email,
                                    encVaultKey: encVaultKey,
                                    token: form.token
                                }
                                const webAESKey = sessionStorage.getItem('requestEncKey')
                                const { encForm, privateKey } = await encryptRequest(addVaultUserForm, webAESKey)
                                const res = await axiosInstance.post("/vault/accept-vault-invite", { 'encData': encForm })
                                if (res.status === 201) {
                                    const decData = await decryptRequest(res.data.payload || undefined, res.data.serverPubKey, privateKey, webAESKey)
                                    if (decData !== false) {
                                        toast.success(res.data.message, { id: 'vas' })
                                        dispatch({
                                            type: vaultConsts.VAULT_INVITE_ACCEPT_SUCCESS
                                        })
                                        return true
                                    }
                                    else {
                                        dispatch(keyExchange())
                                        dispatch({
                                            type: vaultConsts.VAULT_INVITE_ACCEPT_FAILED
                                        })
                                    }
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
            else if (validateReq.response) {
                toast.error(validateReq.response.data.message, { id: 'vuf' })
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
                const name = await decryptAES(customFields[field].name, vaultKey)
                const value = await decryptAES(customFields[field].value, vaultKey)
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
            login["loginName"] = await decryptAES(logins[i].loginName, vaultKey)
            login["loginUrl"] = await decryptAES(logins[i].loginUrl, vaultKey)
            login["loginUsername"] = await decryptAES(logins[i].loginUsername, vaultKey)
            login["loginPassword"] = await decryptAES(logins[i].loginPassword, vaultKey)
            login["customFields"] = await decryptCustomFields(logins[i].customFields, vaultKey)
            loginArr.push(login)
        }
        return loginArr
    } catch (error) {
        console.log(error)
        return false
    }
}