import express from 'express'
import { addVault, getUserAssignedVaults } from '../Controllers/vaultController.js'
import { requireSignin } from '../middlware/index.js'

const router = express.Router()

router.post("/vault/get-assigned-vaults", requireSignin, getUserAssignedVaults)
router.post("/vault/add-vault", requireSignin, addVault)

export default router