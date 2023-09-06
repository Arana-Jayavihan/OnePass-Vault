import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { tokenlist as authTokens } from '../Controllers/authController.js'
import fs from 'fs'
import dotenv from 'dotenv'
import vd from 'validator'
dotenv.config()

import { updateWebSession, webSessionList } from '../Controllers/webSessionController.js'
import { decryptAES, encryptAES } from '../Controllers/encryptController.js'
let publicKey = undefined
try {
    publicKey = fs.readFileSync('ecdsaPubKey.pem', 'utf-8')
} catch (error) {
    console.log(error)
}

export const decryptRequest = async (req, res, next) => {
    try {
        const url = req.url
        if (
            url.includes('/auth/signin-request') ||
            url.includes('/auth/signin') ||
            url.includes('/auth/add-user-data') ||
            url.includes('/auth/genkeys') ||
            url.includes('/auth/token') ||
            url.includes('/login/add-login') ||
            url.includes('/vault/add-vault') ||
            url.includes('/vault/get-vault-unlock-token') ||
            url.includes('/vault/get-enc-vault-key') ||
            url.includes('/vault/accept-vault-invite')
        ) {
            const encSessionToken = req.cookies.sessionId
            const sessionToken = await decryptAES(encSessionToken, process.env.AES_SECRET)
            if (sessionToken) {
                const verifiedToken = jwt.verify(sessionToken, publicKey, { algorithms: ['ES512'] })
                if (verifiedToken) {
                    const webSessions = Object.values(webSessionList)
                    const webSession = webSessions.find(webSession => webSession.sessionId === verifiedToken.sessionId)
                    if (webSession) {
                        const browserDetails = {
                            'platform': req.headers['sec-ch-ua-platform'],
                            'userAgent': req.headers['user-agent'],
                            'isMobile': req.headers['sec-ch-ua-mobile']
                        }
                        const browserHash = CryptoJS.SHA256(JSON.stringify(browserDetails)).toString()
                        if (browserHash === webSession.browserHash) {
                            const sessionEncKey = webSession.secretKey
                            try {
                                const decData = await decryptAES(req.body.encData, sessionEncKey)
                                req.body = JSON.parse(decData)
                                const result = await updateWebSession(webSession.sessionId, req.body.webPubKey)
                                if (result) {
                                    const encServerPubKey = await encryptAES(result.serverPubKey, sessionEncKey)
                                    req.body['serverPubKey'] = encServerPubKey
                                    req.body['newServerAESKey'] = result.newServerAESKey
                                    req.body['webSessionId'] = webSession.sessionId
                                    next()
                                }
                                else {
                                    res.status(401).json({
                                        message: "Something Went Wrong"
                                    })
                                }
                            } catch (error) {
                                console.log(error)
                                res.status(401).json({
                                    
                                    message: "Request Not Allowed"
                                })
                            }

                        }
                        else {
                            res.status(401).json({
                                message: "Browser Fingerprint Mistmatch"
                            })
                        }

                    }
                    else {
                        res.status(401).json({
                            message: "Invalid Web Session"
                        })
                    }
                }
                else {
                    res.status(401).json({
                        message: "Invalid Web Session Token"
                    })
                }
            }
            else {
                res.status(401).json({
                    message: "Invalid Web Session"
                })
            }
        }
        else {
            next()
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Oops! Something Went Wrong"
        })
    }
}

export const checkRequest = (req, res, next) => {
    try {
        if (process.env.ENV === "PROD") {
            const headers = req.headers
            const params = req.params
            const query = req.query
            const ips = headers['x-forwarded-for'].split(",")
            // const connections = req.socket.server._connections
            // console.log(connections)
            if (ips.length <= 1) {
                if (req.headers.origin === "https://onepass-vault-v3.netlify.app" && process.env.ENV === "PROD") {
                    if (req.method === "POST" || req.method === "GET") {
                        if (
                            (Object.keys(params).length === 0 && params.constructor === Object) ||
                            (Object.keys(query).length === 0 && query.constructor === Object)
                        ) {
                            let sanitizedHeaders = {}
                            for (let key in headers) {
                                const value = vd.escape(req.headerString(`${key}`))
                                sanitizedHeaders[`${key}`] = value
                            }
                            req.headers = sanitizedHeaders
                            next()
                        }
                        else {
                            res.status(401).json({
                                message: "Parameters Not Allowed"
                            })
                        }
                    }
                    else {
                        res.status(401).json({
                            message: "Method Not Allowed"
                        })
                    }
                }
                else {
                    res.status(401).json({
                        message: "Origin Not Allowed"
                    })
                }
            }
            else {
                res.status(401).json({
                    message: "Proxy Detected"
                })
            }
        }
        else {
            next()
        }
    }
    catch (error) {
        console.log(error)
    }
}

// checks whether the user have a valid session
export const requireSignin = async (req, res, next) => {
    try {
        const tokens = Object.values(authTokens)
        const webSessions = Object.values(webSessionList)
        const webSessionToken = jwt.verify(await decryptAES(req.cookies.sessionId, process.env.AES_SECRET), publicKey, { algorithms: ['ES512'] })
        const webSession = webSessions.find(webSession => webSession.sessionId === webSessionToken.sessionId)
        if (req.cookies.encToken) {
            const encToken = req.cookies.encToken
            const token = await decryptAES(encToken, process.env.AES_SECRET)
            if (token) {
                const tokenHash = CryptoJS.SHA256(token).toString()
                
                if (tokenHash === webSession.userSession) {
                    const authToken = tokens.find(authToken => authToken.tokenHash === tokenHash)
                    if (authToken) {
                        try {
                            const user = jwt.verify(token, publicKey, { algorithms: ['ES512'] })
                            if (user) {
                                if (req.headers['x-forwarded-for'] !== authToken.ip) {
                                    return res.status(400).json({
                                        message: "Invalid Session IP"
                                    })
                                }
                                else {
                                    req.user = user
                                    next()
                                }
                            }
                            else {
                                return res.status(400).json({
                                    message: "Invalid Token"
                                })
                            }
                        } catch (error) {
                            console.log(error)
                            return res.status(401).json({
                                message: "Session Expired"
                            })
                        }
                    }

                }
                else {
                    return res.status(400).json({
                        message: "User and Web sessions mismatch"
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: "Invalid Token"
                })
            }
        }
        else {
            return res.status(400).json({
                message: "Authorization Required!"
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong",
            payload: error
        })
    }
}
