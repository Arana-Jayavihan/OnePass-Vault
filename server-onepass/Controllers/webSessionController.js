import { webcrypto } from 'crypto'
import jwt from 'jsonwebtoken';
import shortid from 'shortid';
import fs from "fs"
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv'
dotenv.config()

import { tokenlist as authTokens } from './authController.js';
import { deriveSecretKey, importPubKey, generateECDHKeyPair, exportKey, encryptAES, decryptAES } from './encryptController.js'

export let webSessionList = {}
let privateKey = undefined

try {
    privateKey = fs.readFileSync('ecdsaPrivKey.pem', 'utf-8')
} catch (error) {
    console.log(error)
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
            oldWebSessionToken = jwt.verify((await decryptAES(req.cookies.sessionId, process.env.AES_SECRET)), publicKey, { algorithms: ['ES512'] })
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
            else if (webSessions[webSession].browserHash === broswserHash && webSessions[webSession].userSession !== undefined) {
                flag = true
            }
        }   
        if (flag === false) {
            let hours1 = new Date()
            hours1.setTime(hours1.getTime() + (1 * 60 * 60 * 1000))
            const serverKeyPair = await generateECDHKeyPair()
            const serverPubKey = await exportKey(serverKeyPair.publicKey)

            const importedWebPubKey = await importPubKey(req.body.webPubKey)
            const serverSecretKey = await deriveSecretKey(
                serverKeyPair.privateKey,
                importedWebPubKey,
            );
            const serverAESKey = await exportKey(serverSecretKey)
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
            const encWebSessionToken = await encryptAES(webSessionToken, process.env.AES_SECRET)
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
        const serverKeyPair = await generateECDHKeyPair()
        const importedWebPubKey = await importPubKey(webPubKey)
        const serverSecretKey = await deriveSecretKey(
            serverKeyPair.privateKey,
            importedWebPubKey,
        );
        const newServerAESKey = await exportKey(serverSecretKey)
        webSessionList[webSessionId].secretKey = newServerAESKey
        webSessionList[webSessionId].lastAccessed = new Date().getTime()

        const serverPubKey = await exportKey(serverKeyPair.publicKey)
        return { serverPubKey, newServerAESKey }

    } catch (error) {
        console.log(error)
        return false
    }
}

export const resetWebSessions = async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for']
        const browserDetails = {
            'platform': req.headers['sec-ch-ua-platform'],
            'userAgent': req.headers['user-agent'],
            'isMobile': req.headers['sec-ch-ua-mobile']
        }
        const broswserHash = CryptoJS.SHA256(JSON.stringify(browserDetails)).toString()
        const webSessions = Object.values(webSessionList)
        const userSessions = Object.values(authTokens)

        for (let webSession of webSessions) {
            if (webSession.browserHash === broswserHash && webSession.ip === ip) {
                let sessionId = webSession.sessionId
                delete webSessionList[sessionId]
                const userSession = userSessions.find(userSession => userSession.webSessionId === sessionId)
                if (userSession) {
                    delete authTokens[userSession]
                }
            }
        }
        const chkSession = webSessions.find(webSession => (webSession.broswserHash === broswserHash && webSession.ip === ip))
        if (!chkSession) {
            res.status(200).json({
                message: "Web Session Reset Success"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong"
        })
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