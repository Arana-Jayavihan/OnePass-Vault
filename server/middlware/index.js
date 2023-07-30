import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { tokenlist as authTokens } from '../Controllers/authController.js'
// checks whether the user have a valid session
// export const requireSignin = (req, res, next) => {
//     try {
//         const tokens = Object.values(authTokens)
//         if (req.headers.authorization) {
//             const token = req.headers.authorization
//             const authToken = tokens.find(authToken => authToken.token === token)
//             if (authToken) {
//                 const encToken = req.body.encToken
//                 const decToken = CryptoJS.AES.decrypt(encToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
//                 if (decToken === token) {
//                     const user = jwt.verify(token, process.env.JWT_SECRET)
//                     req.user = user
//                     if (req.user.ip !== req.headers['x-forwarded-for']) {
//                         return res.status(400).json({
//                             message: "Invalid Session"
//                         })
//                     }
//                 }
//                 else {
//                     return res.status(401).json({
//                         message: "Potential Malicious Atempt"
//                     })
//                 }
//             }
//             else {
//                 return res.status(400).json({
//                     message: "Invalid Token"
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

export const requireSignin = (req, res, next) => {
    try {
        const tokens = Object.values(authTokens)
        if (req.headers.authorization) {
            const token = req.headers.authorization
            const encToken = req.body.encToken
            const decToken = CryptoJS.AES.decrypt(encToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
            if (decToken === token) {
                const user = jwt.verify(token, process.env.JWT_SECRET)
                req.user = user
                if (req.user.ip !== req.headers['x-forwarded-for']) {
                    return res.status(400).json({
                        message: "Invalid Session"
                    })
                }
            }
            else {
                return res.status(401).json({
                    message: "Potential Malicious Atempt"
                })
            }
        }
        else {
            return res.status(400).json({
                message: "Authorization Required!"
            })
        }

        next()
    }
    catch (error) {
        console.log(error)
        res.status(401).json({
            message: "Session Expired",
            payload: error
        })
    }
}