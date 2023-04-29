import express from 'express'
import { getUserAssignedVaults } from '../Controllers/vaultController.js'
import { requireSignin } from '../middlware/index.js'

const router = express.Router()

router.post("/vault/get-assigned-vaults", requireSignin, getUserAssignedVaults)

export default router