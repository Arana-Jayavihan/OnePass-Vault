import CryptoJS from 'crypto-js'
import sh from 'shortid'

export const byteArrayToB64 = (byteArray) => {
    return window.btoa(String.fromCharCode.apply(null, new Uint8Array(byteArray)))
}

export const b64ToByteArray = (b64EncStr) => {
    const str = window.atob(b64EncStr)
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

export const genRSAKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    )
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey)

    return {
        'privExpB64': byteArrayToB64(privateKey),
        'pubExpB64': byteArrayToB64(publicKey),
        'keyPair': keyPair
    }
}

export const encryptRSA = async (plainText, publicKey) => {
    const encoder = new TextEncoder()
    const encodedPlainText = encoder.encode(plainText)

    const encryptedByteArray = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        encodedPlainText
    )
    return byteArrayToB64(encryptedByteArray)
}

export const decryptRSA = async (cipherText, privateKey) => {
    const decoder = new TextDecoder()
    const byteArray = b64ToByteArray(cipherText)
    const decryptedByteArray = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        byteArray
    )
    const decodedPlainText = decoder.decode(decryptedByteArray)
    return decodedPlainText
}

export const importRSAPubKey = async (b64EncPubKey) => {
    const binaryData = b64ToByteArray(b64EncPubKey)

    const publicKey = await window.crypto.subtle.importKey(
        'spki',
        binaryData,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["encrypt"]
    )
    return publicKey
}

export const importRSAPrivKey = async (b64EncPrivKey) => {
    const binaryData = b64ToByteArray(b64EncPrivKey)

    const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        binaryData,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["decrypt"]
    )
    return privateKey
}

export const encryptAES = async (plainText, key) => {
    return CryptoJS.AES.encrypt(plainText, key, {
        iv: CryptoJS.SHA256(sh.generate()).toString(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString()
}

export const decryptAES = async (cipherText, key) => {
    return CryptoJS.AES.decrypt(cipherText, key)
}
//const decPrivate = (await decryptAES(encPrivate, password)).toString(CryptoJS.enc.Utf8)

export const generateMasterEncryptionKey = async (password) => {
    const enc = new TextEncoder()
    const encodedPassword = enc.encode(password)
    const salt = window.crypto.getRandomValues(new Uint8Array(12))
    const key = await window.crypto.subtle.importKey(
        "raw",
        encodedPassword,
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    )

    const AESKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-512",
        },
        key,
        { name: "AES-CBC", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    const expAESKey = await window.crypto.subtle.exportKey("raw", AESKey)
    return byteArrayToB64(expAESKey)
}

export const generateHMACKey = async (secret) => {
    const enc = new TextEncoder()
    const encodedSecret = enc.encode(secret)
    const key = await window.crypto.subtle.importKey(
        "raw",
        encodedSecret,
        { name: "HMAC", hash: "SHA-512" },
        true,
        ["sign", "verify"]
    )
    return key
}

export const generateHMAC = async (message, secret) => {
    const enc = new TextEncoder()
    const encodedMsg = enc.encode(message)
    const key = await generateHMACKey(secret)
    const signature = await window.crypto.subtle.sign(
        "HMAC",
        key,
        encodedMsg
    )
    return byteArrayToB64(signature)
}

export const verifyHMAC = async (secret, signature, message) => {
    const enc = new TextEncoder()
    const encodedMsg = enc.encode(message)
    const key = await generateHMACKey(secret)
    const result = await window.crypto.subtle.verify(
        "HMAC",
        key,
        b64ToByteArray(signature),
        encodedMsg
    )
    return result
}