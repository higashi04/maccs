import express from "express";
const router = express.Router();
import { verifyToken } from "../middleware/authMiddleware.js";

import conceptosActividadController from "../controllers/conceptosActividadController.js";

router.get("/", verifyToken, conceptosActividadController.ReadActiveConceptos);
router.get("/all", verifyToken, conceptosActividadController.ReadAllConceptos);
router.post("/", verifyToken, conceptosActividadController.crearConcepto);
router.put("/:id", verifyToken, conceptosActividadController.actualizarConcepto);
router.delete("/:id", verifyToken, conceptosActividadController.eliminarConcepto);

export default router;
