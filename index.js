'use strict';

import dotenv from 'dotenv';
import app from './configs/app.js';
import { dbConnection } from './configs/db.js';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

// Función principal
const startServer = async () => {
    try {
        await dbConnection();
        
        app.listen(PORT, () => {
            console.log(` Servidor corriendo en http://localhost:${PORT}`);
            console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(` Iniciado: ${new Date().toLocaleString()}\n`);
        });
    } catch (error) {
        console.error(' Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Ejecutar
startServer();