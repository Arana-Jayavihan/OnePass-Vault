import { getAssignVaults } from "./contractController.js"

export const addVault = async (req, res) => {
    try {
        const vault = req.body
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