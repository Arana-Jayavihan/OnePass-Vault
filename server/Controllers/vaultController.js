import shortID from "shortid"
import jwt from 'jsonwebtoken'
import { assignVaultParser, vaultDataParser } from "../Parsers/parsers.js"
import { createVault, getAssignVaults, getUserVaultEncKey, addVaultUser, getUser } from "./contractController.js"
import { getVault } from "./contractController.js"
import CryptoJS from "crypto-js"
import sh from 'shortid'
import { sendMails } from "./mailController.js"
import { vaultInvite } from "../emails/vaultInvite.js"

let vaultUnlockTokens = {}
let addVaultUserTokens = {}
sh.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
export const addVault = async (req, res) => {
    try {
        const vault = req.body
        const vaultName = vault.vName + "_" + shortID.generate()
        const result = await createVault(vault.email, vaultName, vault.vDesc, vault.encVaultKey, vault.vaultKeyHash)
        const vaults = await getAssignVaults(vault.email)
        const validVaults = assignVaultParser(vaults)
        if (result !== false) {
            res.status(201).json({
                message: "Vault Added Successfully",
                payload: validVaults
            })
        }
        else {
            res.status(400).jsn({
                message: 'Something Went Wrong!'
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
        const result = await getAssignVaults(email)
        const validVaults = assignVaultParser(result)
        if (result) {
            res.status(200).json({
                message: "User vault data fetched",
                payload: validVaults
            })
        }
        else if (result === false) {
            res.status(500).json({
                message: "Something Went Wrong!",
                error: error
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

        vaultUnlockTokens[id] = token
        console.log(vaultUnlockTokens, "new vault unlock request")
        res.status(200).json({
            message: "Vault Unlock Token Generated",
            payload: {
                vaultUnlockToken,
                encVaultUnlockToken
            }
        })
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
        const vaultUnlockToken = req.body.vaultUnlockToken
        const encVaultUnlockToken = req.body.encVaultUnlockToken
        const decVaultUnlockToken = CryptoJS.AES.decrypt(encVaultUnlockToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)

        const user = req.user
        const ip = req.headers['x-forwarded-for']
        const decoded = jwt.verify(vaultUnlockToken, process.env.JWT_SECRET)
        if (ip === vaultUnlockTokens[decoded.id].ip) {
            if (decVaultUnlockToken === vaultUnlockToken) {
                if (vaultUnlockTokens[decoded.id].email === email && vaultUnlockTokens[decoded.id].vaultIndex === vaultIndex && vaultUnlockTokens[decoded.id].email === user.email) {
                    const result = await getUserVaultEncKey(vaultIndex, email)
                    if (result && result !== "") {
                        res.status(200).json({
                            message: "Vault Encrypted Key Fetched",
                            payload: result
                        })
                    }
                    else if (result === false || result === "") {
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
        const token = req.body.token
        const email = req.body.email
        const encVaultUnlockToken = req.body.encVaultUnlockToken
        const decVaultUnlockToken = CryptoJS.AES.decrypt(encVaultUnlockToken, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
        if (decVaultUnlockToken === token) {
            const user = req.user
            const ip = req.headers['x-forwarded-for']
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (ip === vaultUnlockTokens[decoded.id].ip) {
                if (vaultUnlockTokens[decoded.id].email === email && vaultUnlockTokens[decoded.id].email === user.email) {
                    const result = await getVault(vaultUnlockTokens[decoded.id].vaultIndex)
                    if (result) {
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
        let token = {
            email: body.email,
            vaultIndex: body.vaultIndex,
            id: shortID.generate(),
            addUserEmail: body.addUserEmail,
            encVaultKey: body.encVaultKey,
        }
        const user = await getUser(body.addUserEmail)
        const assignedVaults = assignVaultParser(user[4])
        const vault = assignedVaults.find(vault => vault.vaultIndex === body.vaultIndex)
        if (vault) {
            res.status(400).json({
                message: "User Already Assigned To Vault"
            })
        }
        else if (vault === undefined) {
            const addVaultUserToken = jwt.sign({ vaultIndex: body.vaultIndex, email: body.email, id: token.id, addUserEmail: body.addUserEmail }, process.env.JWT_SECRET, { expiresIn: '6h' })
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
                html: vaultInvite(URL1, body.email),
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
        if (addVaultUserTokens[decoded.id].addUserEmail === req.user.email) {
            if (addVaultUserTokens[decoded.id]) {
                const vaultData = await getVault(decoded.vaultIndex)
                const vault = vaultDataParser(vaultData)
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
                res.status(200).json({
                    message: "Vault Invite Data Fetched",
                    payload: payload
                })
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
        const token = req.body.token
        const fromB64 = Buffer.from(token, 'base64').toString('ascii')
        const decToken = CryptoJS.AES.decrypt(fromB64, process.env.AES_SECRET).toString(CryptoJS.enc.Utf8)
        const decoded = jwt.verify(decToken, process.env.JWT_SECRET)
        if (addVaultUserTokens[decoded.id].addUserEmail === req.user.email && addVaultUserTokens[decoded.id].addUserEmail === body.email) {
            if (addVaultUserTokens[decoded.id]) {
                console.log(addVaultUserTokens[decoded.id].vaultIndex + "\n" + addVaultUserTokens[decoded.id].email + "\n" + addVaultUserTokens[decoded.id].addUserEmail + "\n" + body.encVaultKey)
                const result = await addVaultUser(addVaultUserTokens[decoded.id].vaultIndex, addVaultUserTokens[decoded.id].email, addVaultUserTokens[decoded.id].addUserEmail, body.encVaultKey)
                if (result) {
                    delete addVaultUserTokens[decoded.id]
                    res.status(201).json({
                        message: "Vault Invitation Accepted"
                    })
                    
                }
                else if (result === false){
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


