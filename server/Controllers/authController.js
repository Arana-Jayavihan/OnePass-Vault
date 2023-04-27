import jwt from 'jsonwebtoken'
import { addUserData, addUserKeys, getMasterEncKEy, getPrivateKey, getUser, getUserHashPass } from './contractController.js';

const tokenlist = {}

// User SignUp Functions
export const userKeyGeneration = async (req, res) => {
    try {
        const user = req.body
        console.log(user)
        const chkUser = await getUser(user.email)
        console.log(chkUser)
        if (chkUser[0] !== user.email) {
            const result = await addUserKeys(user)
            if (result.receipt.confirmations != 0) {
                res.status(201).json({
                    message: 'User Key Generation Success'
                })
            }
            else {
                res.status(500).json({
                    message: 'User Key Generation Unsuccessful',
                    error: result
                })
            }
            // res.status(201).json({
            //     message: 'User Key Generation Success'
            // })
        }
        else {
            res.status(404).json({
                message: 'User Already Registerd'
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

export const addData = async (req, res) => {
    try {
        const user = req.body
        const chkUser = await getUser(user.email)
        if (chkUser[0] === user.email) {
            const result = await addUserData(user)
            if (result.receipt.confirmations != 0) {
                res.status(201).json({
                    message: "User Data Added"
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
        console.log(req.body)
        const chkUser = await getUser(email)
        console.log(chkUser)
        if (chkUser[0] === email) {
            const hashPass = await getUserHashPass(email)
            console.log(hashPass)
            if (hashPass) {
                res.status(200).json({
                    message: "User Hash Fetch Success",
                    payload: hashPass
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
        console.log(req.body)
        const userResult = await getUser(user.hashEmail)
        if (userResult[0] !== user.hashEmail) {
            res.status(404).json({
                message: "User not found"
            })
        }
        else if (userResult[0] === user.hashEmail) {
            const hashPass = await getUserHashPass(user.hashEmail)

            if (hashPass === user.hashPass) {
                const encPrivate = await getPrivateKey(user.hashEmail)
                const encMasterKey = await getMasterEncKEy(user.hashEmail)
                const token = jwt.sign({ email: user.hashEmail }, process.env.JWT_SECRET, { expiresIn: '1h' })
                const refreshToken = jwt.sign({ email: user.hashEmail }, process.env.JWT_REFRESHSECRET, { expiresIn: '24h' })

                tokenlist[refreshToken] = {
                    refreshToken,
                    token
                }
                console.log(tokenlist, "New Signin")
                res.status(200).json({
                    message: "Authentication successful",
                    user: {
                        email: userResult[0],
                        firstName: userResult[1],
                        lastName: userResult[2],
                        contact: userResult[3],
                        masterKey: encMasterKey,
                        privateKey: encPrivate
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
        console.log(req.body)
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