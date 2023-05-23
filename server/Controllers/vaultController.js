import { assignVaultParser } from "../Parsers/parsers.js"
import { createVault, getAssignVaults, getUserVaultEncKey, getVaultHash } from "./contractController.js"

export const addVault = async (req, res) => {
    try {
        const vault = req.body
        const result = await createVault(vault.email, vault.vName, vault.vDesc, vault.encVaultKey, vault.vaultKeyHash)
        const vaults = await getAssignVaults(vault.email)
        const validVaults = assignVaultParser(vaults)
        if (result !== false){
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
        if(result) {
            res.status(200).json({
                message: "User vault data fetched",
                payload: validVaults
            })
        }
        else if(result === false){
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

export const getVaultKeyHash = async (req, res) => {
    try {
        const vaultIndex = req.body.vaultIndex
        const result = await getVaultHash(vaultIndex)
        if(result){
            res.status(200).json({
                message: "Vault Hash Fetched",
                payload: result
            })
        }
        else if(result === false){
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

export const getEncVaultKey = async (req, res) => {
    try {
        const vaultIndex = req.body.vaultIndex
        const email = req.body.email
        const result = await getUserVaultEncKey(vaultIndex, email)
        if(result && result !== ""){
            res.status(200).json({
                message: "Vault Encrypted Key Fetched",
                payload: result
            })
        }
        else if(result === false || result === ""){
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