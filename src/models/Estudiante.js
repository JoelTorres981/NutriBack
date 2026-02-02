import { Schema, model } from 'mongoose'
import bcrypt from "bcryptjs"


const estudianteSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    //falto esto
    direccion: {
        type: String,
        trim: true,
        default: null
    },
    celular: {
        type: String,
        trim: true,
        default: null
    },
    fechaNacimiento: {
        type: Date,
        default: null
    },
    estatura: {
        type: Number,
        default: null
    },
    peso: {
        type: Number,
        default: null
    },
    sexo: {
        type: String,
        trim: true,
        default: null
    },
    alergias: {
        type: String,
        trim: true,
        default: null
    },
    preferencias: {
        type: String,
        trim: true,
        default: null
    },
    actividadFisica: {
        type: String,
        trim: true,
        default: null
    },
    dieta: {
        type: String,
        trim: true,
        default: null
    },
    comidasAlDia: {
        type: Number,
        default: null
    },
    // Nuevos campos de Salud
    objetivo: {
        type: String,
        trim: true,
        default: null
    },
    enfermedades: {
        type: String,
        trim: true,
        default: null
    },
    medicamentos: {
        type: String,
        trim: true,
        default: null
    },
    consumoAgua: {
        type: Number,
        default: null
    },
    horasSueno: {
        type: Number,
        default: null
    },
    nivelEstres: {
        type: String,
        trim: true,
        default: null
    },
    // Nuevos campos de Presupuesto
    presupuesto: {
        type: Number,
        default: null
    },
    frecuenciaCompra: {
        type: String,
        trim: true,
        default: null
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: null
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    rol: {
        type: String,
        default: "estudiante"
    }

}, {
    timestamps: true
})


// Método para cifrar el password
estudianteSchema.methods.encryptPassword = async function (password) {
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password, salt)
    return passwordEncryp
}


// Método para verificar si el password es el mismo de la BDD
estudianteSchema.methods.matchPassword = async function (password) {
    const response = await bcrypt.compare(password, this.password)
    return response
}


// Método para crear un token 
estudianteSchema.methods.createToken = function () {
    const tokenGenerado = Math.random().toString(36).slice(2)
    this.token = tokenGenerado
    return tokenGenerado
}


export default model('Estudiante', estudianteSchema)