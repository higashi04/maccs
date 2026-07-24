import crypto from "crypto";
import UserModel from "../models/UserModel.js";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000,
};

const signToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, isAdmin: user.isAdmin, perfil: user.perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1d" }
  );

const authController = {
  CreateUser: async (req, res) => {
    try {
      const { username, email, password, perfil } = req.body;
      const userExists = await UserModel.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "Usuario ya existe" });
      }

      const salt = await bycrypt.genSalt(10);
      const hashPassword = await bycrypt.hash(password, salt);

      const newUser = await UserModel.create({
        username,
        email,
        password: hashPassword,
        perfil: perfil || undefined,
        createdBy: req.user?.username || "postman test",
      });

      const { password: _password, ...safeUser } = newUser.toObject();
      res.status(201).json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  Login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const passwordMatches = await bycrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const token = signToken(user);
      res.cookie("token", token, COOKIE_OPTIONS);

      const { password: _password, ...safeUser } = user.toObject();
      res.status(200).json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  Logout: (req, res) => {
    res.clearCookie("token", { ...COOKIE_OPTIONS, maxAge: undefined });
    res.status(200).json({ message: "Sesión cerrada" });
  },

  Me: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "No autenticado" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Genera un token de restablecimiento de contraseña y lo registra en consola.
   * Responde con un mensaje genérico sin revelar si el correo existe, para evitar enumeración de usuarios.
   */
  ForgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ email });

      if (user) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
        console.log(`Enlace de restablecimiento de contraseña para ${email}: ${resetUrl}`);
      }

      res.status(200).json({
        message: "Si el correo está registrado, se generó un enlace de restablecimiento",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Valida el token de restablecimiento y actualiza la contraseña del usuario.
   */
  ResetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      const hashedToken = crypto.createHash("sha256").update(token || "").digest("hex");

      const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      const salt = await bycrypt.genSalt(10);
      user.password = await bycrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

export default authController;