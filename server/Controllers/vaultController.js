import { createVault, getAssignVaults } from "./contractController.js"

export const addVault = async (req, res) => {
    try {
        const vault = req.body
        console.log(vault)
        const result = createVault(vault.email, vault.vName, vault.vDesc, vault.encVaultKey, vault.vaultKeyHash)
        if (result !== false){
            res.status(201).json({
                message: "Vault Added Successfully"
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
        console.log(result)
        if(result) {
            res.status(200).json({
                message: "User vault data fetched",
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