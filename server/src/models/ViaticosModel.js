import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Modelo de Viáticos.
 *
 * Cada viático pertenece a una orden de compra y referencia un concepto
 * del catálogo `conceptoViatico`. Se capturan en lote (ver
 * `viaticosController.crearViaticos`).
 *
 * TODO: ajustar/añadir campos cuando se defina el modelo final.
 */
const ViaticosSchema = new Schema(
  {
    ordenCompra: {
      type: Schema.Types.ObjectId,
      ref: "ordenCompra",
      required: true,
      index: true,
    },
    concepto: {
      type: Schema.Types.ObjectId,
      ref: "conceptoViatico",
      required: true,
    },
    monto: {
      type: Number,
      default: 0,
      required: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    descripcion: {
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

export default mongoose.model("viaticos", ViaticosSchema);
