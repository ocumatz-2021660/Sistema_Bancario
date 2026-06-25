import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { dbPostgresConnection } from './dbPostgres.js';
import { setupSwagger } from './swagger.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';
import { initInteresJob } from '../jobs/interest.job.js';

import acountRoutes from '../src/account/account.routes.js';
import requestAccountsRoutes from '../src/request_accounts/request_accounts.routes.js';
import transactionRoutes from '../src/transactions/transaction.routes.js';
import withdrawalsRoutes from '../src/withdrawals/withdrawals.routes.js';
import depositRoutes from '../src/deposit/deposit.routes.js';
import favoriteRoutes from '../src/favorite_account/favorite_account.routes.js';
import currencyRoutes from '../src/currency/currency.routes.js';

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
  app.use(`${BASE_PATH}/cuentas`, acountRoutes);
  app.use(`${BASE_PATH}/request_accounts`, requestAccountsRoutes);
  app.use(`${BASE_PATH}/transactions`, transactionRoutes);
  app.use(`${BASE_PATH}/withdrawals`, withdrawalsRoutes);
  app.use(`${BASE_PATH}/deposits`, depositRoutes);
  app.use(`${BASE_PATH}/favorite`, favoriteRoutes);
  app.use(`${BASE_PATH}/currency`, currencyRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Proyecto Bancario Account Service',
    });
  });
  setupSwagger(app);
  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.ACCOUNT_PORT || process.env.PORT || 3002;
  app.set('trust proxy', 1);

  try {
    await dbConnection();
    console.log('✅ MongoDB connected successfully');

    await dbPostgresConnection();
    console.log('✅ PostgreSQL connected successfully');

    initInteresJob();

    middlewares(app);
    routes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`💰 Account Service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting Account Service: ${err.message}`);
    process.exit(1);
  }
};
