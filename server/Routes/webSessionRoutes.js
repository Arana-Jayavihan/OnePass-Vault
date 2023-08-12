import express from "express";
import { initWebSession } from "../Controllers/webSessionController.js";

const router = express.Router();

router.post("/webSession/init", initWebSession)

export default router