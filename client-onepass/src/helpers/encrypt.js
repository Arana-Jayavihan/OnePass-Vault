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

export const exportKey = async (key) => {
    return byteArrayToB64(await (window.crypto.subtle.exportKey("raw", key)))
}

//AES GCM 
export const importAESKey = async (key) => {
    const rawKey = b64ToByteArray(key)
    const importedKey = await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    )
    return importedKey
}

export const encryptAES = async (plainText, key) => {
    const encoder = new TextEncoder()
    const encodedPlainText = encoder.encode(plainText)
    const iv = window.crypto.getRandomValues(new Uint8Array(16))
    const cryptoKey = await importAESKey(key)
    const encryptedByteArray = await window.crypto.subtle.encrypt(
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

    const encodedPlainText = await window.crypto.subtle.decrypt(
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
    if (salt) {
        byteSalt = window.crypto.getRandomValues(new Uint8Array(16))
    }
    else {
        byteSalt = enc.encode("FIXEDSALT")
    }
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
            salt: byteSalt,
            iterations: 100000,
            hash: "SHA-512",
        },
        key,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    return (await exportKey(AESKey))
}

//ECDH
export const generateECDHKeyPair = async () => {
    return (
        await window.crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-384",
            },
            false,
            ["deriveKey"],
        ))
}

export const importECDHPubKey = async (serverPubKey) => {
    return (
        await window.crypto.subtle.importKey(
            'raw',
            b64ToByteArray(serverPubKey),
            {
                name: "ECDH",
                namedCurve: "P-384"
            },
            false,
            []
        ))
}

export const deriveAESGCMKey = async (serverPubKey, webPrivKey) => {
    return (
        await window.crypto.subtle.deriveKey(
            {
                name: "ECDH",
                public: serverPubKey,
            },
            webPrivKey,
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"],
        )
    )
}