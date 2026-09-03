import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Tarifas de una actividad por tipo de silla. Todas opcionales: no todas las
 * actividades cobran por tipo de silla (ver hoja del stakeholder). El monto que
 * gana el jornalero por esa actividad = `cantidad × tarifas[tipoSilla de la OC]`.
 */
const TarifasSchema = new Schema(
  {
    H: { type: Number, min: 0 },
    D: { type: Number, min: 0 },
    N: { type: Number, min: 0 },
    C: { type: Number, min: 0 },
    S: { type: Number, min: 0 },
    B: { type: Number, min: 0 },
  },
  { _id: false }
);

/**
 * Catálogo de actividades de jornaleros.
 *
 * Sigue el mismo estándar que `conceptoViatico`: `nombre` es la etiqueta que se
 * muestra al capturar el avance diario de un jornalero (p. ej. "Respaldos",
 * "Raspar", "Primera tinta"). `descripcion` es una aclaración opcional y
 * `tarifas` guarda el precio por pieza según el tipo de silla.
 */
const ConceptoActividadSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    tarifas: {
      type: TarifasSchema,
      default: () => ({}),
    },
    activo: {
      type: Boolean,
      default: true,
    },
    createdBy: String,
    updatedBy: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("conceptoActividad", ConceptoActividadSchema);
