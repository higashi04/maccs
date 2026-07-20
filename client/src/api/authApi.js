import { apiFetch } from "../utils/api";

/**
 * Solicita un enlace de restablecimiento de contraseña para el correo dado.
 * @param {string} email - correo del usuario que olvidó su contraseña.
 * @returns {Promise<Object>} mensaje de confirmación del servidor.
 */
export async function requestPasswordReset(email) {
  const response = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo procesar la solicitud");
  }

  return data;
}

/**
 * Restablece la contraseña de un usuario usando el token recibido por correo.
 * @param {string} token - token de restablecimiento.
 * @param {string} password - nueva contraseña.
 * @returns {Promise<Object>} mensaje de confirmación del servidor.
 */
export async function resetPassword(token, password) {
  const response = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo restablecer la contraseña");
  }

  return data;
}
