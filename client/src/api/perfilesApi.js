import { apiFetch } from "../utils/api";

/**
 * Obtiene la lista de perfiles registrados, con sus módulos poblados.
 * @returns {Promise<Array<Object>>} arreglo de perfiles.
 */
export async function getPerfiles() {
  const response = await apiFetch("/api/perfiles/read");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los perfiles");
  }

  return data;
}

/**
 * Crea un nuevo perfil.
 * @param {{ nombrePerfil: string, modulos: string[] }} perfil - datos del perfil a crear.
 * @returns {Promise<Object>} el perfil creado.
 */
export async function createPerfil(perfil) {
  const response = await apiFetch("/api/perfiles/create", {
    method: "POST",
    body: JSON.stringify(perfil),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo crear el perfil");
  }

  return data;
}

/**
 * Actualiza el nombre y/o la lista de módulos permitidos de un perfil.
 * @param {string} perfilId - id del perfil a actualizar.
 * @param {{ nombrePerfil?: string, modulos?: string[] }} cambios - campos a actualizar.
 * @returns {Promise<Object>} el perfil actualizado.
 */
export async function updatePerfil(perfilId, cambios) {
  const response = await apiFetch(`/api/perfiles/update/${perfilId}`, {
    method: "PUT",
    body: JSON.stringify(cambios),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar el perfil");
  }

  return data;
}
