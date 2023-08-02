import jwt from 'jsonwebtoken'
import { addUserData, addUserKeys, getMasterEncKey, getPrivateKey, getPublicKey, getUser, getUserHashPass, removeUser } from './contractController.js';
import CryptoJS from 'crypto-js'
import sh from 'shortid'
import dotenv from 'dotenv'
dotenv.config()

export let tokenlist = {}

// User SignUp Functions
export const userKeyGeneration = async (req, res) => {
    try {
        const user = req.body
        console.log(user)
        const chkUser = await getUser(user.email)
        console.log(chkUser)
        if (chkUser[0] !== user.email) {
            const result = await addUserKeys(user)
            if (result.receipt.confirmations !== 0) {
                res.status(201).json({
                    message: 'User Key Generation Success'
                })
            }
            else if (result === false) {
                res.status(500).json({
                    message: 'Something went wrong...'
                })
            }
            else {
                res.status(500).json({
                    message: 'User Key Generation Unsuccessful',
                    error: result
                })
            }
        }
        else {
            res.status(401).json({
                message: 'User Already Registerd'
            })
        }

    } catch (error) {
        console.log(error)
        const result = await removeUser(user.email, "")
        if (result.receipt.confirmations !== 0) {
            res.status(500).json({
                message: 'Something went wrong... Please try again',
                error: error
            })
        }
        else {
            res.status(500).json({
                message: 'Something went wrong... Please try again',
                error: error
            })
        }
    }
}

