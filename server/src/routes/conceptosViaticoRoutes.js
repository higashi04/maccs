import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

import conceptosViaticoController from "../controllers/conceptosViaticoController.js";

router.get("/", verifyToken, conceptosViaticoController.ReadActiveConceptos);
router.get("/all", verifyToken, requireAdmin, conceptosViaticoController.ReadAllConceptos);
router.post("/", verifyToken, requireAdmin, conceptosViaticoController.crearConcepto);
router.put("/:id", verifyToken, requireAdmin, conceptosViaticoController.actualizarConcepto);
router.delete("/:id", verifyToken, requireAdmin, conceptosViaticoController.eliminarConcepto);

export default router;
