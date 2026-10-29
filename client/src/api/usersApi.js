import { apiFetch } from "../utils/api";

/**
 * Obtiene la lista de usuarios del sistema.
 * @returns {Promise<Array<Object>>} arreglo de usuarios (sin contraseña) con su perfil.
 */
export async function getUsers() {
  const response = await apiFetch("/api/auth/users");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los usuarios");
  }

  return data;
}

/**
 * Restablece la contraseña de un usuario generando una contraseña temporal.
 * @param {string} userId - id del usuario cuya contraseña se restablece.
 * @returns {Promise<{ username: string, email: string, tempPassword: string }>} datos del usuario y la contraseña temporal (se muestra una sola vez).
 */
export async function resetUserPassword(userId) {
  const response = await apiFetch(`/api/auth/users/${userId}/reset-password`, {
    method: "POST",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo restablecer la contraseña");
  }

  return data;
}
