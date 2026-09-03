import mongoose from "mongoose";
import { TIPO_SILLA_CODES } from "../constants/tiposSilla.js";
const Schema = mongoose.Schema;

const OrdenCompraSchema = new Schema({
    ordenCompra: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    modeloSillas: {
        type: String,
        required: true
    },
    // Tipo de silla de la hoja del stakeholder (H/D/N/C/S/B). Determina qué
    // tarifa del catálogo de actividades aplica al calcular el salario del jornalero.
    tipoSilla: {
        type: String,
        enum: TIPO_SILLA_CODES,
    },
    cantidadSillas: {
        type: Number,
        default: 0
    },
    MontoEsperado: {
        type: Number,
        default: 0
    },
    createdBy: String,
    updatedBy: String,
},
{
    timestamps: true
});

export default mongoose.model("ordenCompra", OrdenCompraSchema);