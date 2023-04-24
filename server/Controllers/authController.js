import jwt from 'jsonwebtoken'
import hashy from 'hashy'
import dotenv from 'dotenv'
import CryptoJS from "crypto-js";
import crypto from 'crypto'
import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import { getUserHashPass } from './contractController.js';
import { compress, decompress } from 'shrink-string'
import LZString from 'lz-string'

dotenv.config()

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, Sepolia);
const contract = await sdk.getContract("0x991F18E3A03a1D93799077087733B8426A0fD65d");
hashy.options.bcrypt.cost = 13

const tokenlist = {}

export const signUp = async (req, res) => {
    try {
        const data = req.body
        const email = LZString.compress(data.email).toString(CryptoJS.enc.Utf8)
        console.log(email)
        const firstName = LZString.compress(data.firstName)
        const lastName = LZString.compress(data.lastName)
        const contact = LZString.compress(data.contact)
        const encPrivateKey = LZString.compress(data.encPrivateKey)
        const encPublicKey = LZString.compress(data.encPublicKey)


        const chkUser = await contract.call("getUser", [data.email])
        if (chkUser[0] !== data.email) {
            
            // const result = await contract.call("addUser", [email, firstName, lastName, contact, 'hash', encPrivateKey, encPublicKey])

            // if (result) {
            //     console.log(result)
            //     res.status(201).json({
            //         message: 'User added'
            //     })
            // }
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

export const signup1 = async (req, res) => {
    try {
        const data = req.body
        const chkUser = await contract.call("getUser", [data.email])
        if (chkUser[0] !== data.email) {

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