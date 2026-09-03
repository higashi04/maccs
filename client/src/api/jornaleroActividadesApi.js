import { apiFetch } from "../utils/api";

/**
 * Obtiene las actividades activas registradas, filtrables por jornalero y/o por orden de compra.
 * @param {{ jornalero?: string, ordenCompra?: string }} [filtros] - filtros opcionales.
 * @returns {Promise<Array<Object>>} arreglo de actividades.
 */
export async function getActividades(filtros = {}) {
  const query = new URLSearchParams(
    Object.entries(filtros).filter(
      ([, valor]) => valor !== undefined && valor !== "" && valor !== null
    )
  ).toString();

  const response = await apiFetch(`/api/jornalero-actividades${query ? `?${query}` : ""}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener las actividades");
  }

  return data;
}

/**
 * Captura en lote N actividades de un jornalero ligadas a una orden de compra en un solo request.
 * @param {{
 *   jornalero: string,
 *   ordenCompra: string,
 *   fecha?: string,
 *   modelo?: string,
 *   salarioJornalero?: number,
 * }} comun - datos comunes al lote.
 * @param {Array<{ actividad: string, cantidad: number, descripcion?: string }>} actividades - filas capturadas.
 * @returns {Promise<Array<Object>>} las actividades creadas.
 */
export async function createActividades(comun, actividades) {
  const response = await apiFetch("/api/jornalero-actividades", {
    method: "POST",
    body: JSON.stringify({ ...comun, actividades }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron registrar las actividades");
  }

  return data;
}

/**
 * Actualiza los datos de una actividad individual.
 * @param {string} actividadId - id del registro.
 * @param {{
 *   actividad?: string,
 *   cantidad?: number,
 *   salarioJornalero?: number,
 *   fecha?: string,
 *   modelo?: string,
 *   descripcion?: string,
 *   jornalero?: string,
 *   ordenCompra?: string,
 * }} cambios - campos a actualizar.
 * @returns {Promise<Object>} la actividad actualizada.
 */
export async function updateActividad(actividadId, cambios) {
  const response = await apiFetch(`/api/jornalero-actividades/${actividadId}`, {
    method: "PUT",
    body: JSON.stringify(cambios),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar la actividad");
  }

  return data;
}

/**
 * Elimina (desactiva) una actividad, conservando su historial.
 * @param {string} actividadId - id del registro a eliminar.
 * @returns {Promise<Object>} el registro desactivado.
 */
export async function deleteActividad(actividadId) {
  const response = await apiFetch(`/api/jornalero-actividades/${actividadId}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar la actividad");
  }

  return data;
}
