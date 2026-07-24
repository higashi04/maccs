import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

import jornaleroActividadesController from "../controllers/jornaleroActividadesController.js";

router.get("/", verifyToken, jornaleroActividadesController.ReadActividades);
router.post("/", verifyToken, jornaleroActividadesController.crearActividad);
router.delete("/:id", verifyToken, requireAdmin, jornaleroActividadesController.eliminarActividad);

export default router;
