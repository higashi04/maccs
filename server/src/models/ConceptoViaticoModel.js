import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Catálogo de conceptos de viático.
 *
 * TODO: ajustar los campos cuando se provea el catálogo definitivo.
 * `nombre` es la etiqueta que se muestra al capturar un viático.
 */
const ConceptoViaticoSchema = new Schema(
  {
    TipoViatico: {
      type: String,
      required: true,
      trim: true,
    },
    nombre: {
      type: String,
      trim: true,
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

export default mongoose.model("conceptoViatico", ConceptoViaticoSchema);
