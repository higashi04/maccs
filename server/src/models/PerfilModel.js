import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sanitizeModulos = (modulos) => {
    if (!Array.isArray(modulos)) {
        return [];
    }

    return modulos.filter((modulo) => {
        if (modulo === null || modulo === undefined) {
            return false;
        }

        if (typeof modulo === 'string') {
            return modulo.trim() !== '';
        }

        if (typeof modulo === 'object' && modulo.deleted === true) {
            return false;
        }

        return true;
    });
};

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

PerfilSchema.path('modulos').set(function (value) {
    return sanitizeModulos(value);
});

PerfilSchema.pre('save', function (next) {
    if (this.isModified('modulos')) {
        this.modulos = sanitizeModulos(this.modulos);
    }
    next();
});

export default mongoose.model('perfilesMGZ', PerfilSchema);