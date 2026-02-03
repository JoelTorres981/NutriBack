// src/routers/mealRoutes.js

import express from 'express';
const router = express.Router();
// Importar las funciones del controlador usando desestructuración para ES Modules
import { getRandomMeal, searchMealsByName, getMealById } from '../controllers/mealController.js'; // <- Importación correcta con .js

// Define las rutas y las enlaza con las funciones del controlador
router.get('/random', getRandomMeal);

router.get('/search', searchMealsByName);

router.get('/detail/:id', getMealById);

// Exportar el router para ES Modules
export default router;