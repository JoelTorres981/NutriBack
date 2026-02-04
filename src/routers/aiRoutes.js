import express from 'express';
import { scanFood, getHistorial, generarPlanificacion, obtenerPlanificaciones, eliminarPlanificacion } from '../controllers/aiController.js';
import { verificarTokenJWT } from '../middleware/JWT.js';

const router = express.Router();

router.post('/scan', verificarTokenJWT, scanFood);
router.get('/historial', verificarTokenJWT, getHistorial);

// Rutas de planificación
router.post('/plan', verificarTokenJWT, generarPlanificacion);
router.get('/plan', verificarTokenJWT, obtenerPlanificaciones);
router.delete('/plan/:id', verificarTokenJWT, eliminarPlanificacion);

export default router;
