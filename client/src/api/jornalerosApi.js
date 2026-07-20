import { apiFetch } from "../utils/api";

/**
 * Obtiene la lista de jornaleros activos.
 * @returns {Promise<Array<Object>>} arreglo de jornaleros.
 */
export async function getJornaleros() {
  const response = await apiFetch("/api/jornaleros");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los jornaleros");
  }

  return data;
}

/**
 * Obtiene la lista completa de jornaleros (activos e inactivos) para su gestión.
 * @returns {Promise<Array<Object>>} arreglo de jornaleros.
 */
export async function getAllJornaleros() {
  const response = await apiFetch("/api/jornaleros/all");
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener los jornaleros");
  }

  return data;
}

/**
 * Crea un nuevo jornalero.
 * @param {{ nombre: string, activo?: boolean }} jornalero - datos del jornalero a crear.
 * @returns {Promise<Object>} el jornalero creado.
 */
export async function createJornalero(jornalero) {
  const response = await apiFetch("/api/jornaleros", {
    method: "POST",
    body: JSON.stringify(jornalero),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo crear el jornalero");
  }

  return data;
}

/**
 * Actualiza el nombre y/o estado activo de un jornalero.
 * @param {string} jornaleroId - id del jornalero.
 * @param {{ nombre?: string, activo?: boolean }} cambios - campos a actualizar.
 * @returns {Promise<Object>} el jornalero actualizado.
 */
export async function updateJornalero(jornaleroId, cambios) {
  const response = await apiFetch(`/api/jornaleros/${jornaleroId}`, {
    method: "PUT",
    body: JSON.stringify(cambios),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar el jornalero");
  }

  return data;
}

/**
 * Elimina (desactiva) un jornalero, conservando su historial de préstamos.
 * @param {string} jornaleroId - id del jornalero.
 * @returns {Promise<Object>} el jornalero desactivado.
 */
export async function deleteJornalero(jornaleroId) {
  const response = await apiFetch(`/api/jornaleros/${jornaleroId}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar el jornalero");
  }

  return data;
}

/**
 * Agrega un nuevo préstamo pendiente a un jornalero.
 * @param {string} jornaleroId - id del jornalero.
 * @param {{ fecha: string, cantidad: number }} prestamo - datos del préstamo.
 * @returns {Promise<Object>} el jornalero actualizado.
 */
export async function addPrestamo(jornaleroId, prestamo) {
  const response = await apiFetch(`/api/jornaleros/${jornaleroId}/prestamos`, {
    method: "POST",
    body: JSON.stringify(prestamo),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo agregar el préstamo");
  }

  return data;
}

/**
 * Actualiza fecha/cantidad de un préstamo pendiente.
 * @param {string} jornaleroId - id del jornalero.
 * @param {string} prestamoId - id del préstamo a actualizar.
 * @param {{ fecha: string, cantidad: number }} prestamo - datos actualizados del préstamo.
 * @returns {Promise<Object>} el jornalero actualizado.
 */
export async function updatePrestamo(jornaleroId, prestamoId, prestamo) {
  const response = await apiFetch(`/api/jornaleros/${jornaleroId}/prestamos/${prestamoId}`, {
    method: "PUT",
    body: JSON.stringify(prestamo),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar el préstamo");
  }

  return data;
}

/**
 * Marca un préstamo pendiente como pagado.
 * @param {string} jornaleroId - id del jornalero.
 * @param {string} prestamoId - id del préstamo a marcar como pagado.
 * @returns {Promise<Object>} el jornalero actualizado.
 */
export async function pagarPrestamo(jornaleroId, prestamoId) {
  const response = await apiFetch(`/api/jornaleros/${jornaleroId}/prestamos/${prestamoId}/pagar`, {
    method: "POST",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo marcar el préstamo como pagado");
  }

  return data;
}
