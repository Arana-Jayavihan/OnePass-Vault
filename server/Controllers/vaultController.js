
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