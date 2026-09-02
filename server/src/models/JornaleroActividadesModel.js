import mongoose from "mongoose";
const Schema = mongoose.Schema;

const JornaleroActividadesSchema = new Schema({
    jornalero: {
        type: Schema.Types.ObjectId,
        ref: 'jornaleros',
        required: true
    },
    ordenCompra: {
        type: Schema.Types.ObjectId,
        ref: 'ordenCompra',
        required: true,
        index: true
    },
    fecha: Date,
    modelo: String,
    respaldos: {
        type: Number,
        default: 0
    },
    quitarAsientos: {
        type: Number,
        default: 0
    },
    raspar: {
        type: Number,
        default: 0
    },
    carpinteria: {
        type: Number,
        default: 0
    },
    botarClavosYResanar: {
        type: Number,
        default: 0
    },
    pulir: {
        type: Number,
        default: 0
    },
    lijaDeMano: {
        type: Number,
        default: 0
    },
    primeraTinta: {
        type: Number,
        default: 0
    },
    segundaTinta: {
        type: Number,
        default: 0
    },
    terceraTinta: {
        type: Number,
        default: 0
    },
    sellador: {
        type: Number,
        default: 0
    },
    primer: {
        type: Number,
        default: 0
    },
    inicio: {
        type: Number,
        default: 0
    },
    tejidas: {
        type: Number,
        default: 0
    },
    asentada: {
        type: Number,
        default: 0
    },
    laca: {
        type: Number,
        default: 0
    },
    ponerResbalones: {
        type: Number,
        default: 0
    },
    asentarConCarton: {
        type: Number,
        default: 0
    },
    porDia: {
        type: Number,
        default: 0
    },
    porHora: {
        type: Number,
        default: 0
    },
    // prestamos: {
    //     type: Number,
    //     default: 0
    // },
    // prestamosPendientes: {
    //     type: Number,
    //     default: 0
    // },
    // extras: {
    //     type: Number,
    //     default: 0
    // },
    createdBy: String,
}, {
    timestamps: true
    }
);

export default mongoose.model('jornaleroActividades', JornaleroActividadesSchema);