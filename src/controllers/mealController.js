// src/controllers/mealController.js

import { default as fetch } from 'node-fetch';
import { translate } from 'google-translate-api-x';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

// Helper: Translate text to Spanish
const translateText = async (text) => {
    if (!text) return '';
    try {
        const res = await translate(text, { to: 'es' });
        return res.text;
    } catch (error) {
        console.error("Translation error:", error);
        return text; // Return original if translation fails
    }
};

// Función auxiliar para manejar la obtención de datos y errores
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error("Error fetching data from TheMealDB:", error);
        throw error;
    }
};

/**
 * @desc Obtiene una comida aleatoria de TheMealDB
 * @route GET /api/meals/random
 * @access Public
 */
const getRandomMeal = async (req, res) => {
    try {
        const data = await fetchData(`${BASE_URL}random.php`);

        if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];

            const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
                .map(i => ({
                    ingredient: meal[`strIngredient${i}`],
                    measure: meal[`strMeasure${i}`]
                }))
                .filter(item => item.ingredient && item.ingredient.trim() !== '');

            // Translate fields
            const [nameEs, categoryEs, instructionsEs] = await Promise.all([
                translateText(meal.strMeal),
                translateText(meal.strCategory),
                translateText(meal.strInstructions)
            ]);

            const simplifiedMeal = {
                id: meal.idMeal,
                name: nameEs,
                category: categoryEs,
                area: meal.strArea, // Area names usually stay as is or translate weirdly
                instructions: instructionsEs,
                thumbnail: meal.strMealThumb,
                youtube: meal.strYoutube,
                source: meal.strSource,
                ingredients: ingredients // Keeping ingredients in EN for now or translate loop if fast
            };

            res.status(200).json(simplifiedMeal);
        } else {
            res.status(404).json({ message: "No se encontró una comida aleatoria." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la comida aleatoria.", error: error.message });
    }
};

/**
 * @desc Busca comidas por nombre desde TheMealDB
 * @route GET /api/meals/search?name=Arrabiata
 * @access Public
 */
const searchMealsByName = async (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ message: "Se requiere un parámetro 'name' para la búsqueda." });
    }
    try {
        // Translate search query to English first? 
        // Integrating n8n-like logic: Detect language? 
        // For now, let's assume search term might be English or Spanish. 
        // TheMealDB supports mostly English.
        // Let's try to translate the query to English before searching
        const queryEn = (await translate(name, { to: 'en' })).text;

        const data = await fetchData(`${BASE_URL}search.php?s=${encodeURIComponent(queryEn)}`);

        if (data.meals) {
            // Translating a list might be slow. Limit or translate basic info.
            const simplifiedMeals = await Promise.all(data.meals.slice(0, 10).map(async meal => {
                const [nameEs, categoryEs] = await Promise.all([
                    translateText(meal.strMeal),
                    translateText(meal.strCategory)
                ]);
                return {
                    id: meal.idMeal,
                    name: nameEs,
                    category: categoryEs,
                    area: meal.strArea,
                    thumbnail: meal.strMealThumb
                };
            }));
            res.status(200).json(simplifiedMeals);
        } else {
            res.status(404).json({ message: `No se encontraron comidas con el nombre "${name}".` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al buscar comidas por nombre.", error: error.message });
    }
};

/**
 * @desc Obtiene el detalle de una comida por ID
 * @route GET /api/meals/detail/:id
 * @access Public
 */
const getMealById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Se requiere un ID para buscar." });
    }
    try {
        const data = await fetchData(`${BASE_URL}lookup.php?i=${id}`);

        if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];

            // Translate MAIN fields
            const [nameEs, categoryEs, instructionsEs, areaEs] = await Promise.all([
                translateText(meal.strMeal),
                translateText(meal.strCategory),
                translateText(meal.strInstructions),
                translateText(meal.strArea)
            ]);

            // Extract and Translate ingredients
            const ingredientsRaw = Array.from({ length: 20 }, (_, i) => i + 1)
                .map(i => ({
                    ingredient: meal[`strIngredient${i}`],
                    measure: meal[`strMeasure${i}`]
                }))
                .filter(item => item.ingredient && item.ingredient.trim() !== '');

            const ingredients = await Promise.all(ingredientsRaw.map(async (item) => ({
                ingredient: await translateText(item.ingredient),
                measure: await translateText(item.measure)
            })));

            const fullMeal = {
                id: meal.idMeal,
                name: nameEs,
                category: categoryEs,
                area: areaEs,
                instructions: instructionsEs,
                thumbnail: meal.strMealThumb,
                tags: meal.strTags ? meal.strTags.split(',') : [],
                youtube: meal.strYoutube,
                source: meal.strSource,
                ingredients: ingredients
            };

            res.status(200).json(fullMeal);
        } else {
            res.status(404).json({ message: `No se encontró comida con el ID "${id}".` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el detalle de la comida.", error: error.message });
    }
}

// Exportar las funciones para ES Modules
export {
    getRandomMeal,
    searchMealsByName,
    getMealById
};