import { Schema, model } from 'mongoose';

const historialSchema = new Schema({
    estudiante: {
        type: Schema.Types.ObjectId,
        ref: 'Estudiante',
        required: true
    },
    nombreComida: {
        type: String,
        required: true,
        trim: true
    },
    imagenUrl: {
        type: String,
        default: null
    },
    publicId: {
        type: String,
        default: null
    },
    calorias: {
        type: String,
        default: "N/A"
    },
    proteinas: {
        type: String,
        default: "N/A"
    },
    carbohidratos: {
        type: String,
        default: "N/A"
    },
    grasas: {
        type: String,
        default: "N/A"
    },
    comidaAlternativa: {
        type: String,
        default: ""
    },
    recomendacion: {
        type: String,
        default: ""
    },
    analisisCosto: {
        type: String,
        default: ""
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default model('Historial', historialSchema);
