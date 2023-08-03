import { toast } from "react-hot-toast"
import axiosInstance from "../helpers/axios"
import { loginConsts, vaultConsts } from "./constants"
import { encryptAES } from "encrypt"
import { decryptVaultLogins } from "./vaultActions"

export const addUserLogin = (form) => {
    return async dispatch => {
        dispatch({
            type: vaultConsts.ADD_NEW_VAULT_LOGIN_REQUEST
        })
        const encLoginName = await encryptAES(form.loginName, form.vaultKey)
        const encLoginUrl = await encryptAES(form.loginUrl, form.vaultKey)
        const encLoginUserName = await encryptAES(form.loginUsername, form.vaultKey)
        const encLoginPassword = await encryptAES(form.loginPassword, form.vaultKey)

        let encCustomFields = []
        for (let field of form.customFields) {
            const encFieldName = await encryptAES(field.name, form.vaultKey)
            const encFieldValue = await encryptAES(field.value, form.vaultKey)
            encCustomFields.push({
                name: encFieldName,
                value: encFieldValue
            })
        }
        const addLoginForm = {
            loginName: encLoginName,
            loginUrl: encLoginUrl,
            loginUsername: encLoginUserName,
            loginPassword: encLoginPassword,
            vaultIndex: form.vaultIndex,
            email: form.email,
            customFields: encCustomFields
        }
        const res = await axiosInstance.post("/login/add-login", addLoginForm)

        if (res.status === 201) {
            const decLogins = await decryptVaultLogins(res.data.payload, form.vaultKey)
            toast.success("Login Saved", { id: 'las' })
            dispatch({
                type: vaultConsts.ADD_NEW_VAULT_LOGIN_SUCCESS,
                payload: decLogins
            })
            return true
        }
        else if (res.response) {
            toast.error(res.response.data.message, { id: 'lae' })
            dispatch({
                type: vaultConsts.ADD_NEW_VAULT_LOGIN_FAILED
            })
            return false
        }
    }
}
