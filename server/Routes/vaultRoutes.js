import express from 'express'
import { addVault, getUserAssignedVaults, getVaultKeyHash, getEncVaultKey } from '../Controllers/vaultController.js'
import { requireSignin } from '../middlware/index.js'

const router = express.Router()

router.post("/vault/get-assigned-vaults", requireSignin, getUserAssignedVaults)
router.post("/vault/add-vault", requireSignin, addVault)
router.post("/vault/get-vault-key-hash", requireSignin, getVaultKeyHash)
router.post("/vault/get-enc-vault-key", requireSignin, getEncVaultKey)

export default router