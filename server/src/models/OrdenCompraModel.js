import mongoose from "mongoose";
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