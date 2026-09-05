import express from "express";
const router = express.Router();
import { verifyToken } from "../middleware/authMiddleware.js";

import ordenesCompraController from "../controllers/ordenesCompraController.js";

router.get("/", verifyToken, ordenesCompraController.ReadActiveOrdenesCompra);
router.get("/all", verifyToken, ordenesCompraController.ReadAllOrdenesCompra);
router.get("/:id", verifyToken, ordenesCompraController.ReadOrdenCompraById);
router.post("/", verifyToken, ordenesCompraController.crearOrdenCompra);
router.put("/:id", verifyToken, ordenesCompraController.actualizarOrdenCompra);
router.delete("/:id", verifyToken, ordenesCompraController.eliminarOrdenCompra);

export default router;
