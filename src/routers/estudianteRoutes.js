import {Router} from 'express'
import { actualizarPerfil,comprobarTokenPassword, confirmarMail, crearNuevoPassword,login,registrarDatosPersonales,perfil, recuperarPassword, registro } 
from '../controllers/estudianteController.js'
import { verificarTokenJWT } from '../middleware/JWT.js'

const router = Router()


router.post('/registro',registro)
router.get('/confirmar/:token',confirmarMail)

router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)

router.post('/estudiante/login',login)
router.get('/estudiante/perfil',verificarTokenJWT,perfil)

router.post('/estudiante/personalData/:id', verificarTokenJWT , registrarDatosPersonales)
router.put('/actualizarperfil/:id',verificarTokenJWT,actualizarPerfil)

export default router