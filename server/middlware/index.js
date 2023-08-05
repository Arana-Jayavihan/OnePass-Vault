import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { tokenlist as authTokens } from '../Controllers/authController.js'
import dotenv from 'dotenv'
dotenv.config()

// Check user is logged in
export const isLoggedIn = (req, res) => {
    try {
        if (req.cookies.encToken) {
            const tokens = Object.values(authTokens)
            const encToken = req.cookies.encToken
            const token = CryptoJS.AES.decrypt(encToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
            const tokenHash = CryptoJS.SHA256(token).toString()
            const authToken = tokens.find(authToken => authToken.tokenHash === tokenHash)
            if (authToken) {
                const user = jwt.verify(token, process.env.JWT_SECRET)
                if (user) {
                    if (user.ip !== req.headers['x-forwarded-for'] && user.ip !== authToken.ip) {
                        return res.status(400).json({
                            message: "Invalid Session"
                        })
                    }
                    else if (user.email !== req.body.email) {
                        return res.status(400).json({
                            message: "Invalid Session"
                        })
                    }
                    else {
                        res.status(200).json({
                            message: "Logged In"
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
                res.status(400).json({
                    message: "Session Expired"
                })
            }
        }
        else {
            res.status(400).json({
                message: "Not Logged In"
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(401).json({
            message: "Session Expired",
            payload: error
        })
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
                    const user = jwt.verify(token, process.env.JWT_SECRET)
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
        res.status(401).json({
            message: "Session Expired",
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