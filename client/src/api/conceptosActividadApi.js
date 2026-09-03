import { apiFetch } from "../utils/api";

/**
 * Obtiene las actividades activas del catálogo.
 * @returns {Promise<Array<Object>>} arreglo de actividades.
 */
export async function getConceptosActividad() {
  const response = await apiFetch("/api/conceptos-actividad");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener las actividades del catálogo");
  }

  return data;
}

/**
 * Obtiene el catálogo completo de actividades (activas e inactivas) para su gestión.
 * @returns {Promise<Array<Object>>} arreglo de actividades.
 */
export async function getAllConceptosActividad() {
  const response = await apiFetch("/api/conceptos-actividad/all");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener las actividades del catálogo");
  }

  return data;
}

/**
 * Crea una nueva actividad en el catálogo.
 * @param {{ nombre: string, descripcion?: string, activo?: boolean }} concepto - datos de la actividad.
 * @returns {Promise<Object>} la actividad creada.
 */
export async function createConceptoActividad(concepto) {
  const response = await apiFetch("/api/conceptos-actividad", {
    method: "POST",
    body: JSON.stringify(concepto),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo crear la actividad del catálogo");
  }

  return data;
}

/**
 * Actualiza el nombre, descripción y/o estado activo de una actividad del catálogo.
 * @param {string} conceptoId - id de la actividad.
 * @param {{ nombre?: string, descripcion?: string, activo?: boolean }} cambios - campos a actualizar.
 * @returns {Promise<Object>} la actividad actualizada.
 */
export async function updateConceptoActividad(conceptoId, cambios) {
  const response = await apiFetch(`/api/conceptos-actividad/${conceptoId}`, {
    method: "PUT",
    body: JSON.stringify(cambios),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar la actividad del catálogo");
  }

  return data;
}

/**
 * Elimina (desactiva) una actividad del catálogo.
 * @param {string} conceptoId - id de la actividad.
 * @returns {Promise<Object>} la actividad desactivada.
 */
export async function deleteConceptoActividad(conceptoId) {
  const response = await apiFetch(`/api/conceptos-actividad/${conceptoId}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar la actividad del catálogo");
  }

  return data;
}
