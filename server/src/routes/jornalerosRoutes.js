import express from "express";
const router = express.Router();
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

import jornalerosController from "../controllers/jornalerosController";

router.get("/", verifyToken, jornalerosController.ReadActiveJornaleros);

export default router;