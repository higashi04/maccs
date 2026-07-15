import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const JornalerosSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    },
    createdBy: String,
}, {
    timestamps: true
});

export default mongoose.model('jornaleros', JornalerosSchema)