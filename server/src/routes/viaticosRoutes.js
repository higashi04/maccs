import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

import viaticosController from "../controllers/viaticosController.js";

router.get("/", verifyToken, viaticosController.ReadActiveViaticos);
router.get("/orden/:ordenId", verifyToken, viaticosController.ReadViaticosByOrden);
router.get("/:id", verifyToken, viaticosController.ReadViaticoById);
// Captura masiva: N viáticos ligados a una orden de compra en un solo request.
router.post("/", verifyToken, requireAdmin, viaticosController.crearViaticos);
router.put("/:id", verifyToken, requireAdmin, viaticosController.actualizarViatico);
router.delete("/:id", verifyToken, requireAdmin, viaticosController.eliminarViatico);

export default router;
