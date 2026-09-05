import express from "express";
import perfilesController from "../controllers/perfilesController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, perfilesController.CreatePerfil);
router.get("/read", verifyToken, perfilesController.ReadPerfiles);
router.put("/update/:id", verifyToken, perfilesController.UpdatePerfil);

export default router;
