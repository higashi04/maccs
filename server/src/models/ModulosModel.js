import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ModulosSchema = new Schema({
    nombreModulo: String,
    ruta: String,
    componente: String,
    icono: String,
    createdBy: String,
    updatedBy: String
}, {
    timestamps: true,
    collection: 'modulosMGZ'
});

export default mongoose.model('modulosMGZ', ModulosSchema);