export const addData = async (req, res) => {
    try {
        const user = req.body
        const chkUser = await getUser(user.email)
        if (chkUser[0] === user.email) {
            const result = await addUserData(user)
            if (result.receipt.confirmations !== 0) {
                res.status(201).json({
                    message: "User Data Added"
                })
            }
            else if (result === "You are not the owner of the object") {
                res.status(401).json({
                    message: 'Unauthorized'
                })
            }
            else if (result === false) {
                res.status(500).json({
                    message: 'Something went wrong...'
                })
            }
            else {
                res.status(500).json({
                    message: 'User Data Add Failed',
                    error: result
                })
            }
        }
        else {
            res.status(404).json({
                message: 'User Not Found'
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

// User SignIn Functions
export const signInRequest = async (req, res) => {
    try {
        const email = req.body.email
        const chkUser = await getUser(email)
        if (chkUser[0] === email) {
            const hashPass = await getUserHashPass(email)
            if (hashPass) {
                res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: "none" })
                res.clearCookie('encToken', { httpOnly: true, secure: true, sameSite: "none" })
                res.clearCookie('encVaultUnlockToken', { httpOnly: true, secure: true, sameSite: "none" })
                res.clearCookie('addVaultUserToken', { httpOnly: true, secure: true, sameSite: "none" })
                res.status(200).json({
                    message: "User Hash Fetch Success",
                    payload: hashPass
                })
            }
            else if (hashPass === "User Not Found") {
                res.status(500).json({
                    message: 'User Not Found...'
                })
            }
            else if (result === false) {
                res.status(500).json({
                    message: 'Something went wrong...'
                })
            }
        }
        else {
            res.status(404).json({
                message: 'User Not Found'
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
        const IP = req.headers['x-forwarded-for']
        console.log(req.headers['x-forwarded-for'], "IP")
        const userResult = await getUser(user.hashEmail)
        if (userResult[0] !== user.hashEmail) {
            res.status(404).json({
                message: "User not found"
            })
        }
        else if (userResult[0] === user.hashEmail) {
            const hashPass = await getUserHashPass(user.hashEmail)

            if (hashPass === user.hashPass) {
                const encPrivate = await getPrivateKey(user.hashEmail, hashPass)
                const encMasterKey = await getMasterEncKey(user.hashEmail, hashPass)
                const publicKey = await getPublicKey(user.hashEmail)
                if (
                    encPrivate !== false &&
                    encMasterKey !== false &&
                    publicKey !== false &&
                    encPrivate !== "Invalid Password" &&
                    encMasterKey !== "Invalid Password" &&
                    encPrivate !== "User Not Found" &&
                    encMasterKey !== "User Not Found" &&
                    publicKey !== "User Not Found"
                ) {
                    const token = jwt.sign({ email: user.hashEmail, ip: IP, hashPass: hashPass }, process.env.JWT_SECRET, { expiresIn: '1h' })
                    const tokenHash = CryptoJS.SHA256(token).toString()
                    const refreshToken = jwt.sign({ tokenHash: tokenHash }, process.env.JWT_REFRESHSECRET, { expiresIn: '24h' })
                    const encToken = CryptoJS.AES.encrypt(token, process.env.AES_SECRET, {
                        iv: CryptoJS.SHA256(sh.generate()).toString(),
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }).toString()
                    tokenlist[refreshToken] = {
                        'refreshToken': refreshToken,
                        'hashPass': hashPass,
                        'tokenHash': tokenHash,
                        'ip': IP
                    }
                    console.log(tokenlist, "New Signin")
                    console.log(userResult)
                    res.cookie('refreshToken', refreshToken, {
                        path: '/',
                        maxAge: 7200000,
                        sameSite: "none",
                        secure: true,
                        httpOnly: true
                    })
                    res.cookie('encToken', encToken, {
                        path: '/',
                        maxAge: 3600000,
                        sameSite: "none",
                        secure: true,
                        httpOnly: true
                    })
                    res.status(200).json({
                        message: "Authentication successful",
                        user: {
                            email: userResult[0],
                            firstName: userResult[1],
                            lastName: userResult[2],
                            contact: userResult[3],
                            masterKey: encMasterKey,
                            privateKey: encPrivate,
                            publicKey: publicKey
                        }
                    })
                    console.log(user)
                }
                else {
                    res.status(401).json({
                        message: "Unauthorized"
                    })
                }
            }
            else {
                res.status(401).json({
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
        let refreshToken = req.cookies.refreshToken
        let encToken = req.cookies.encToken
        let token = CryptoJS.AES.decrypt(encToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            let tokenHash = CryptoJS.SHA256(token).toString()
            let email = req.body.email
            let ip = req.headers['x-forwarded-for']
            if (Object.keys(tokenlist).length > 0 && tokenlist.constructor === Object) {
                if (tokenlist[refreshToken].ip === ip) {
                    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESHSECRET)
                    if (tokenHash === tokenlist[refreshToken].tokenHash && decodedRefresh.tokenHash === tokenlist[refreshToken].tokenHash) {
                        try {
                            delete tokenlist[refreshToken]
                            token = jwt.sign({ email: email, ip: ip, hashPass: decodedToken.hashPass }, process.env.JWT_SECRET, { expiresIn: '1h' })
                            tokenHash = CryptoJS.SHA256(token).toString()
                            refreshToken = jwt.sign({ tokenHash: tokenHash }, process.env.JWT_REFRESHSECRET, { expiresIn: '24h' })
                            encToken = CryptoJS.AES.encrypt(token, process.env.AES_SECRET, {
                                iv: CryptoJS.SHA256(sh.generate()).toString(),
                                mode: CryptoJS.mode.CBC,
                                padding: CryptoJS.pad.Pkcs7
                            }).toString()
                            res.cookie('refreshToken', refreshToken, {
                                path: '/',
                                maxAge: 7200000,
                                sameSite: "none",
                                secure: true,
                                httpOnly: true
                            })
                            res.cookie('encToken', encToken, {
                                path: '/',
                                maxAge: 3600000,
                                sameSite: "none",
                                secure: true,
                                httpOnly: true
                            })

                            tokenlist[refreshToken] = {
                                'refreshToken': refreshToken,
                                'hashPass': decodedToken.hashPass,
                                'tokenHash': tokenHash,
                                'ip': ip
                            }
                            console.log(tokenlist, "New TokenRefresh")
                            res.status(200).json({
                                message: "Session Extended"
                            })
                        }
                        catch (error) {
                            console.log(error)
                        }
                    }
                    else {
                        res.status(401).json({
                            message: "Invalid Token"
                        })
                    }
                }
                else {
                    res.status(401).json({
                        message: "Invalid Session"
                    })
                }
            }
            else {
                res.status(401).json({
                    message: "Session Expired"
                })
            }
        }
        else {
            res.status(400).json({
                message: "Invalid Token"
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
        const refreshToken = req.cookies.refreshToken
        delete tokenlist[refreshToken]
        console.log(tokenlist, "SignOut")
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: "none" })
        res.clearCookie('encToken', { httpOnly: true, secure: true, sameSite: "none" })
        res.clearCookie('encVaultUnlockToken', { httpOnly: true, secure: true, sameSite: "none" })
        res.clearCookie('addVaultUserToken', { httpOnly: true, secure: true, sameSite: "none" })
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

function clearTokenList() {
    tokenlist = {}
    console.log("token list cleared", tokenlist)
}

setInterval(clearTokenList, 7200000)
//86400000