import express from 'express';
import authController from '../controllers/authController.js';
import { requireModule, verifyToken, verifyTokenAllowPending } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", verifyToken, authController.CreateUser);
router.post("/login", authController.Login);
router.post("/logout", authController.Logout);
router.get("/me", verifyTokenAllowPending, authController.Me);
router.post("/change-password", verifyTokenAllowPending, authController.ChangePassword);
router.get("/users", verifyToken, requireModule("Users"), authController.ListUsers);
router.post(
  "/users/:id/reset-password",
  verifyToken,
  requireModule("Users"),
  authController.AdminResetPassword
);

export default router;
