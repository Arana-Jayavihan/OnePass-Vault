import { webcrypto } from 'crypto'
export const deriveSecretKey = async (privateKey, publicKey) => {
    return webcrypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey,
        },
        privateKey,
        {
            name: "AES-CBC",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"],
    );
}

export const byteArrayToB64 = (byteArray) => {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(byteArray)))
}

export const b64ToByteArray = (b64EncStr) => {
    const str = atob(b64EncStr)
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

export const importPubKey = async (b64EncPubKey) => {
    const binaryData = b64ToByteArray(b64EncPubKey)

    const publicKey = await webcrypto.subtle.importKey(
        'raw',
        binaryData,
        {
            name: "ECDH",
            namedCurve: "P-384"
        },
        false,
        []
    )
    return publicKey
}

export const importAESKey = async (key) => {
    const rawKey = b64ToByteArray(key)
    const importedKey = await webcrypto.subtle.importKey(
        "raw",
        rawKey,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    )
    return importedKey
}

export const exportAESKey = async (key) => {
    return byteArrayToB64(await (webcrypto.subtle.exportKey("raw", key)))
}

export const encryptAES = async (plainText, key) => {
    const encoder = new TextEncoder()
    const encodedPlainText = encoder.encode(plainText)
    const iv = webcrypto.getRandomValues(new Uint8Array(16))
    const cryptoKey = await importAESKey(key)
    const encryptedByteArray = await webcrypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        cryptoKey,
        encodedPlainText
    )
    return byteArrayToB64(encryptedByteArray) + "_" + byteArrayToB64(iv)
}

export const decryptAES = async (cipherText, key) => {
    const iv = b64ToByteArray(cipherText.split("_")[1])
    const encrypted = b64ToByteArray(cipherText.split("_")[0])
    const importedKey = await importAESKey(key)

    const encodedPlainText = await webcrypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        importedKey,
        encrypted
    )
    const dec = new TextDecoder("utf-8")
    return dec.decode(encodedPlainText)
}

export const generateHighEntropyKey = async (password, salt) => {
    const enc = new TextEncoder()
    const encodedPassword = enc.encode(password)
    let byteSalt = undefined
    if (salt){
        byteSalt = webcrypto.getRandomValues(new Uint8Array(16))
    }
    else {
        byteSalt = enc.encode("FIXEDSALT")
    }
    const key = await webcrypto.subtle.importKey(
        "raw",
        encodedPassword,
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    )

    const AESKey = await webcrypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: byteSalt,
            iterations: 100000,
            hash: "SHA-512",
        },
        key,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    
    return byteArrayToB64(await webcrypto.subtle.exportKey("raw", AESKey))
}

