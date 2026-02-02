import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs-extra';
import Estudiante from "../models/Estudiante.js";
import Historial from "../models/Historial.js";
import { subirImagenCloudinary } from "../helpers/cloudinary.js";


const scanFood = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: "No se ha subido ninguna imagen" });
        }

        let userId = req.estudianteHeader ? req.estudianteHeader._id : req.body.userId;

        let userProfile = {};
        if (userId) {
            const student = await Estudiante.findById(userId);
            if (student) {
                userProfile = {
                    nombre: student.nombre,
                    objetivo: student.objetivo,
                    alergias: student.alergias,
                    preferencias: student.preferencias,
                    sexo: student.sexo,
                    estatura: student.estatura,
                    peso: student.peso,
                    actividad: student.actividadFisica,
                    presupuesto: student.presupuesto,
                    frecuenciaCompra: student.frecuenciaCompra,
                    dieta: student.dieta,
                };
            }
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const imageFile = req.files.image;
        const imagePath = imageFile.tempFilePath;

        // 1. Leer para Gemini
        const fileData = await fs.readFile(imagePath);
        const imageBase64 = fileData.toString('base64');
        const mimeType = imageFile.mimetype;

        // 2. Subir a Cloudinary
        const { secure_url: cloudinaryUrl, public_id: cloudinaryPublicId } = await subirImagenCloudinary(imagePath, "nutri-app/scans");


        const prompt = `
            Actúa como un nutricionista experto. Analiza esta imagen de comida.
            
            1. Identifica qué comida es.
            2. Estima su contenido nutricional aproximado (calorías, carbohidratos, proteínas, grasas, comidaAlternativa).
            5. Estima si este plato se ajusta a un presupuesto: ${userProfile.presupuesto ? userProfile.presupuesto + " (" + (userProfile.frecuenciaCompra || "Mensual") + ")" : "No especificado"}. Si es caro, sugiere una alternativa económica.
            6. Dame una recomendación personalizada para un usuario con este perfil:
               - Nombre: ${userProfile.nombre || "Usuario"}
               - Alergias: ${userProfile.alergias || "Ninguna"}
               - Preferencias: ${userProfile.preferencias || "Ninguna"}
               - Dieta Actual: ${userProfile.dieta || "General"}
               - Objetivo: ${userProfile.objetivo || "Mejorar salud"}
               - Actividad Física: ${userProfile.actividad || "Moderada"}
               - Sexo: ${userProfile.sexo || "No especificado"}
               - Estatura: ${userProfile.estatura || "No especificado"}
               - Peso: ${userProfile.peso || "No especificado"}
               - Presupuesto: ${userProfile.presupuesto || "No especificado"}

            Si la imagen no es comida, responde indicando que no se detectó comida.

            Devuelve la respuesta ESTRICTAMENTE en este formato JSON (sin texto adicional fuera del JSON):
            {
                "NombreComida": "Nombre del plato",
                "nutrientes": {
                    "calorias": "ej. 500 kcal",
                    "carbohidratos": "ej. 40g",
                    "proteinas": "ej. 20g",
                    "grasas": "ej. 15g"
                },
                "comidaAlternativa": "Nombre del plato alternativo",
                "EsComida": true,
                "recomendacion": "Tu recomendación aquí...",
                "analisisCosto": "Análisis de costo y alternativa si aplica"
            }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Limpieza básica del JSON por si el modelo devuelve markdown
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Guardar en historial si existe usuario
        if (userId && data.EsComida) {
            try {
                const nuevoHistorial = new Historial({
                    estudiante: userId,
                    nombreComida: data.NombreComida,
                    calorias: data.nutrientes?.calorias || "N/A",
                    proteinas: data.nutrientes?.proteinas || "N/A",
                    carbohidratos: data.nutrientes?.carbohidratos || "N/A",
                    grasas: data.nutrientes?.grasas || "N/A",
                    recomendacion: data.recomendacion,
                    comidaAlternativa: data.comidaAlternativa,
                    imagenUrl: cloudinaryUrl,
                    publicId: cloudinaryPublicId
                });
                await nuevoHistorial.save();
                // Adjuntar ID del historial a la respuesta por si el frontend lo necesita
                data.historialId = nuevoHistorial._id;
            } catch (saveError) {
                console.error("Error guardando historial:", saveError);

            }
        }

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al procesar la imagen con IA", error: error.message });
    }
};

const getHistorial = async (req, res) => {
    try {
        const userId = req.estudianteHeader._id;
        const { fecha } = req.query;

        let filtro = { estudiante: userId };

        if (fecha) {
            const start = new Date(fecha);
            start.setHours(0, 0, 0, 0);
            const end = new Date(fecha);
            end.setHours(23, 59, 59, 999);
            filtro.fecha = { $gte: start, $lte: end };
        }

        const historial = await Historial.find(filtro).sort({ fecha: -1 });
        res.json(historial);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener historial", error: error.message });
    }
};



export {
    scanFood,
    getHistorial
};
