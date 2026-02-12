'use strict';
//metodos defaul
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
//traemos el metodo de conexion a la base de datos. se exporta con llaves (desestructuracion)
import { dbConnection } from './db.js';
//traemos la configuracion de cors y helmet
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';

import fieldRoutes from '../src/fields/field.routes.js';

//en cada enpoints agregamos esta url
const BASE_PATH = '/kinalSportsAdmin/v1';

//configuracion del servidor
const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    //mensajes en peticiones
    app.use(morgan('dev'))
}

//configuracion de rutas
const routes = (app) => {

    app.use(`${BASE_PATH}/fields`, fieldRoutes);
    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'KinalSports Admin Server',
        })
    })
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint not found',
        })
    })
}

export const initServer = async () => {
    //creamos el servidor
    const app = express(); //crea el servidor xd

    //variable de entorno puerto
    const PORT = process.env.PORT;
    app.set('trus proxy', 1);
    
    try {
        //metodo asincrono
        await dbConnection();
        middlewares(app);
        routes(app);
        //nos muestra en donde esat en ejecucion el servidor
        app.listen(PORT, () =>{
            console.log(`Admin server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/Health`);            
        });

    } catch (error) {
        console.log(`Error starting admin server: ${error.message}`);
        //finaliza el servidor
        process.exit(1);
    }

}