import express from 'express'
import { signIn, signOut, signUp, tokenRefresh } from '../Controllers/authController.js'

const router = express.Router()

router.post("/auth/signup", signUp)
router.post("/auth/signin", signIn)
router.post("/auth/token", tokenRefresh)
router.post("/auth/signout", signOut)

export default router