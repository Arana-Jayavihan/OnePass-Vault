import express from "express";
import { initWebSession, resetWebSessions } from "../Controllers/webSessionController.js";

const router = express.Router();

router.post("/webSession/init", initWebSession)
router.post("/webSession/reset", resetWebSessions)

export default router