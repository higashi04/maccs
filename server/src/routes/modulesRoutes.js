import express from "express";
import modulesController from "../controllers/modulesController.js";

const router = express.Router();

router.post("/create", modulesController.CreateModule);
router.get("/read", modulesController.ReadModules);

export default router;