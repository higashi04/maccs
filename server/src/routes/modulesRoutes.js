import express from "express";
import modulesController from "../controllers/modulesController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, requireAdmin, modulesController.CreateModule);
router.get("/read", verifyToken, modulesController.ReadModules);

export default router;
