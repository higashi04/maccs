import express from "express";
const router = express.Router();
import { verifyToken } from '../middleware/authMiddleware.js';

import jornalerosController from "../controllers/jornalerosController.js";

router.get("/", verifyToken, jornalerosController.ReadActiveJornaleros);
router.get("/all", verifyToken, jornalerosController.ReadAllJornaleros);
router.post("/", verifyToken, jornalerosController.crearJornalero);
router.put("/:id", verifyToken, jornalerosController.actualizarJornalero);
router.delete("/:id", verifyToken, jornalerosController.eliminarJornalero);
router.post("/:id/prestamos", verifyToken, jornalerosController.agregarPrestamo);
router.put("/:id/prestamos/:prestamoId", verifyToken, jornalerosController.actualizarPrestamo);
router.post("/:id/prestamos/:prestamoId/pagar", verifyToken, jornalerosController.marcarPrestamoPagado);

export default router;
