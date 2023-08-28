import { webcrypto } from 'crypto'
import jwt from 'jsonwebtoken';
import shortid from 'shortid';
import fs from "fs"
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv'
dotenv.config()

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
        const browserDetails = {
            'platform': req.headers['sec-ch-ua-platform'],
            'userAgent': req.headers['user-agent'],
            'isMobile': req.headers['sec-ch-ua-mobile']
        }
        const broswserHash = CryptoJS.SHA256(JSON.stringify(browserDetails)).toString()
        let oldWebSessionToken = undefined
        try {
            oldWebSessionToken = jwt.verify((CryptoJS.AES.decrypt(req.cookies.sessionId).toString(CryptoJS.enc.Utf8)), publicKey, { algorithms: ['ES512'] })
            const webSessions = Object.values(webSessionList)
            for (let webSession in webSessions) {
                if (webSessions[webSession].sessionId === oldWebSessionToken.sessionId && webSessions[webSession].userSession === undefined) {
                    delete webSessionList[webSessions[webSession].sessionId]
                }
            }
        } catch (error) {
            console.log("No old sessions")
        }
        let flag = false
        const webSessions = Object.values(webSessionList)
        for (let webSession in webSessions) {
            if (webSessions[webSession].browserHash === broswserHash && webSessions[webSession].userSession === undefined) {
                delete webSessionList[webSessions[webSession].sessionId]
            }
            else if (webSessions[webSession].browserHash === broswserHash && webSessions[webSession].userSession !== undefined){
                flag = true
            }
        }
        if (flag === false){
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
            'lastAccessed': new Date().getTime(),
            'ip': req.headers['x-forwarded-for'],
            'browserHash': broswserHash,
            'browserDetails': browserDetails
        }
        webSessionList[webSessionObj.sessionId] = webSessionObj
        console.log(webSessionList, "New Web Session")
        const webSessionToken = jwt.sign({ "sessionId": webSessionObj.sessionId }, privateKey, { algorithm: 'ES512', expiresIn: '1h' })
        const encWebSessionToken = CryptoJS.AES.encrypt(webSessionToken, process.env.AES_SECRET, {
            iv: CryptoJS.SHA256(shortid.generate()).toString(),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString()
        res.cookie('sessionId', encWebSessionToken, {
            path: '/',
            expires: hours1,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
        res.status(201).json({
            message: "Web Session Created",
            payload: {
                serverPubKey: serverPubKey
            }
        })
        }
        else if (flag === true) {
            res.status(200).json({
                message: "Already Logged In"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong"
        })
    }
}

export const updateWebSession = async (webSessionId, webPubKey) => {
    try {
        const serverKeyPair = await webcrypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-384"
            },
            false,
            ["deriveKey"],
        );
        const importedWebPubKey = await importPubKey(webPubKey)
        const serverSecretKey = await deriveSecretKey(
            serverKeyPair.privateKey,
            importedWebPubKey,
        );
        const newServerAESKey = byteArrayToB64(await webcrypto.subtle.exportKey("raw", serverSecretKey))
        webSessionList[webSessionId].secretKey = newServerAESKey
        webSessionList[webSessionId].lastAccessed = new Date().getTime()

        const serverPubKey = byteArrayToB64(await webcrypto.subtle.exportKey("raw", serverKeyPair.publicKey))
        return { serverPubKey, newServerAESKey }

    } catch (error) {
        console.log(error)
        return false
    }
}

const clearWebSessionTokens = () => {
    try {
        const webSessions = Object.values(webSessionList)
        const currentTime = new Date().getTime()
        let count = 0
        webSessions.forEach(webSession => {
            if ((currentTime - webSession.lastAccessed > 5 * 60 * 1000 && webSession.userSession === undefined) || (currentTime - webSession.lastAccessed > 15 * 60 * 1000)) {
                delete webSessionList[webSession.sessionId]
                count++
            }
        })
        console.log(webSessionList, `Cleared ${count} Web Sessions`)
    } catch (error) {
        console.log(error)
    }
}

setInterval(clearWebSessionTokens, 5 * 60 * 1000)