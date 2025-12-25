import express from "express";
import { requireJwtUserId } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", requireJwtUserId, getStreamToken);

export default router;
