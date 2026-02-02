// src/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mealRoutes from './routers/mealRoutes.js';
import routerEstudiante from './routers/estudianteRoutes.js';
import routerAdministrador from './routers/administradorRoutes.js';
import aiRoutes from './routers/aiRoutes.js';
import fileUpload from 'express-fileupload';
import cloudinary from 'cloudinary'
import os from 'os';

// Inicializaciones
const app = express();
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


// Middlewares
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: os.tmpdir()
}));
app.use(cors());

// Variables globales
app.set('port', process.env.PORT || 3000); // Define el puerto del servidor

// Monta las rutas de comidas bajo el prefijo /api/meals
app.use('/api/meals', mealRoutes);

app.get('/', (req, res) => {
    res.send('Servidor de Recetas TheMealDB funcionando. Prueba /api/meals/random o /api/meals/search?name=chicken');
});

app.get('/', (req, res) => res.send("Server on"))

// Rutas para Estudiante
app.use('/api', routerEstudiante)

// Rutas para Administrador
app.use('/api/admin', routerAdministrador);

// Rutas para AI
app.use('/api/ai', aiRoutes);

// Manejo de una ruta que no sea encontrada
app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"))

// Exportar la instancia de express por medio de app
export default app;