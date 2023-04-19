import jwt from 'jsonwebtoken'
import hashy from 'hashy'
import dotenv from 'dotenv'
import CryptoJS from "crypto-js";
import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import { getUserHashPass } from './contractController.js';

dotenv.config()

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, Sepolia);
const contract = await sdk.getContract("0x832d795d7443B3120b1daE52e30C4A4Cf9d7B800");

const tokenlist = {}

export const signUp = async (req, res) => {
    try {
        const data = req.body
        console.log(data)
        const chkUser = await contract.call("getUser", [data.email])
        if (chkUser[0] !== data.email) {
            const hashPass = await hashy.hash(data.password)
            const key = `${process.env.AES_SECRET}${hashPass}`
            const encFName = CryptoJS.AES.encrypt(data.firstName.toString(CryptoJS.enc.Utf8), key).toString()
            const encLName = CryptoJS.AES.encrypt(data.lastName.toString(CryptoJS.enc.Utf8), key).toString()
            const encContact = CryptoJS.AES.encrypt(data.contact.toString(CryptoJS.enc.Utf8), key).toString()

            const result = await contract.call("addUser", [data.email, encFName, encLName, encContact, hashPass])

            if (result) {
                console.log(result)
                res.status(201).json({
                    message: 'User added'
                })
            }
        }
        else{
            res.status(401).json({
                message: 'User already registered'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Something went wrong...',
            error: error
        })
    }
}
export const signIn = async (req, res) => {
    try {
        const user = req.body
        const userResult = await contract.call("getUser", [user.email])
        console.log(userResult[0])
        if (userResult[0] !== user.email) {
            res.status(404).json({
                message: "User not found"
            })
        }
        else if (userResult[0] === user.email) {
            const hashPass = await getUserHashPass(user.email)
            const key = `${process.env.AES_SECRET}${hashPass}`
            const verifyPass = await hashy.verify(user.passwd, hashPass)
            if (verifyPass) {
                const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
                const refreshToken = jwt.sign({ email: user.email }, process.env.JWT_REFRESHSECRET, { expiresIn: '24h' })

                tokenlist[refreshToken] = {
                    refreshToken,
                    token
                }
                console.log(tokenlist, "New Signin")
                res.status(200).json({
                    message: "Authentication successful",
                    user: {
                        email: userResult[0],
                        firstName: CryptoJS.AES.decrypt(userResult[1], key).toString(CryptoJS.enc.Utf8),
                        lastName: CryptoJS.AES.decrypt(userResult[2], key).toString(CryptoJS.enc.Utf8),
                        contact: CryptoJS.AES.decrypt(userResult[3], key).toString(CryptoJS.enc.Utf8)
                    },
                    token: token,
                    refreshToken: refreshToken
                })
            }
            else {
                res.status(402).json({
                    message: 'Authentication Failed'
                })
            }
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const tokenRefresh = async (req, res) => {
    try {
        let refreshToken = req.body.refreshToken
        let token = req.body.token
        let email = req.body.email
        console.log(tokenlist, "TokenRefresh")
        if (Object.keys(tokenlist).length > 0 && tokenlist.constructor === Object) {
            if (token === tokenlist[refreshToken].token) {
                try {
                    delete tokenlist[refreshToken]
                    token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' })
                    refreshToken = jwt.sign({ email: email }, process.env.JWT_REFRESHSECRET, { expiresIn: '24h' })

                    tokenlist[refreshToken] = {
                        refreshToken,
                        token
                    }

                    res.status(200).json({
                        message: "Session Extended",
                        token: token,
                        refreshToken: refreshToken
                    })
                }
                catch (error) {
                    console.log(error)
                }
            }
        }
        else {
            res.status(401).json({
                message: "Session Expired"
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const signOut = async (req, res) => {
    try {
        console.log(tokenlist)
        const refreshToken = req.body.refreshToken
        delete tokenlist[refreshToken]
        console.log(tokenlist, "SignOut")
        res.status(200).json({
            message: "Signout successfully :)"
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }

}