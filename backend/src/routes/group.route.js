import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  getAvailableGroups,
  joinGroup,
  leaveGroup,
  getGroupById,
  deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Get groups
router.get("/my-groups", getMyGroups);
router.get("/available", getAvailableGroups);
router.get("/:id", getGroupById);

// Create group
router.post("/", createGroup);

// Join/Leave group
router.post("/:id/join", joinGroup);
router.post("/:id/leave", leaveGroup);

// Delete group (admin only)
router.delete("/:id", deleteGroup);

export default router;
