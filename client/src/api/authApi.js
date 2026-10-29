import { apiFetch } from "../utils/api";

/**
 * Cambia la contraseña del usuario autenticado (obligatorio tras recibir una contraseña temporal).
 * @param {string} currentPassword - contraseña actual (la temporal).
 * @param {string} newPassword - nueva contraseña.
 * @returns {Promise<Object>} el usuario actualizado.
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await apiFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo cambiar la contraseña");
  }

  return data;
}
