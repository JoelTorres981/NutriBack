import app from '../src/server.js';
import connection from '../src/database.js';

connection();

// Adaptador Serverless: Conecta a la DB antes de procesar la solicitud
export default async function handler(req, res) {
    await connection();
    app(req, res);
}
