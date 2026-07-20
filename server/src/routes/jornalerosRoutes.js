import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

import jornalerosController from "../controllers/jornalerosController.js";

router.get("/", verifyToken, jornalerosController.ReadActiveJornaleros);
router.get("/all", verifyToken, requireAdmin, jornalerosController.ReadAllJornaleros);
router.post("/", verifyToken, requireAdmin, jornalerosController.crearJornalero);
router.put("/:id", verifyToken, requireAdmin, jornalerosController.actualizarJornalero);
router.delete("/:id", verifyToken, requireAdmin, jornalerosController.eliminarJornalero);
router.post("/:id/prestamos", verifyToken, requireAdmin, jornalerosController.agregarPrestamo);
router.put("/:id/prestamos/:prestamoId", verifyToken, requireAdmin, jornalerosController.actualizarPrestamo);
router.post("/:id/prestamos/:prestamoId/pagar", verifyToken, requireAdmin, jornalerosController.marcarPrestamoPagado);

export default router;
