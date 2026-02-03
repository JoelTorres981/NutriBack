// src/index.js

import app from './server.js';
import connection from './database.js';
import http from 'http';
import { Server } from 'socket.io';

connection();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*", // Permite configurar el origen en producción o usar * por defecto
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Usuario conectado al chat:', socket.id);

    socket.on('chat_message', (data) => {
        // data esperada: { user: "Nombre", message: "Hola", time: "10:00 AM" }
        io.emit('chat_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

server.listen(app.get('port'), () => {
    console.log(`Server & Socket.io running on http://localhost:${app.get('port')}`);
});
