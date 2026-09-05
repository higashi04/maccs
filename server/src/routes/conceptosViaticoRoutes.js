import express from "express";
const router = express.Router();
import { verifyToken } from "../middleware/authMiddleware.js";

import conceptosViaticoController from "../controllers/conceptosViaticoController.js";

router.get("/", verifyToken, conceptosViaticoController.ReadActiveConceptos);
router.get("/all", verifyToken, conceptosViaticoController.ReadAllConceptos);
router.post("/", verifyToken, conceptosViaticoController.crearConcepto);
router.put("/:id", verifyToken, conceptosViaticoController.actualizarConcepto);
router.delete("/:id", verifyToken, conceptosViaticoController.eliminarConcepto);

export default router;
