import express from 'express'
import { addLogin, createContract, getAllUserLogins  } from '../Controllers/contractController.js'
import { requireSignin } from '../middlware/index.js'

const router = express.Router()

router.post("/contract/create", createContract)
router.post("/contract/add-login", requireSignin, addLogin)
router.post("/contract/get-all-user-logins", requireSignin, getAllUserLogins)

export default router