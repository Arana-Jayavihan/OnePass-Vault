import express from 'express'
import { requireSignin } from '../middlware/index.js'
import { addLogin } from '../Controllers/loginController.js'

const router = express.Router()

router.post("/login/add-login", requireSignin, addLogin)

export default router