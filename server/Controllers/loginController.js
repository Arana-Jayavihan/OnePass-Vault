import { addVaultLogin, getAllVaultLogins } from "./contractController.js"
import { vaultLoginParser } from "../Parsers/parsers.js"

export const addLogin = async (req, res) => {
    try {
        console.log(req.body)
        const user = req.user
        if (req.body.email === user.email) {
            const result = await addVaultLogin(req.body.email, req.body.loginName, req.body.loginUrl, req.body.loginUsername, req.body.loginPassword, user.hashPass, req.body.vaultIndex, req.body.customFields)
            if (result) {
                const logins = await getAllVaultLogins(req.body.vaultIndex)
                if (logins === false) {
                    res.status(500).json({
                        message: 'Something Went Wrong!'
                    })
                }
                else if (logins && logins.length >= 0) {
                    const parsedLogins = vaultLoginParser(logins)
                    res.status(201).json({
                        message: "Login Added Successfully!",
                        payload: parsedLogins
                    })
                }
            }
            else if (result === false) {
                res.status(500).json({
                    message: 'Something Went Wrong!'
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