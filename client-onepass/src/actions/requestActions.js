import { encryptAES, b64ToByteArray, byteArrayToB64, decryptAES } from "../helpers/encrypt";
import CryptoJS from "crypto-js";

export const encryptRequest = async (form, webAESKey) => {
    try {
        const sessionKeyPair = await window.crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-384",
            },
            false,
            ["deriveKey"],
        );
        const privateKey = sessionKeyPair.privateKey
        const webPubKey = byteArrayToB64(await window.crypto.subtle.exportKey("raw", sessionKeyPair.publicKey))
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
        let decerverPubKey = (await decryptAES(encServerPubKey, webAESKey)).toString(CryptoJS.enc.Utf8)
        const serverPubKey = await window.crypto.subtle.importKey(
            'raw',
            b64ToByteArray(decerverPubKey),
            {
                name: "ECDH",
                namedCurve: "P-384"
            },
            false,
            []
        )
        const requestEncKey = await window.crypto.subtle.deriveKey(
            {
                name: "ECDH",
                public: serverPubKey,
            },
            privateKey,
            {
                name: "AES-CBC",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"],
        );
        const newWebAESKey = byteArrayToB64(await window.crypto.subtle.exportKey("raw", requestEncKey))
        try {
            if (encData !== undefined) {
                const decData = JSON.parse((await decryptAES(encData, newWebAESKey)).toString(CryptoJS.enc.Utf8))
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