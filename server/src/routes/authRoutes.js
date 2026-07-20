import express from 'express';
import authController from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", verifyToken, requireAdmin, authController.CreateUser);
router.post("/login", authController.Login);
router.post("/logout", authController.Logout);
router.get("/me", verifyToken, authController.Me);
router.post("/forgot-password", authController.ForgotPassword);
router.post("/reset-password", authController.ResetPassword);

export default router;
