import express from 'express'
import { requireSignin } from '../middlware/index.js'
import { getMasterEncryptionKey, getPrivKey, getPubKey } from '../Controllers/keyController.js'

const router = express.Router()
router.post("/keys/get-master-key", requireSignin, getMasterEncryptionKey)
router.post("/keys/get-pub-key", requireSignin, getPubKey)
router.post("/keys/get-priv-key", requireSignin, getPrivKey)

export default router