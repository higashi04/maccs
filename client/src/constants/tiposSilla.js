/**
 * Catálogo fijo de tipos de silla, tomado de la hoja de captura del stakeholder.
 * El `code` es la letra usada en la hoja y como llave de las tarifas por actividad.
 * @type {Array<{ code: string, label: string }>}
 */
export const TIPOS_SILLA = [
  { code: "H", label: "Steakhouse" },
  { code: "D", label: "Pappadax" },
  { code: "N", label: "Negras" },
  { code: "C", label: "Café" },
  { code: "S", label: "Sittos" },
  { code: "B", label: "Bancos" },
];

/** Llaves válidas de tipo de silla (`["H", "D", "N", "C", "S", "B"]`). */
export const TIPO_SILLA_CODES = TIPOS_SILLA.map((tipo) => tipo.code);

/**
 * Devuelve la etiqueta legible de un código de tipo de silla.
 * @param {string} code - código (`"H"`, `"D"`, ...).
 * @returns {string} etiqueta o el mismo código si no se reconoce.
 */
export const tipoSillaLabel = (code) =>
  TIPOS_SILLA.find((tipo) => tipo.code === code)?.label || code || "—";
