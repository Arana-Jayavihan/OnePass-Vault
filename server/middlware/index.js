import jwt from 'jsonwebtoken'

// checks whether the user have a valid session
export const requireSignin = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization
            const user = jwt.verify(token, process.env.JWT_SECRET)
            req.user = user
            console.log(req.user)
            // if(req.user.ip !== req.headers['x-forwarded-for'])
            // {
            //     return res.status(400).json({
            //         message: "Invalid Session"
            //     })
            // }
        }
        else {
            return res.status(400).json({
                message: "Authorization Required!"
            })
        }

        next()
    }
    catch (error) {
        console.log(error)
        res.status(401).json({
            message: "Session Expired",
            payload: error
        })
    }
}