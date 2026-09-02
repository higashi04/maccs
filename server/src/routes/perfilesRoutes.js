import express from "express";
import perfilesController from "../controllers/perfilesController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, requireAdmin, perfilesController.CreatePerfil);
router.get("/read", verifyToken, perfilesController.ReadPerfiles);
router.put("/update/:id", verifyToken, requireAdmin, perfilesController.UpdatePerfil);

export default router;
