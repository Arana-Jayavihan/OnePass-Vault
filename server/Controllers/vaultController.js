import shortID from "shortid"
import jwt from 'jsonwebtoken'
import { assignVaultParser, vaultDataParser, vaultLoginParser } from "../Parsers/parsers.js"
import { createVault, getAssignVaults, getUserVaultEncKey, getVaultHash, getAllVaultLogins } from "./contractController.js"
import { getVault } from "./contractController.js"

export const addVault = async (req, res) => {
    try {
        const vault = req.body
        const result = await createVault(vault.email, vault.vName, vault.vDesc, vault.encVaultKey, vault.vaultKeyHash)
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

const vaultUnlockTokens = {}

export const vaultUnlockRequest = async (req, res) => {
    try {
        const vaultIndex = req.body.vaultIndex
        const email = req.body.email
        const id = shortID.generate()
        const token = {
            email: email,
            vaultIndex: vaultIndex,
            id: id
        }

        const vaultUnlockToken = jwt.sign({ vaultIndex: vaultIndex, email: email, id: id }, process.env.JWT_SECRET, { expiresIn: '5m' })
        vaultUnlockTokens[id] = token
        console.log(vaultUnlockTokens, "new vault unlock request")
        res.status(200).json({
            message: "Vault Unlock Token Generated",
            payload: vaultUnlockToken
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
        const user = req.user
        console.log(user)
        const decoded = jwt.verify(vaultUnlockToken, process.env.JWT_SECRET)
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
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}

export const getVaultLogins = async (req, res) => {
    try {
        const vaultIndex = req.body.vaultIndex
        const result = await getAllVaultLogins(vaultIndex)
        console.log(result, vaultIndex)
        const parsedLogins = vaultLoginParser(result)
        if (result) {
            res.status(200).json({
                message: "Vault Logins Fetched",
                payload: parsedLogins
            })
        }
        else if (result === false) {
            res.status(500).json({
                message: "Something Went Wrong!"
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
        const token = req.body.token
        const email = req.body.email
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (vaultUnlockTokens[decoded.id].email === email){
            const result = await getVault(vaultUnlockTokens[decoded.id].vaultIndex)
            if (result) {
                const vaultData = vaultDataParser(result)
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
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something Went Wrong!",
            error: error
        })
    }
}