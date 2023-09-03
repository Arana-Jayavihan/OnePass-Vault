import { addVaultLogin, getAllVaultLogins } from "./contractController.js"
import { vaultLoginParser } from "../Parsers/parsers.js"
import shortID from 'shortid'
import CryptoJS from "crypto-js"

export const addLogin = async (req, res) => {
    try {
        console.log(req.body)
        const user = req.user
        if (req.body.email === user.email) {
            let customFields = req.body.customFields
            if (customFields.length > 0) {
                for (let field of customFields) {
                    field['id'] = shortID.generate()
                }
            }
            const result = await addVaultLogin(req.body.email, req.body.loginName, req.body.loginUrl, req.body.loginUsername, req.body.loginPassword, user.hashPass, req.body.vaultIndex, customFields)
            if (result) {
                const logins = await getAllVaultLogins(req.body.vaultIndex)
                if (logins === false) {
                    res.status(500).json({
                        message: 'Something Went Wrong!'
                    })
                }
                else if (logins && logins.length >= 0) {
                    const parsedLogins = vaultLoginParser(logins)
                    const encodedPayload = JSON.stringify(parsedLogins)
                    const encPayload = CryptoJS.AES.encrypt(encodedPayload, req.body.newServerAESKey, {
                        iv: CryptoJS.SHA256(shortID.generate()).toString(),
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }).toString()
                    res.status(201).json({
                        message: "Login Added Successfully!",
                        payload: encPayload,
                        serverPubKey: req.body.serverPubKey
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
        const parsedLogins = vaultLoginParser(result)
        // const encodedPayload = JSON.stringify(parsedLogins)
        // const encPayload = CryptoJS.AES.encrypt(encodedPayload, req.body.newServerAESKey, {
        //     iv: CryptoJS.SHA256(sh.generate()).toString(),
        //     mode: CryptoJS.mode.CBC,
        //     padding: CryptoJS.pad.Pkcs7
        // }).toString()

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