import { generalConstatnts } from "./constants"
import axiosInstance from "../helpers/axios.js"
import { toast } from "react-hot-toast";
import { encryptAES, decryptAES, generateECDHKeyPair, exportKey, importECDHPubKey, deriveAESGCMKey } from "../helpers/encrypt";

export const keyExchange = () => {
    return async (dispatch) => {
        try {
            dispatch({
                type: generalConstatnts.KEY_EXCHANGE_REQUEST
            })
            sessionStorage.setItem('requestEncKey', null)
            const sessionKeyPair = await generateECDHKeyPair()
            const webPubKey = await exportKey(sessionKeyPair.publicKey)
            const form = {
                "webPubKey": webPubKey
            }

            const res = await axiosInstance.post('/webSession/init', form)
            if (res.status === 201) {
                const serverPubKey = await importECDHPubKey(res.data.payload.serverPubKey)
                const requestEncKey = await deriveAESGCMKey(serverPubKey, sessionKeyPair.privateKey)
                const webAESKey = await exportKey(requestEncKey)
                sessionStorage.setItem('requestEncKey', webAESKey)
                dispatch({
                    type: generalConstatnts.KEY_EXCHANGE_SUCCESS
                })
                return true
            }
            else if (res.status === 200) {
                toast.error("Already logged in", { id: 'ali' })
                dispatch({
                    type: generalConstatnts.KEY_LOGGED
                })
            }
            else if (res.response) {
                sessionStorage.setItem('requestEncKey', null)
                dispatch({
                    type: generalConstatnts.KEY_EXCHANGE_FAILED
                })
                return true
            }
        } catch (error) {
            sessionStorage.setItem('requestEncKey', null)
            console.log(error)
            dispatch({
                type: generalConstatnts.KEY_EXCHANGE_FAILED
            })
        }
    }
}

export const resetSessions = () => {
    return async dispatch => {
        const res = await axiosInstance.post('/webSession/reset')
        if (res.status === 200) {
            dispatch(keyExchange())
            return true
        }
        else if (res.response) {
            dispatch(keyExchange())
        }
    }
}

export const encryptRequest = async (form, webAESKey) => {
    try {
        const sessionKeyPair = await generateECDHKeyPair()
        const privateKey = sessionKeyPair.privateKey
        const webPubKey = await exportKey(sessionKeyPair.publicKey)
        form['webPubKey'] = webPubKey
        const encodedForm = JSON.stringify(form)
        const encForm = await encryptAES(encodedForm, webAESKey)

        return { encForm, privateKey }
    } catch (error) {
        console.log(error)
        return false
    }
}

export const decryptRequest = async (encData, encServerPubKey, privateKey, webAESKey) => {
    try {
        let decServerPubKey = await decryptAES(encServerPubKey, webAESKey)
        const serverPubKey = await importECDHPubKey(decServerPubKey)
        const requestEncKey = await deriveAESGCMKey(serverPubKey, privateKey)
        
        const newWebAESKey = await exportKey(requestEncKey)
        try {
            if (encData !== undefined) {
                const decData = JSON.parse(await decryptAES(encData, newWebAESKey))
                sessionStorage.setItem('requestEncKey', newWebAESKey)
                return decData
            }
            else {
                sessionStorage.setItem('requestEncKey', newWebAESKey)
                return null
            }

        } catch (error) {
            toast.error("Could not decrypt data", { id: 'decrypt' })
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}