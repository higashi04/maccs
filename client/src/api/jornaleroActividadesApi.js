import { apiFetch } from "../utils/api";

/**
 * Obtiene el registro de actividades diarias, filtrable por jornalero y/o por orden de compra.
 * @param {{ jornalero?: string, ordenCompra?: string }} [filtros] - filtros opcionales.
 * @returns {Promise<Array<Object>>} arreglo de registros de actividades.
 */
export async function getActividades(filtros = {}) {
  const query = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== "" && valor !== null)
  ).toString();

  const response = await apiFetch(`/api/jornalero-actividades${query ? `?${query}` : ""}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron obtener las actividades");
  }

  return data;
}

/**
 * Registra las actividades diarias realizadas por un jornalero.
 * @param {Object} actividad - datos de la actividad a registrar (jornalero, ordenCompra, fecha, modelo y conteos por actividad).
 * @returns {Promise<Object>} el registro creado.
 */
export async function createActividad(actividad) {
  const response = await apiFetch("/api/jornalero-actividades", {
    method: "POST",
    body: JSON.stringify(actividad),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo registrar la actividad");
  }

  return data;
}

/**
 * Elimina un registro de actividad diaria.
 * @param {string} actividadId - id del registro a eliminar.
 * @returns {Promise<Object>} el registro eliminado.
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
