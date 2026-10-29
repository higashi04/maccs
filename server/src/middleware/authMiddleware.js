import jwt from "jsonwebtoken";
import PerfilModel from "../models/PerfilModel.js";

/**
 * Decodifica el JWT de la cookie y lo deja en req.user.
 * @param {import('express').Request} req - request con la cookie "token".
 * @param {import('express').Response} res - responde 401 si no hay token o es inválido.
 * @param {import('express').NextFunction} next
 * @returns {boolean} true si el token fue válido y req.user quedó asignado.
 */
const decodeToken = (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "No autenticado" });
    return false;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado" });
    return false;
  }
};

/**
 * Exige sesión válida. Si el usuario tiene una contraseña temporal pendiente de cambio
 * (mustChangePassword), bloquea el acceso con 403 hasta que la cambie.
 */
export const verifyToken = (req, res, next) => {
  if (!decodeToken(req, res)) return;

  if (req.user.mustChangePassword) {
    return res.status(403).json({
      code: "PASSWORD_CHANGE_REQUIRED",
      message: "Debes cambiar tu contraseña temporal para continuar",
    });
  }

  next();
};

/**
 * Igual que verifyToken pero permite pasar a usuarios con contraseña temporal pendiente.
 * Solo debe usarse en las rutas necesarias para completar el cambio (/me y /change-password).
 */
export const verifyTokenAllowPending = (req, res, next) => {
  if (!decodeToken(req, res)) return;
  next();
};

/**
 * Extrae el identificador de un componente guardado como "Users" o "<Users />".
 * @param {string} [componente]
 * @returns {string|null}
 */
const componentKey = (componente) => {
  const match = componente?.match(/[A-Za-z_][A-Za-z0-9_]*/);
  return match ? match[0] : null;
};

/**
 * Crea un middleware que solo deja pasar a usuarios cuyo perfil tenga asignado el módulo
 * con el componente indicado. Los permisos de usuario se manejan por perfil, no por isAdmin.
 * Debe usarse después de verifyToken.
 * @param {string} componente - nombre del componente del módulo requerido (ej. "Users").
 * @returns {import('express').RequestHandler}
 */
export const requireModule = (componente) => async (req, res, next) => {
  try {
    if (!req.user?.perfil) {
      return res.status(403).json({ message: "No tienes permiso para realizar esta acción" });
    }

    const perfil = await PerfilModel.findById(req.user.perfil).populate("modulos").lean();
    const allowed = perfil?.modulos?.some((modulo) => componentKey(modulo.componente) === componente);

    if (!allowed) {
      return res.status(403).json({ message: "No tienes permiso para realizar esta acción" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};
