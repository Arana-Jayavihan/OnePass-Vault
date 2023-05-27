import axiosInstance from "helpers/axios"
import { loginConsts, vaultConsts } from "./constants"
import { toast } from "react-hot-toast"
import shortid from "shortid"
import { decryptAES, decryptRSA, encryptAES, generateMasterEncryptionKey, importRSAPrivKey } from "encrypt"
import CryptoJS from "crypto-js"
import Cookies from 'universal-cookie'
const cookies = new Cookies()

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
                            vaultIndex: form.vaultIndex,
                            email: form.email
                        }
                        const vaultUnlockRes = await axiosInstance.post("/vault/get-vault-unlock-token", getVaultKeyForm)
                        if (vaultUnlockRes.status === 200) {
                            const vaultUnlockToken = vaultUnlockRes.data.payload.vaultUnlockToken
                            const encVaultUnlockToken = vaultUnlockRes.data.payload.encVaultUnlockToken
                            getVaultKeyForm["vaultUnlockToken"] = vaultUnlockToken
                            getVaultKeyForm["encVaultUnlockToken"] = encVaultUnlockToken
                            const vaultKeyRes = await axiosInstance.post("/vault/get-enc-vault-key", getVaultKeyForm)
                            if (vaultKeyRes.status === 200) {
                                const encVaultKey = vaultKeyRes.data.payload
                                const vaultKey = (await decryptAES(encVaultKey, masterEncKey)).toString(CryptoJS.enc.Utf8)
                                toast.success("Vault Unlocked", { id: 'vus' })
                                
                                dispatch({
                                    type: vaultConsts.UNLOCK_VAULT_SUCCESS,
                                    payload: vaultKey
                                })
                                cookies.set("encVaultUnlockToken", encVaultUnlockToken, {
                                    path: "/",
                                    maxAge: '600000',
                                    sameSite: "lax",
                                    secure: true,
                                    httpOnly: false
                                })
                                const result = {
                                    vaultUnlockToken,
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
    try {
        return async dispatch => {
            dispatch({
                type: vaultConsts.GET_VAULT_DATA_REQUEST
            })
            const res = await axiosInstance.post("/vault/get-vault-data", form)
            if (res.status === 200) {
                cookies.remove("encVaultUnlockToken", {
                    path: "/",
                })
                toast.success("Vault Data Fetched", { id: 'vds' })
                const vaultData = res.data.payload
                const decLogins = await decryptVaultLogins(vaultData.vaultLogins, vaultKey)
                if (decLogins !== false) {
                    vaultData["vaultLogins"] = decLogins
                    
                    dispatch({
                        type: vaultConsts.GET_VAULT_DATA_SUCCESS,
                        payload: vaultData
                    })
                    return true
                }
                else if (decLogins === false) {
                    cookies.remove("encVaultUnlockToken", {
                        path: "/",
                    })
                    toast.error("Error Fetching Vault Data", { id: 'gvf' })
                    dispatch({
                        type: vaultConsts.GET_VAULT_DATA_FAILED
                    })
                    return false
                }

            }
            else if (res.response) {
                cookies.remove("encVaultUnlockToken", {
                    path: "/",
                })
                toast.error("Vault Locked!", { id: 'gvf' })
                dispatch({
                    type: vaultConsts.GET_VAULT_DATA_FAILED
                })
                return false
            }

        }
    } catch (error) {
        console.log(error)
        return async dispatch => {
            cookies.remove("encVaultUnlockToken", {
                path: "/",
            })
            toast.error("Error Fetching Vault Data", { id: 'gvf' })
            dispatch({
                type: vaultConsts.GET_VAULT_DATA_FAILED
            })
            return false
        }
    }
}

export const lockUserVault = () => {
    try {
        return async dispatch => {
            dispatch({
                type: vaultConsts.LOCK_VAULT_SUCCESS
            })
            dispatch({
                type: loginConsts.REMOVE_LOGINS
            })
        }
    } catch (error) {
        console.log(error)
        return async dispatch => {
            dispatch({
                type: vaultConsts.LOCK_VAULT_FAILED
            })
        }
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
            loginArr.push(login)
        }
        return loginArr
    } catch (error) {
        console.log(error)
        return false
    }
}



const testEncrypt = async (vaultKey) => {
    const loginName = "Instagram"
    const loginUrl = "https://www.instagram.com"
    const loginUsername = "_.arana._"
    const loginPassword = "123456789"

    const encLoginName = await encryptAES(loginName, vaultKey)
    const encLoginUrl = await encryptAES(loginUrl, vaultKey)
    const encLoginUsername = await encryptAES(loginUsername, vaultKey)
    const encLoginPassword = await encryptAES(loginPassword, vaultKey)
    console.log(encLoginName, encLoginUrl, encLoginUsername, encLoginPassword)
}