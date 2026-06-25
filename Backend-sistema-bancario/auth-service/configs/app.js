'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from '../configs/db.js';
import { dbConnection as dbMongoConnection } from './dbMongo.js';
import { setupSwagger } from './swagger.js';
import '../src/users/user.model.js';
import '../src/auth/role.model.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Proyecto Bancario Authentication Service',
    });
  });
  setupSwagger(app);
  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.AUTH_PORT || process.env.PORT || 3001;
  app.set('trust proxy', 1);

  try {
    await dbConnection();
    console.log('✅ PostgreSQL connected successfully');

    await dbMongoConnection();
    console.log('✅ MongoDB connected successfully');

    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();

    const { seedAdminUser } = await import('../helpers/admin-seed.js');
    await seedAdminUser();

    middlewares(app);
    routes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting Auth Service: ${err.message}`);
    process.exit(1);
  }
};