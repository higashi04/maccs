import crypto from "crypto";
import UserModel from "../models/UserModel.js";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const MIN_PASSWORD_LENGTH = 8;
const TEMP_PASSWORD_LENGTH = 10;
// Sin caracteres ambiguos (0/O, 1/l/I) para que sea fácil de dictar o leer.
const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000,
};

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      perfil: user.perfil,
      mustChangePassword: Boolean(user.mustChangePassword),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1d" }
  );

/**
 * Genera una contraseña temporal aleatoria con generador criptográfico.
 * @returns {string} contraseña de TEMP_PASSWORD_LENGTH caracteres.
 */
const generateTempPassword = () =>
  Array.from({ length: TEMP_PASSWORD_LENGTH }, () =>
    TEMP_PASSWORD_ALPHABET[crypto.randomInt(TEMP_PASSWORD_ALPHABET.length)]
  ).join("");

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
   * Lista los usuarios del sistema (sin contraseña) con el nombre de su perfil.
   * @param {import('express').Request} req - request sin parámetros esperados.
   * @param {import('express').Response} res - responde con el arreglo de usuarios (200) o un error (500).
   */
  ListUsers: async (req, res) => {
    try {
      const users = await UserModel.find()
        .select("-password")
        .populate("perfil", "nombrePerfil")
        .sort({ username: 1 })
        .lean();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Restablece la contraseña de otro usuario generando una contraseña temporal. El usuario
   * deberá cambiarla al iniciar sesión. La contraseña temporal se devuelve una sola vez.
   * No permite restablecer la propia cuenta ni cuentas administradoras (salvo que quien lo
   * solicita también sea administrador) para evitar escalamiento de privilegios.
   * @param {import('express').Request} req - request con :id del usuario objetivo en params.
   * @param {import('express').Response} res - responde con { username, tempPassword } (200), 400, 403, 404 o 500.
   */
  AdminResetPassword: async (req, res) => {
    try {
      const { id } = req.params;

      if (String(id) === String(req.user.id)) {
        return res
          .status(400)
          .json({ message: "No puedes restablecer tu propia contraseña desde aquí" });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (user.isAdmin && !req.user.isAdmin) {
        return res
          .status(403)
          .json({ message: "No tienes permiso para restablecer esta cuenta" });
      }

      const tempPassword = generateTempPassword();
      const salt = await bycrypt.genSalt(10);
      user.password = await bycrypt.hash(tempPassword, salt);
      user.mustChangePassword = true;
      user.updatedBy = req.user.username;
      await user.save();

      res.status(200).json({ username: user.username, email: user.email, tempPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  /**
   * Cambia la contraseña del usuario autenticado (flujo obligatorio tras una contraseña temporal).
   * Valida la contraseña actual, apaga mustChangePassword y renueva la cookie de sesión.
   * @param {import('express').Request} req - request con { currentPassword, newPassword } en el body.
   * @param {import('express').Response} res - responde con el usuario actualizado (200), 400, 401 o 500.
   */
  ChangePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
        return res
          .status(400)
          .json({ message: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const currentMatches = await bycrypt.compare(currentPassword || "", user.password);
      if (!currentMatches) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }

      if (currentPassword === newPassword) {
        return res
          .status(400)
          .json({ message: "La nueva contraseña debe ser diferente a la actual" });
      }

      const salt = await bycrypt.genSalt(10);
      user.password = await bycrypt.hash(newPassword, salt);
      user.mustChangePassword = false;
      user.updatedBy = req.user.username;
      await user.save();

      res.cookie("token", signToken(user), COOKIE_OPTIONS);

      const { password: _password, ...safeUser } = user.toObject();
      res.status(200).json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

export default authController;