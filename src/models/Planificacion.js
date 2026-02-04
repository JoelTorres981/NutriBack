import mongoose from 'mongoose';

const planificacionSchema = new mongoose.Schema({
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    desayuno: {
        hora: { type: String, required: true },
        alimento: { type: String, required: true }
    },
    almuerzo: {
        hora: { type: String, required: true },
        alimento: { type: String, required: true }
    },
    cena: {
        hora: { type: String, required: true },
        alimento: { type: String, required: true }
    }
}, {
    timestamps: true
});

export default mongoose.model('Planificacion', planificacionSchema);
