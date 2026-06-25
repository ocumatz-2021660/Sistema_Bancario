import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { setupSwagger } from './swagger.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';

import serviceRoutes from '../src/services/service.routes.js';
import reddemServicesRoutes from '../src/redeem_service/redeem_service.routes.js';

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
  app.use(`${BASE_PATH}/services`, serviceRoutes);
  app.use(`${BASE_PATH}/redeem_services`, reddemServicesRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Proyecto Bancario Points Service',
    });
  });
  setupSwagger(app);
  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.POINTS_PORT || process.env.PORT || 3003;
  app.set('trust proxy', 1);

  try {
    await dbConnection();
    console.log('✅ MongoDB connected successfully');

    middlewares(app);
    routes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`⭐ Points Service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting Points Service: ${err.message}`);
    process.exit(1);
  }
};
