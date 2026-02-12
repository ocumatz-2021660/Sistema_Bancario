'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';


import rolRoutes from '../src/roles/rol.routes.js';
import usuarioRoutes from '../src/usuarios/usuario.routes.js';

const app = express();


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.json({ 
        message: '🏦 Sistema Bancario API',
        status: 'active',
        timestamp: new Date(),
        endpoints: {
            roles: '/api/roles',
            usuarios: '/api/usuarios'
        }
    });
});


app.use('/api/roles', rolRoutes);
app.use('/api/usuarios', usuarioRoutes);


app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.path 
    });
});

export default app;