import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PerfilSchema = new Schema({
    nombrePerfil: String,
    modulos: [{
        type: Schema.Types.ObjectId,
        ref: 'modulosMGZ'
    }],
    createdBy: String,
    updatedBy: String
}, {
    timestamps: true,
    collection: 'perfilesMGZ'
});


export default mongoose.model('perfilesMGZ', PerfilSchema);