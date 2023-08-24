import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { tokenlist as authTokens } from '../Controllers/authController.js'
import fs from 'fs'
import dotenv from 'dotenv'
import vd from 'validator'
import sh from 'shortid'
dotenv.config()

import { updateWebSession, webSessionList } from '../Controllers/webSessionController.js'
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
            url.includes('/auth/token')
        ) {
            const encSessionToken = req.cookies.sessionId
            const sessionToken = CryptoJS.AES.decrypt(encSessionToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
            if (sessionToken) {
                const verifiedToken = jwt.verify(sessionToken, publicKey, { algorithms: ['ES512'] })
                if (verifiedToken) {
                    const webSessions = Object.values(webSessionList)
                    const webSession = webSessions.find(webSession => webSession.sessionId === verifiedToken.sessionId)
                    if (webSession) {
                        if (req.headers['x-forwarded-for'] === webSession.ip) {
                            const sessionEncKey = webSession.secretKey
                            try {
                                const decData = CryptoJS.AES.decrypt(req.body.encData, sessionEncKey).toString(CryptoJS.enc.Utf8)
                                req.body = JSON.parse(decData)
                                const result = await updateWebSession(webSession.sessionId, req.body.webPubKey)
                                if (result) {
                                    const encServerPubKey = CryptoJS.AES.encrypt(result.serverPubKey, sessionEncKey, {
                                        iv: CryptoJS.SHA256(sh.generate()).toString(),
                                        mode: CryptoJS.mode.CBC,
                                        padding: CryptoJS.pad.Pkcs7
                                    }).toString()
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
                                res.status(401).json({
                                    message: "Request Not Allowed"
                                })
                            }
                        }
                        else {
                            res.status(401).json({
                                message: "Invalid Web Session IP"
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
export const requireSignin = (req, res, next) => {
    try {
        const tokens = Object.values(authTokens)
        if (req.cookies.encToken) {
            const encToken = req.cookies.encToken
            const token = CryptoJS.AES.decrypt(encToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
            if (token) {
                const tokenHash = CryptoJS.SHA256(token).toString()
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
                else {
                    return res.status(400).json({
                        message: "Invalid Token"
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

// export const requireSignin = (req, res, next) => {
//     try {
//         const tokens = Object.values(authTokens)
//         if (req.headers.authorization) {
//             const token = req.headers.authorization
//             const authToken = tokens.find(authToken => authToken.token === token)
//             console.log(authToken)
//             const encToken = req.body.encToken
//             const decToken = CryptoJS.AES.decrypt(encToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
//             if (decToken === token) {
//                 const user = jwt.verify(token, process.env.JWT_SECRET)
//                 req.user = user
//                 if (req.user.ip !== req.headers['x-forwarded-for']) {
//                     return res.status(400).json({
//                         message: "Invalid Session"
//                     })
//                 }
//             }
//             else {
//                 return res.status(401).json({
//                     message: "Potential Malicious Atempt"
//                 })
//             }
//         }
//         else {
//             return res.status(400).json({
//                 message: "Authorization Required!"
//             })
//         }

//         next()
//     }
//     catch (error) {
//         console.log(error)
//         res.status(401).json({
//             message: "Session Expired",
//             payload: error
//         })
//     }
// }