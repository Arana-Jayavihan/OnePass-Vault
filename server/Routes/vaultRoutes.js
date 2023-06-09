import express from 'express'
import { addVault, getUserAssignedVaults, vaultUnlockRequest, getEncVaultKey, getVaultData } from '../Controllers/vaultController.js'
import { requireSignin } from '../middlware/index.js'

const router = express.Router()

router.post("/vault/get-assigned-vaults", requireSignin, getUserAssignedVaults)
router.post("/vault/add-vault", requireSignin, addVault)
router.post("/vault/get-vault-unlock-token", requireSignin, vaultUnlockRequest)
router.post("/vault/get-enc-vault-key", requireSignin, getEncVaultKey)
router.post("/vault/get-vault-data", requireSignin, getVaultData)

export default router