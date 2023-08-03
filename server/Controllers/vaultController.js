import shortID from "shortid"
import jwt from 'jsonwebtoken'
import { assignVaultParser, vaultDataParser } from "../Parsers/parsers.js"
import { createVault, getAssignVaults, getUserVaultEncKey, addVaultUser, getUser } from "./contractController.js"
import { getVault } from "./contractController.js"
import CryptoJS from "crypto-js"
import sh from 'shortid'
import { sendMails } from "./mailController.js"
import { vaultInvite } from "../emails/vaultInvite.js"
import dotenv from 'dotenv'
dotenv.config()

let vaultUnlockTokens = {}
let addVaultUserTokens = {}
sh.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
export const addVault = async (req, res) => {
    try {
        const user = req.user
        const vault = req.body
        const vaultName = vault.vName + "_" + shortID.generate()
        if (vault.email === user.email) {
            const result = await createVault(vault.email, vaultName, vault.vDesc, vault.encVaultKey, vault.vaultKeyHash, user.hashPass, vault.customFields)
            if (result === false) {
                res.status(500).json({
                    message: "Something Went Wrong!"
                })
            }
            else if (result === "Invalid Password") {
                res.status(401).json({
                    message: "Invalid Password"
                })
            }
            else if (result === "User Not Found") {
                res.status(400).json({
                    message: "User Not Found"
                })
            }
            else if (result) {
                const vaults = await getAssignVaults(vault.email)
                if (vaults === false) {
                    res.status(500).json({
                        message: "Something Went Wrong!"
                    })
                }
                else if (vaults === "User Not Found") {
                    res.status(400).json({
                        message: "User Not Found"
                    })
                }
                else if (vaults && vaults.length > 0) {
                    const validVaults = assignVaultParser(vaults)
                    res.status(201).json({
                        message: "Vault Added Successfully",
                        payload: validVaults
                    })
                }
            }
        }
        else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const getUserAssignedVaults = async (req, res) => {
    try {
        const email = req.body.email
        const user = req.user
        if (email === user.email) {
            const result = await getAssignVaults(email)
            if (result === false) {
                res.status(500).json({
                    message: "Something Went Wrong!"
                })
            }
            else if (result === "User Not Found") {
                res.status(400).json({
                    message: "User Not Found"
                })
            }
            else if (result && result.length >= 0) {
                const validVaults = assignVaultParser(result)
                res.status(200).json({
                    message: "User vault data fetched",
                    payload: validVaults
                })
            }
        }
        else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const vaultUnlockRequest = async (req, res) => {
    try {
        const vaultIndex = req.body.vaultIndex
        const email = req.user.email
        if (email === req.body.email) {
            const id = shortID.generate()
            const ip = req.headers['x-forwarded-for']
            const token = {
                email: email,
                vaultIndex: vaultIndex,
                id: id,
                ip: ip
            }
            const vaultUnlockToken = jwt.sign({ vaultIndex: vaultIndex, email: email, id: id }, process.env.JWT_SECRET, { expiresIn: 600 })
            const encVaultUnlockToken = CryptoJS.AES.encrypt(vaultUnlockToken, process.env.AES_SECRET, {
                iv: CryptoJS.SHA256(sh.generate()).toString(),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString()
            const tokenHash = CryptoJS.SHA256(encVaultUnlockToken).toString()
            token['vaultUnlockToken'] = vaultUnlockToken
            vaultUnlockTokens[id] = token
            console.log(vaultUnlockTokens, "new vault unlock request")
            res.cookie('encVaultUnlockToken', encVaultUnlockToken, {
                path: `/`,
                maxAge: 300000,
                sameSite: "none",
                secure: true,
                httpOnly: true
            })
            res.status(200).json({
                message: "Vault Unlock Token Generated",
                payload: tokenHash
            })
        }
        else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const getEncVaultKey = async (req, res) => {
    try {

        const vaultIndex = req.body.vaultIndex
        const email = req.body.email
        const user = req.user
        if (email === user.email) {
            const encVaultUnlockToken = req.cookies.encVaultUnlockToken
            if (encVaultUnlockToken === undefined) {
                res.status(400).json({
                    message: "Invalid Token"
                })
            }
            else {
                const decVaultUnlockToken = CryptoJS.AES.decrypt(encVaultUnlockToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
                const ip = req.headers['x-forwarded-for']
                const decoded = jwt.verify(decVaultUnlockToken, process.env.JWT_SECRET)
                const vaultUnlockToken = vaultUnlockTokens[decoded.id].vaultUnlockToken
                if (ip === vaultUnlockTokens[decoded.id].ip) {
                    if (decVaultUnlockToken === vaultUnlockToken) {
                        if (vaultUnlockTokens[decoded.id].email === email && vaultUnlockTokens[decoded.id].vaultIndex === vaultIndex && vaultUnlockTokens[decoded.id].email === user.email) {
                            const result = await getUserVaultEncKey(email, user.hashPass, vaultIndex)
                            if (result === false || result === "") {
                                res.status(500).json({
                                    message: "Something Went Wrong!"
                                })
                            }
                            else if (result === "Invalid Password") {
                                res.status(401).json({
                                    message: "Invalid Password"
                                })
                            }
                            else if (result && result !== "") {
                                res.status(200).json({
                                    message: "Vault Encrypted Key Fetched",
                                    payload: result
                                })
                            }
                        }
                        else {
                            res.status(400).json({
                                message: "Invalid Token"
                            })
                            try {
                                delete vaultUnlockTokens[decoded.id]
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    }
                    else {
                        res.status(400).json({
                            message: "Invalid Token"
                        })
                        try {
                            delete vaultUnlockTokens[decoded.id]
                        } catch (error) {
                            console.log(error)
                        }
                    }
                }
                else {
                    res.status(400).json({
                        message: "Invalid Session"
                    })
                    try {
                        delete vaultUnlockTokens[decoded.id]
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }
        else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const getVaultData = async (req, res) => {
    try {
        const email = req.body.email
        const user = req.user
        if (email === user.email) {
            const encVaultUnlockToken = req.cookies.encVaultUnlockToken
            if (encVaultUnlockToken === undefined) {
                res.status(400).json({
                    message: "Invalid Token"
                })
            }
            else {
                const decVaultUnlockToken = CryptoJS.AES.decrypt(encVaultUnlockToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
                const decoded = jwt.verify(decVaultUnlockToken, process.env.JWT_SECRET)
                const vaultUnlockToken = vaultUnlockTokens[decoded.id].vaultUnlockToken
                if (vaultUnlockToken && decVaultUnlockToken === vaultUnlockToken) {
                    const user = req.user
                    const ip = req.headers['x-forwarded-for']
                    const decoded = jwt.verify(vaultUnlockToken, process.env.JWT_SECRET)
                    if (ip === vaultUnlockTokens[decoded.id].ip) {
                        if (vaultUnlockTokens[decoded.id].email === email && vaultUnlockTokens[decoded.id].email === user.email) {
                            const result = await getVault(vaultUnlockTokens[decoded.id].vaultIndex)
                            if (result && result.length > 0) {
                                const vaultData = vaultDataParser(result)
                                try {
                                    delete vaultUnlockTokens[decoded.id]
                                } catch (error) {
                                    console.log(error)
                                }
                                res.status(200).json({
                                    message: "Vault Data Fetched",
                                    payload: vaultData
                                })
                            }
                            else if (result === false) {
                                res.status(500).json({
                                    message: "Something Went Wrong!"
                                })
                            }
                        }
                        else {
                            res.status(400).json({
                                message: "Invalid Token"
                            })
                            try {
                                delete vaultUnlockTokens[decoded.id]
                            } catch (error) {
                                console.log(error)
                            }

                        }
                    }
                    else {
                        res.status(400).json({
                            message: "Invalid Session"
                        })
                        try {
                            delete vaultUnlockTokens[decoded.id]
                        } catch (error) {
                            console.log(error)
                        }
                    }
                }
                else {
                    res.status(400).json({
                        message: "Invalid Token"
                    })
                    try {
                        delete vaultUnlockTokens[decoded.id]
                    } catch (error) {
                        console.log(error)
                    }

                }
            }
        }
        else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const addVaultUserRequest = async (req, res) => {
    try {
        const body = req.body
        const user = req.user
        if (body.email === user.email) {
            const result = await getVault(body.vaultIndex)
            if (result && result.length > 0) {
                const parsedVaultData = vaultDataParser(result)
                if (parsedVaultData && parsedVaultData.ownerEmail !== body.email && parsedVaultData.ownerEmail !== user.email) {
                    res.status(400).json({
                        message: "You Are Not The Owner Of This Vault"
                    })
                }
                else {
                    let token = {
                        email: body.email,
                        vaultIndex: body.vaultIndex,
                        id: shortID.generate(),
                        addUserEmail: body.addUserEmail,
                        encVaultKey: body.encVaultKey,
                    }
                    const addedUser = await getUser(body.addUserEmail)
                    if (addedUser === false) {
                        res.status(500).json({
                            message: "Something Went Wrong!"
                        })
                    }
                    else if (addedUser === []) {
                        res.status(400).json({
                            message: "User Not Found"
                        })
                    }
                    else if (addedUser && addedUser.length > 0) {
                        const assignedVaults = assignVaultParser(addedUser[4])
                        const vault = assignedVaults.find(vault => vault.vaultIndex === body.vaultIndex)
                        if (vault) {
                            res.status(400).json({
                                message: "User Already Assigned To Vault"
                            })
                        }
                        else if (vault === undefined) {
                            const addVaultUserToken = jwt.sign({ vaultIndex: body.vaultIndex, email: body.email, id: token.id, addUserEmail: body.addUserEmail, hashPass: user.hashPass }, process.env.JWT_SECRET, { expiresIn: '6h' })
                            const encToken = CryptoJS.AES.encrypt(addVaultUserToken, process.env.AES_SECRET, {
                                iv: CryptoJS.SHA256(sh.generate()).toString(),
                                mode: CryptoJS.mode.CBC,
                                padding: CryptoJS.pad.Pkcs7
                            }).toString()
                            const b64EncToken = Buffer.from(encToken).toString('base64')
                            const URL = `https://onepass-vault-v3.netlify.app/vault-invite/${b64EncToken}`
                            const URL1 = `https://localhost:3000/vault-invite/${b64EncToken}`
                            addVaultUserTokens[token.id] = token
                            console.log(addVaultUserTokens, "new vault user add request")
                            const mailData = {
                                to: body.addUserEmail,
                                subject: "New Vault Invitation",
                                html: vaultInvite(URL, body.email),
                                attachments: [],
                                body: ``
                            }
                            const result = sendMails(mailData)
                            if (result) {
                                res.status(200).json({
                                    message: "Vault Invitation Sent"
                                })
                            }
                            else {
                                res.status(500).json({
                                    message: "Something Went Wrong!"
                                })
                            }
                        }
                    }
                }
            }
            else if (result === false) {
                res.status(500).json({
                    message: "Something Went Wrong!"
                })
            }
        }
        else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const getInviteData = async (req, res) => {
    try {
        const token = req.body.token
        const fromB64 = Buffer.from(token, 'base64').toString('ascii')
        const decToken = CryptoJS.AES.decrypt(fromB64, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
        const decoded = jwt.verify(decToken, process.env.JWT_SECRET)
        if (decoded) {
            if (addVaultUserTokens[decoded.id].addUserEmail === req.user.email) {
                if (addVaultUserTokens[decoded.id]) {
                    const result = await getVault(decoded.vaultIndex)
                    if (result && result.length > 0) {
                        const vault = vaultDataParser(result)
                        const payload = {
                            vaultName: vault.vaultName,
                            vaultIndex: vault.vaultIndex,
                            vaultDesc: vault.description,
                            ownerEmail: vault.ownerEmail,
                            numUsers: vault.numUsers,
                            numLogins: vault.numLogins,
                            encVaultKey: addVaultUserTokens[decoded.id].encVaultKey,
                            addUserEmail: addVaultUserTokens[decoded.id].addUserEmail
                        }
                        console.log(payload)
                        res.cookie('addVaultUserToken', token, {
                            path: '/',
                            maxAge: 300000,
                            sameSite: "none",
                            secure: true,
                            httpOnly: true
                        })
                        res.status(200).json({
                            message: "Vault Invite Data Fetched",
                            payload: payload
                        })
                    }
                    else if (result === false) {
                        res.status(500).json({
                            message: "Something Went Wrong!"
                        })
                    }
                }
                else {
                    res.status(400).json({
                        message: "Invalid Invite Token"
                    })
                }
            }
            else {
                res.status(400).json({
                    message: "This Invitation Is Not For You!"
                })
            }
        }
        else {
            res.status(400).json({
                message: "Invalid Invite Token"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const acceptVaultInvite = async (req, res) => {
    try {
        const body = req.body
        const token = req.cookies.addVaultUserToken
        const fromB64 = Buffer.from(token, 'base64').toString('ascii')
        const decToken = CryptoJS.AES.decrypt(fromB64, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
        const decoded = jwt.verify(decToken, process.env.JWT_SECRET)
        if (decoded) {
            if (addVaultUserTokens[decoded.id].addUserEmail === req.user.email && addVaultUserTokens[decoded.id].addUserEmail === body.email) {
                if (addVaultUserTokens[decoded.id]) {
                    const result = await addVaultUser(addVaultUserTokens[decoded.id].vaultIndex, addVaultUserTokens[decoded.id].email, addVaultUserTokens[decoded.id].addUserEmail, body.encVaultKey, decoded.hashPass)
                    if (result === "User Already Assigned") {
                        res.status(400).json({
                            message: "User Already Assigned To Vault"
                        })
                    }
                    else if (result === "User Not Found"){
                        res.status(400).json({
                            message: "User Not Found"
                        })
                    }
                    else if (result === "Invalid Password") {
                        res.status(401).json({
                            message: "Invalid Password"
                        })
                    }
                    else if (result === false) {
                        res.status(500).json({
                            message: "Something Went Wrong!"
                        })
                    }
                    else if (result) {
                        delete addVaultUserTokens[decoded.id]
                        res.status(201).json({
                            message: "Vault Invitation Accepted"
                        })
                    }
                }
                else {
                    res.status(400).json({
                        message: "Invalid Invite Token"
                    })
                }
            }
            else {
                res.status(400).json({
                    message: "This Invitation Is Not For You!"
                })
            }
        }
        else {
            res.status(400).json({
                message: "Invalid Invite Token"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

function clearVaultUnlockTokens() {
    if (vaultUnlockTokens.length > 0) {
        console.log("clearing vault unlock tokens")
        vaultUnlockTokens = {}
    }
}
function clearAddVaultUserTokens() {
    if (addVaultUserTokens.length > 0) {
        console.log("clearing add vault user tokens")
        addVaultUserTokens = {}
    }
}
setInterval(clearAddVaultUserTokens, 21600000)
setInterval(clearVaultUnlockTokens, 120000)


