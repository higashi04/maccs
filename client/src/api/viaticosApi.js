import { apiFetch } from "../utils/api";

/**
 * Obtiene la lista de viáticos activos.
 * @param {{ ordenCompra?: string }} [filtros] - filtros opcionales (ej. id de orden de compra).
 * @returns {Promise<Array<Object>>} arreglo de viáticos.
 */
export async function getViaticos(filtros = {}) {
  const query = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== "")
  ).toString();

  const response = await apiFetch(`/api/viaticos${query ? `?${query}` : ""}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los viáticos");
  }

  return data;
}

/**
 * Obtiene los viáticos ligados a una orden de compra.
 * @param {string} ordenId - id de la orden de compra.
 * @returns {Promise<Array<Object>>} arreglo de viáticos de la orden.
 */
export async function getViaticosByOrden(ordenId) {
  const response = await apiFetch(`/api/viaticos/orden/${ordenId}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los viáticos de la orden");
  }

  return data;
}

/**
 * Obtiene un viático por su id.
 * @param {string} viaticoId - id del viático.
 * @returns {Promise<Object>} el viático.
 */
export async function getViaticoById(viaticoId) {
  const response = await apiFetch(`/api/viaticos/${viaticoId}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo obtener el viático");
  }

  return data;
}

/**
 * Captura en lote N viáticos ligados a una orden de compra en un solo request.
 * @param {string} ordenCompra - id de la orden de compra a la que se ligan los viáticos.
 * @param {Array<{ concepto: string, monto: number, fecha?: string, descripcion?: string, ordenCompra?: string }>} viaticos - filas capturadas.
 * @returns {Promise<Array<Object>>} los viáticos creados.
 */
export async function createViaticos(ordenCompra, viaticos) {
  const response = await apiFetch("/api/viaticos", {
    method: "POST",
    body: JSON.stringify({ ordenCompra, viaticos }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron registrar los viáticos");
  }

  return data;
}

/**
 * Actualiza los datos de un viático individual.
 * @param {string} viaticoId - id del viático.
 * @param {{ concepto?: string, monto?: number, fecha?: string, descripcion?: string, ordenCompra?: string }} cambios - campos a actualizar.
 * @returns {Promise<Object>} el viático actualizado.
 */
export async function updateViatico(viaticoId, cambios) {
  const response = await apiFetch(`/api/viaticos/${viaticoId}`, {
    method: "PUT",
    body: JSON.stringify(cambios),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar el viático");
  }

  return data;
}

/**
 * Elimina (desactiva) un viático, conservando su historial.
 * @param {string} viaticoId - id del viático.
 * @returns {Promise<Object>} el viático desactivado.
 */
export async function deleteViatico(viaticoId) {
  const response = await apiFetch(`/api/viaticos/${viaticoId}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar el viático");
  }

  return data;
}
