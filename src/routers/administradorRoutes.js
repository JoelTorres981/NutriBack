import { Router } from 'express'
import { comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, recuperarPassword, registro, listarAdministradores, actualizarAdministrador, eliminarAdministrador, obtenerEstadisticas, listarEstudiantes }
    from '../controllers/administradorController.js'
import { verificarTokenJWT } from '../middleware/JWT.js'

const router = Router()

router.post('/registro', verificarTokenJWT, registro)
router.get('/confirmar/:token', confirmarMail)

router.post('/recuperarpassword', recuperarPassword)
router.get('/recuperarpassword/:token', comprobarTokenPassword)
router.post('/nuevopassword/:token', crearNuevoPassword)

router.post('/login', login)

router.get('/listar', verificarTokenJWT, listarAdministradores)
router.put('/actualizar/:id', verificarTokenJWT, actualizarAdministrador)
router.delete('/eliminar/:id', verificarTokenJWT, eliminarAdministrador)
router.get('/estadisticas', verificarTokenJWT, obtenerEstadisticas)
router.get('/listar-estudiantes', verificarTokenJWT, listarEstudiantes)

export default router