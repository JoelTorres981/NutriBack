import { sendMailToRecoveryPassword, sendMailToRegister } from "../helpers/sendMail.js"
import Estudiante from "../models/Estudiante.js"
import { crearTokenJWT } from "../middleware/JWT.js"
import mongoose from "mongoose"

const registro = async (req, res) => {
    try {
        //Paso 1
        const { email, password } = req.body
        //Paso 2
        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Los sentimos, debes llenar todos lso campos" })
        const verificarEmailBDD = await Estudiante.findOne({ email })
        if (verificarEmailBDD) return res.status(400).json(({ msg: "Lo sentimos, el email ya se encuentra registrado" }))
        //Paso 3
        const nuevoEstudiante = new Estudiante(req.body)
        nuevoEstudiante.password = await nuevoEstudiante.encryptPassword(password)
        const token = nuevoEstudiante.createToken()
        await sendMailToRegister(email, token)
        await nuevoEstudiante.save()
        //Paso 4
        res.status(201).json({ msg: "Revisa tu correo electronico para confirmar tu cuenta" })
    }
    catch (error) {
        res.status(500).json({ msg: `❌Error en el servidor -${error}` })
    }
}

const confirmarMail = async (req, res) => {
    // Paso 1 - Obtener datos
    const { token /* la palabra es reservada de la parte de routes (escribir igual) */ } = req.params
    // Paso 2 - Validar cuenta
    const estudianteBDD = await Estudiante.findOne({ token })
    if (!estudianteBDD) return res.status(404).json({ msg: "Token invalido o cuenta ya confirmada" })
    // Paso 3 - Desarrollar logica
    estudianteBDD.token = null // Se borra token de la base de datos
    estudianteBDD.confirmEmail = true // Se confirma la verificacion de email
    await estudianteBDD.save()
    // Paso 4 - Enviar la respuesta
    res.status(200).json({ msg: "Cuenta confirmada, ya puedes iniciar sesion" })
}

