import { apiFetch } from "../utils/api";

/**
 * Obtiene la lista de órdenes de compra activas.
 * @returns {Promise<Array<Object>>} arreglo de órdenes de compra.
 */
export async function getOrdenesCompra() {
  const response = await apiFetch("/api/ordenes-compra");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener las órdenes de compra");
  }

  return data;
}

/**
 * Obtiene la lista completa de órdenes de compra (activas e inactivas) para su gestión.
 * @returns {Promise<Array<Object>>} arreglo de órdenes de compra.
 */
export async function getAllOrdenesCompra() {
  const response = await apiFetch("/api/ordenes-compra/all");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener las órdenes de compra");
  }

  return data;
}

/**
 * Obtiene una orden de compra por su id.
 * @param {string} ordenId - id de la orden de compra.
 * @returns {Promise<Object>} la orden de compra.
 */
export async function getOrdenCompraById(ordenId) {
  const response = await apiFetch(`/api/ordenes-compra/${ordenId}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo obtener la orden de compra");
  }

  return data;
}

/**
 * Crea una nueva orden de compra. El folio lo genera el servidor automáticamente.
 * @param {{ modeloSillas: string, tipoSilla?: string, cantidadSillas?: number, MontoEsperado?: number, active?: boolean }} orden - datos de la orden a crear.
 * @returns {Promise<Object>} la orden de compra creada.
 */
export async function createOrdenCompra(orden) {
  const response = await apiFetch("/api/ordenes-compra", {
    method: "POST",
    body: JSON.stringify(orden),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo crear la orden de compra");
  }

  return data;
}

/**
 * Actualiza el modelo, cantidad, monto esperado y/o estado activo de una orden de compra.
 * @param {string} ordenId - id de la orden de compra.
 * @param {{ modeloSillas?: string, tipoSilla?: string, cantidadSillas?: number, MontoEsperado?: number, active?: boolean }} cambios - campos a actualizar.
 * @returns {Promise<Object>} la orden de compra actualizada.
 */
export async function updateOrdenCompra(ordenId, cambios) {
  const response = await apiFetch(`/api/ordenes-compra/${ordenId}`, {
    method: "PUT",
    body: JSON.stringify(cambios),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar la orden de compra");
  }

  return data;
}

/**
 * Elimina (desactiva) una orden de compra, conservando su historial.
 * @param {string} ordenId - id de la orden de compra.
 * @returns {Promise<Object>} la orden de compra desactivada.
 */
export async function deleteOrdenCompra(ordenId) {
  const response = await apiFetch(`/api/ordenes-compra/${ordenId}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar la orden de compra");
  }

  return data;
}
