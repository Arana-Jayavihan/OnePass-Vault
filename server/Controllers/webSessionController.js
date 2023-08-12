import { webcrypto } from 'crypto'
import jwt from 'jsonwebtoken';
import shortid from 'shortid';
import fs from "fs"

export let webSessionList = {}
let privateKey = undefined

try {
    privateKey = fs.readFileSync('ecdsaPrivKey.pem', 'utf-8')
} catch (error) {
    console.log(error)
}

const deriveSecretKey = (privateKey, publicKey) => {
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

export const initWebSession = async (req, res) => {
    try {
        let hours1 = new Date()
        hours1.setTime(hours1.getTime() + (1 * 60 * 60 * 1000))
        const serverKeyPair = await webcrypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-384"
            },
            false,
            ["deriveKey"],
        );
        const serverPubKey = byteArrayToB64(await webcrypto.subtle.exportKey("raw", serverKeyPair.publicKey))

        const importedWebPubKey = await importPubKey(req.body.webPubKey)
        const serverSecretKey = await deriveSecretKey(
            serverKeyPair.privateKey,
            importedWebPubKey,
        );
        const serverAESKey = byteArrayToB64(await webcrypto.subtle.exportKey("raw", serverSecretKey))
        const webSessionObj = {
            'sessionId': shortid.generate(),
            'secretKey': serverAESKey,
            'sequenceNumber': 0,
            'lastAccessed': new Date().getTime()
        }
        webSessionList[webSessionObj.sessionId] = webSessionObj
        console.log(webSessionList, "New Web Session")
        const webSessionToken = jwt.sign({ "sessionId": webSessionObj.sessionId }, privateKey, { algorithm: 'ES512', expiresIn: '1h' })
        res.cookie('sessionId', webSessionToken, {
            path: '/',
            expires: hours1,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
        res.status(201).json({
            message: "Web Session Created",
            payload: {
                serverPubKey: serverPubKey,
                webSessionId: webSessionObj.sessionId
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const clearWebSessionTokens = () => {
    try {
        const webSessions = Object.values(webSessionList)
        const currentTime = new Date().getTime()
        webSessions.forEach(webSession => {
            if (currentTime - webSession.lastAccessed > 15 * 60 * 1000) {
                delete webSessionList[webSession.sessionId]
            }
        })
    } catch (error) {
        console.log(error)
    }
}

setInterval(clearWebSessionTokens, 5 * 60 * 1000)