const recuperarPassword = async (req, res) => {
    try {
        // Paso 1
        const { email } = req.body
        // Paso 2
        if (!email) return res.status(400).json({ msg: "Debes ingresar un correo electrónico" })
        const estudianteBDD = await Estudiante.findOne({ email })
        if (!estudianteBDD) return res.status(404).json({ msg: "El usuario no se encuentra registrado" })
        // Paso 3
        const token = estudianteBDD.createToken()
        estudianteBDD.token = token
        // correo
        await sendMailToRecoveryPassword(email, token)
        await estudianteBDD.save()
        // Paso 4
        res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const comprobarTokenPassword = async (req, res) => {
    try {
        // Paso 1
        const { token } = req.params
        // Paso 2
        const estudianteBDD = await Estudiante.findOne({ token })
        if (estudianteBDD?.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
        // Paso 3
        // veterinarioBDD?.token = null
        // Paso 4 - Mostrar mensaje de respuesta
        res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const crearNuevoPassword = async (req, res) => {

    try {
        // Paso 1
        const { password, confirmpassword } = req.body
        const { token } = req.params
        // Paso 2 - Validaciones
        if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Debes llenar todos los campos" })
        if (password !== confirmpassword) return res.status(404).json({ msg: "Los passwords no coinciden" })
        const estudianteBDD = await Estudiante.findOne({ token })
        if (!estudianteBDD) return res.status(404).json({ msg: "No se puede validar la cuenta" })
        // Paso 3 - Encriptar y borrar token
        estudianteBDD.token = null
        estudianteBDD.password = await estudianteBDD.encryptPassword(password)
        await estudianteBDD.save()
        // Paso 4 - Mensaje
        res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const login = async (req, res) => {

    try {
        const { email, password } = req.body
        if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Debes llenar todos los campos" })
        const estudianteBDD = await Estudiante.findOne({ email }).select("-status -__v -token -updatedAt -createdAt")
        if (!estudianteBDD) return res.status(404).json({ msg: "El usuario no se encuentra registrado" })
        if (!estudianteBDD.confirmEmail) return res.status(403).json({ msg: "Debes verificar tu cuenta antes de iniciar sesión" })
        const verificarPassword = await estudianteBDD.matchPassword(password)
        if (!verificarPassword) return res.status(401).json({ msg: "El password no es correcto" })
        const { nombre, apellido, direccion, celular, _id, rol } = estudianteBDD;
        const token = crearTokenJWT(estudianteBDD._id, estudianteBDD.rol);

        res.status(200).json({
            token,
            rol,
            nombre,
            apellido,
            direccion,
            celular,
            _id,
            email: estudianteBDD.email
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const registrarDatosPersonales = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fechaNacimiento,
            estatura,
            peso,
            alergias,
            preferencias,
            sexo,
            actividadFisica,
            dieta,
            comidasAlDia,
            objetivo,
            enfermedades,
            medicamentos,
            consumoAgua,
            horasSueno,
            nivelEstres,
            presupuesto,
            frecuenciaCompra
        } = req.body;

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: `ID inválido` });

        const estudianteBDD = await Estudiante.findById(id);
        if (!estudianteBDD) return res.status(404).json({ msg: `Usuario no encontrado` });

        // Actualizar solo los campos de datos personales
        estudianteBDD.fechaNacimiento = fechaNacimiento || estudianteBDD.fechaNacimiento;
        estudianteBDD.estatura = estatura || estudianteBDD.estatura;
        estudianteBDD.peso = peso || estudianteBDD.peso;
        estudianteBDD.alergias = alergias || estudianteBDD.alergias;
        estudianteBDD.preferencias = preferencias || estudianteBDD.preferencias;
        estudianteBDD.sexo = sexo || estudianteBDD.sexo;
        estudianteBDD.actividadFisica = actividadFisica || estudianteBDD.actividadFisica;
        estudianteBDD.dieta = dieta || estudianteBDD.dieta;
        estudianteBDD.comidasAlDia = comidasAlDia || estudianteBDD.comidasAlDia;
        estudianteBDD.objetivo = objetivo || estudianteBDD.objetivo;
        estudianteBDD.enfermedades = enfermedades || estudianteBDD.enfermedades;
        estudianteBDD.medicamentos = medicamentos || estudianteBDD.medicamentos;
        estudianteBDD.consumoAgua = consumoAgua || estudianteBDD.consumoAgua;
        estudianteBDD.horasSueno = horasSueno || estudianteBDD.horasSueno;
        estudianteBDD.nivelEstres = nivelEstres || estudianteBDD.nivelEstres;
        estudianteBDD.presupuesto = presupuesto || estudianteBDD.presupuesto;
        estudianteBDD.frecuenciaCompra = frecuenciaCompra || estudianteBDD.frecuenciaCompra;

        await estudianteBDD.save();

        res.status(200).json({ msg: "Datos personales registrados exitosamente", data: estudianteBDD });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` });
    }
};

const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.estudianteHeader
    res.status(200).json(datosPerfil)
}

const actualizarPerfil = async (req, res) => {

    try {
        const { id } = req.params
        const { nombre, apellido, celular, email,
            fechaNacimiento, estatura, peso,
            alergias, preferencias, sexo,
            actividadFisica, dieta,
            comidasAlDia, objetivo, enfermedades,
            medicamentos, consumoAgua, horasSueno,
            nivelEstres, presupuesto, frecuenciaCompra
        } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: `ID inválido: ${id}` })
        const estudianteBDD = await Estudiante.findById(id)
        if (!estudianteBDD) return res.status(404).json({ msg: `No existe el estudiante con ID ${id}` })
        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debes llenar todos los campos" })
        if (estudianteBDD.email !== email) {
            const emailExistente = await Estudiante.findOne({ email })
            if (emailExistente) {
                return res.status(404).json({ msg: `El email ya se encuentra registrado` })
            }
        }
        estudianteBDD.nombre = nombre ?? estudianteBDD.nombre
        estudianteBDD.apellido = apellido ?? estudianteBDD.apellido
        estudianteBDD.celular = celular ?? estudianteBDD.celular
        estudianteBDD.email = email ?? estudianteBDD.email
        estudianteBDD.fechaNacimiento = fechaNacimiento ?? estudianteBDD.fechaNacimiento
        estudianteBDD.estatura = estatura ?? estudianteBDD.estatura
        estudianteBDD.peso = peso ?? estudianteBDD.peso
        estudianteBDD.sexo = sexo ?? estudianteBDD.sexo
        estudianteBDD.alergias = alergias ?? estudianteBDD.alergias
        estudianteBDD.preferencias = preferencias ?? estudianteBDD.preferencias
        estudianteBDD.actividadFisica = actividadFisica ?? estudianteBDD.actividadFisica
        estudianteBDD.dieta = dieta ?? estudianteBDD.dieta
        estudianteBDD.comidasAlDia = comidasAlDia ?? estudianteBDD.comidasAlDia
        estudianteBDD.objetivo = objetivo ?? estudianteBDD.objetivo
        estudianteBDD.enfermedades = enfermedades ?? estudianteBDD.enfermedades
        estudianteBDD.medicamentos = medicamentos ?? estudianteBDD.medicamentos
        estudianteBDD.consumoAgua = consumoAgua ?? estudianteBDD.consumoAgua
        estudianteBDD.horasSueno = horasSueno ?? estudianteBDD.horasSueno
        estudianteBDD.nivelEstres = nivelEstres ?? estudianteBDD.nivelEstres
        estudianteBDD.presupuesto = presupuesto ?? estudianteBDD.presupuesto
        estudianteBDD.frecuenciaCompra = frecuenciaCompra ?? estudianteBDD.frecuenciaCompra

        await estudianteBDD.save()
        res.status(200).json(estudianteBDD)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    registrarDatosPersonales,
    login,
    perfil,
    actualizarPerfil
}
