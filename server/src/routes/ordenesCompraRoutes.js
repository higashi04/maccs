import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

import ordenesCompraController from "../controllers/ordenesCompraController.js";

router.get("/", verifyToken, ordenesCompraController.ReadActiveOrdenesCompra);
router.get("/all", verifyToken, requireAdmin, ordenesCompraController.ReadAllOrdenesCompra);
router.get("/:id", verifyToken, ordenesCompraController.ReadOrdenCompraById);
router.post("/", verifyToken, requireAdmin, ordenesCompraController.crearOrdenCompra);
router.put("/:id", verifyToken, requireAdmin, ordenesCompraController.actualizarOrdenCompra);
router.delete("/:id", verifyToken, requireAdmin, ordenesCompraController.eliminarOrdenCompra);

export default router;
