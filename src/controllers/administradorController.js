import { sendMailToRecoveryPassword, sendMailToRegister, sendMailToNewAdmin } from "../helpers/sendMail.js"
import Administrador from "../models/Administrador.js"
import Estudiante from "../models/Estudiante.js"
import Historial from "../models/Historial.js"
import { crearTokenJWT } from "../middleware/JWT.js"

const registro = async (req, res) => {
    try {
        // 1. Obtener datos
        const { email, usuario, telefono, direccion } = req.body

        if (!email || !usuario) {
            return res.status(400).json({ msg: "Los campos 'email' y 'usuario' son obligatorios" })
        }

        // 3. Verificar si existe el email
        const verificarEmailBDD = await Administrador.findOne({ email })
        if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" })

        // 4. Generar password y guardar
        const passwordGenerated = "ADM" + Math.random().toString(36).slice(2, 8)

        const nuevoAdministrador = new Administrador({
            usuario,
            email,
            telefono,
            direccion
        })

        nuevoAdministrador.password = await nuevoAdministrador.encryptPassword(passwordGenerated)
        nuevoAdministrador.confirmEmail = true

        // Enviar correo
        await sendMailToNewAdmin(email, passwordGenerated)

        await nuevoAdministrador.save()

        res.status(201).json({ msg: "Administrador creado exitosamente. Las credenciales han sido enviadas a su correo." })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const confirmarMail = async (req, res) => {
    // Paso 1 - Obtener datos
    const { token } = req.params
    // Paso 2 - Validar cuenta
    const administradorBDD = await Administrador.findOne({ token })
    if (!administradorBDD) return res.status(404).json({ msg: "Token invalido o cuenta ya confirmada" })
    // Paso 3 - Desarrollar logica
    administradorBDD.token = null // Se borra token de la base de datos
    administradorBDD.confirmEmail = true // Se confirma la verificacion de email
    await administradorBDD.save()
    // Paso 4 - Enviar la respuesta
    res.status(200).json({ msg: "Cuenta confirmada, ya puedes iniciar sesion" })
}

const recuperarPassword = async (req, res) => {
    try {
        // Paso 1
        const { email } = req.body
        // Paso 2
        if (!email) return res.status(400).json({ msg: "Debes ingresar un correo electrónico" })
        const administradorBDD = await Administrador.findOne({ email })
        if (!administradorBDD) return res.status(404).json({ msg: "El usuario no se encuentra registrado" })
        // Paso 3
        const token = administradorBDD.createToken()
        administradorBDD.token = token
        // correo
        await sendMailToRecoveryPassword(email, token)
        await administradorBDD.save()
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
        const administradorBDD = await Administrador.findOne({ token })
        if (administradorBDD?.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
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
        const administradorBDD = await Administrador.findOne({ token })
        if (!administradorBDD) return res.status(404).json({ msg: "No se puede validar la cuenta" })
        // Paso 3 - Encriptar y borrar token
        administradorBDD.token = null
        administradorBDD.password = await administradorBDD.encryptPassword(password)
        await administradorBDD.save()
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
        const administradorBDD = await Administrador.findOne({ email }).select("-status -__v -token -updatedAt -createdAt")
        if (!administradorBDD) return res.status(404).json({ msg: "El usuario no se encuentra registrado" })
        if (!administradorBDD.confirmEmail) return res.status(403).json({ msg: "Debes verificar tu cuenta antes de iniciar sesión" })
        const verificarPassword = await administradorBDD.matchPassword(password)
        if (!verificarPassword) return res.status(401).json({ msg: "El password no es correcto" })

        const rol = "administrador"
        const token = crearTokenJWT(administradorBDD._id, rol)

        const { usuario, _id } = administradorBDD
        res.status(200).json({
            token,
            rol,
            usuario,
            _id,
            email: administradorBDD.email
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const listarAdministradores = async (req, res) => {
    try {
        const administradores = await Administrador.find().select("-password -token -status -__v");
        res.json(administradores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al listar administradores" });
    }
};

const actualizarAdministrador = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, usuario, telefono, direccion } = req.body;

        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debes llenar todos los campos" });

        const adminBDD = await Administrador.findById(id);
        if (!adminBDD) return res.status(404).json({ msg: "Administrador no encontrado" });

        if (email !== adminBDD.email) {
            const emailExiste = await Administrador.findOne({ email });
            if (emailExiste) return res.status(400).json({ msg: "El email ya está registrado" });
        }

        const adminActualizado = await Administrador.findByIdAndUpdate(id, {
            usuario, email, telefono, direccion
        }, { new: true }).select("-password -token");

        res.json({ msg: "Administrador actualizado correctamente", admin: adminActualizado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar administrador" });
    }
};

const eliminarAdministrador = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.adminHeader._id.toString() === id) return res.status(400).json({ msg: "No puedes eliminar tu propia cuenta" });
        await Administrador.findByIdAndDelete(id);
        res.json({ msg: "Administrador eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar administrador" });
    }
};

const obtenerEstadisticas = async (req, res) => {
    try {
        const totalEstudiantes = await Estudiante.countDocuments();
        const totalAdministradores = await Administrador.countDocuments();

        // Comida más consultada (Top 5 para gráfico)
        const topComidas = await Historial.aggregate([
            { $group: { _id: "$nombreComida", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const comidaMasConsultada = topComidas.length > 0 ? topComidas[0] : null;

        res.json({
            totalEstudiantes,
            totalAdministradores,
            comidaMasConsultada: comidaMasConsultada ? {
                nombre: comidaMasConsultada._id,
                consultas: comidaMasConsultada.count
            } : "No hay datos de historial",
            graficos: {
                comidasPopulares: topComidas.map(c => ({ name: c._id, consultas: c.count })),
                distribucionUsuarios: [
                    { name: "Estudiantes", value: totalEstudiantes },
                    { name: "Administradores", value: totalAdministradores }
                ]
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener estadísticas" });
    }
};



export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login,
    listarAdministradores,
    actualizarAdministrador,
    eliminarAdministrador,
    obtenerEstadisticas
}