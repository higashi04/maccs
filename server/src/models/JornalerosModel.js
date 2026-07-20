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
    prestamos: [{
        fecha: Date,
        cantidad: {
            type: Number,
            default: 0,
            required: true
        },
        createdBy: String,
        updatedBy: String
    }],
    prestamosPagados: [
        {
            fecha: Date,
            cantidad: {
                type: Number,
                default: 0,
                required: true
            },
            createdBy: String,
            pagadoBy: String,
            fechaPago: Date
        }
    ],
    createdBy: String,
}, {
    timestamps: true
});

export default mongoose.model('jornaleros', JornalerosSchema)