import { apiFetch } from "../utils/api";

/**
 * Obtiene los conceptos de viático activos del catálogo.
 * @returns {Promise<Array<Object>>} arreglo de conceptos.
 */
export async function getConceptosViatico() {
  const response = await apiFetch("/api/conceptos-viatico");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los conceptos de viático");
  }

  return data;
}

/**
 * Obtiene el catálogo completo de conceptos (activos e inactivos) para su gestión.
 * @returns {Promise<Array<Object>>} arreglo de conceptos.
 */
export async function getAllConceptosViatico() {
  const response = await apiFetch("/api/conceptos-viatico/all");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los conceptos de viático");
  }

  return data;
}

/**
 * Crea un nuevo concepto en el catálogo.
 * @param {{ TipoViatico: string, nombre?: string, activo?: boolean }} concepto - datos del concepto.
 * @returns {Promise<Object>} el concepto creado.
 */
export async function createConceptoViatico(concepto) {
  const response = await apiFetch("/api/conceptos-viatico", {
    method: "POST",
    body: JSON.stringify(concepto),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo crear el concepto de viático");
  }

  return data;
}

/**
 * Actualiza el tipo, nombre y/o estado activo de un concepto.
 * @param {string} conceptoId - id del concepto.
 * @param {{ TipoViatico?: string, nombre?: string, activo?: boolean }} cambios - campos a actualizar.
 * @returns {Promise<Object>} el concepto actualizado.
 */
export async function updateConceptoViatico(conceptoId, cambios) {
  const response = await apiFetch(`/api/conceptos-viatico/${conceptoId}`, {
    method: "PUT",
    body: JSON.stringify(cambios),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar el concepto de viático");
  }

  return data;
}

/**
 * Elimina (desactiva) un concepto del catálogo.
 * @param {string} conceptoId - id del concepto.
 * @returns {Promise<Object>} el concepto desactivado.
 */
export async function deleteConceptoViatico(conceptoId) {
  const response = await apiFetch(`/api/conceptos-viatico/${conceptoId}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar el concepto de viático");
  }

  return data;
}
