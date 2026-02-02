import express from 'express';
import { scanFood, getHistorial } from '../controllers/aiController.js';
import { verificarTokenJWT } from '../middleware/JWT.js';

const router = express.Router();

router.post('/scan', verificarTokenJWT, scanFood);
router.get('/historial', verificarTokenJWT, getHistorial);

export default router;
