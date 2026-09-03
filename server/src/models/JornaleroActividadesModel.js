import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Modelo de Actividades de Jornaleros.
 *
 * Sigue el mismo estándar que `viaticos`: cada documento representa UNA actividad
 * capturada para un jornalero, ligada a una orden de compra y a un concepto del
 * catálogo `conceptoActividad`. Se capturan en lote (ver
 * `jornaleroActividadesController.crearActividades`), de forma que un jornalero
 * puede tener N actividades registradas por día.
 */
const JornaleroActividadesSchema = new Schema(
  {
    jornalero: {
      type: Schema.Types.ObjectId,
      ref: "jornaleros",
      required: true,
      index: true,
    },
    ordenCompra: {
      type: Schema.Types.ObjectId,
      ref: "ordenCompra",
      required: true,
      index: true,
    },
    actividad: {
      type: Schema.Types.ObjectId,
      ref: "conceptoActividad",
      required: true,
    },
    cantidad: {
      type: Number,
      default: 0,
      required: true,
    },
    // Monto que gana el jornalero por esta línea. Se calcula en el servidor:
    // `cantidad × tarifa(actividad, tipoSilla de la orden de compra)`.
    salarioJornalero: {
      type: Number,
      default: 0,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    modelo: {
      type: String,
      trim: true,
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

export default mongoose.model("jornaleroActividades", JornaleroActividadesSchema);
