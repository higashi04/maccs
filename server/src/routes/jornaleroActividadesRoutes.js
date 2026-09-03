import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

import jornaleroActividadesController from "../controllers/jornaleroActividadesController.js";

router.get("/", verifyToken, jornaleroActividadesController.ReadActividades);
// Captura masiva: N actividades de un jornalero ligadas a una orden de compra en un solo request.
router.post("/", verifyToken, jornaleroActividadesController.crearActividades);
router.put("/:id", verifyToken, requireAdmin, jornaleroActividadesController.actualizarActividad);
router.delete("/:id", verifyToken, requireAdmin, jornaleroActividadesController.eliminarActividad);

export default router;
