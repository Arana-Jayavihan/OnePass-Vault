import { getMasterEncKey, getPublicKey, getPrivateKey, getUserHashPass } from "./contractController.js"
export const getMasterEncryptionKey = async (req, res) => {
    try {
        const email = req.body.email
        const result = await getMasterEncKey(email)
        if(result) {
            res.status(200).json({
                message: "Master Encryption Key Fetched",
                payload: result
            })
        }
        else if(result === false) {
            res.status(500).json({
                message: "No User Found!"
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

export const getPubKey = async (req, res) => {
    try {
        console.log(req.body, 'key')
        const email = req.body.email
        const result = await getPublicKey(email)
        if(result) {
            res.status(200).json({
                message: "Public Key Fetched",
                payload: result
            })
        }
        else if(result === false) {
            res.status(500).json({
                message: "No User Found!"
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

export const getPrivKey = async (req, res) => {
    try {
        const email = req.body.email
        const result = await getPrivateKey(email)
        if(result) {
            res.status(200).json({
                message: "Private Key Fetched",
                payload: result
            })
        }
        else if(result === false) {
            res.status(500).json({
                message: "No User Found!"
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

export const getUserHashPassword = async (req, res) => {
    try {
        const email = req.body.email
        const result = await getUserHashPass(email)
        if(result) {
            res.status(200).json({
                message: "User Hash Fetched",
                payload: result
            })
        }
        else if(result === false) {
            res.status(500).json({
                message: "No User Found!"
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