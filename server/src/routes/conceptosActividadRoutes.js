import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

import conceptosActividadController from "../controllers/conceptosActividadController.js";

router.get("/", verifyToken, conceptosActividadController.ReadActiveConceptos);
router.get("/all", verifyToken, requireAdmin, conceptosActividadController.ReadAllConceptos);
router.post("/", verifyToken, requireAdmin, conceptosActividadController.crearConcepto);
router.put("/:id", verifyToken, requireAdmin, conceptosActividadController.actualizarConcepto);
router.delete("/:id", verifyToken, requireAdmin, conceptosActividadController.eliminarConcepto);

export default router;
