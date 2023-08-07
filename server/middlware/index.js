import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { tokenlist as authTokens } from '../Controllers/authController.js'
import fs from 'fs'
import dotenv from 'dotenv'
import vd from 'validator'
dotenv.config()

let publicKey = undefined

try {
    publicKey = fs.readFileSync('ecdsaPubKey.pem', 'utf-8')
} catch (error) {
    console.log(error)
}

export const checkRequest = (req, res, next) =>{
    try {
        const headers = req.headers
        const params = req.params
        const query = req.query
        const ips = headers['x-forwarded-for'].split(",")
        if (ips.length <= 1){
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