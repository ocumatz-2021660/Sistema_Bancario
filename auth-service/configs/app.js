'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initInteresJob } from '../../account-service/jobs/interest.job.js';
import { dbConnection } from '../configs/db.js';
import { dbConnection as dbMongoConnection } from './dbMongo.js';
// Ensure models are registered before DB sync
import '../src/users/user.model.js';
import '../../auth-service/src/auth/role.model.js';
import '../../account-service/src/transactions/transaction.model.js';
import { requestLimit } from '../../auth-service/middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../../auth-service/middlewares/server-genericError-handler.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../../auth-service/src/users/user.routes.js';
import acountRoutes from '../../account-service/src/account/account.routes.js';
import serviceRoutes from '../../points-service/src/services/service.routes.js';
import requestAccountsRoutes from '../../account-service/src/request_accounts/request_accounts.routes.js';
import transactionRoutes from '../../account-service/src/transactions/transaction.routes.js';
import reddemServicesRoutes from '../../points-service/src/redeem_service/redeem_service.routes.js';
import withdrawalsRoutes from '../../account-service/src/withdrawals/withdrawals.routes.js';
import depositRoutes from '../../account-service/src/deposit/deposit.routes.js';

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
  app.use(`${BASE_PATH}/cuentas`, acountRoutes);
  app.use(`${BASE_PATH}/services`, serviceRoutes);
  app.use(`${BASE_PATH}/redeem_services`, reddemServicesRoutes);
  app.use(`${BASE_PATH}/request_accounts`, requestAccountsRoutes);
  app.use(`${BASE_PATH}/transactions`, transactionRoutes);
  app.use(`${BASE_PATH}/withdrawals`, withdrawalsRoutes);
  app.use(`${BASE_PATH}/deposits`,depositRoutes);


  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Proyecto Bancario Authentication Service',
    });
  });
  // 404 handler (standardized)
  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT;
  app.set('trust proxy', 1);

  try {
    // Conectar PostgreSQL
    await dbConnection();
    console.log('✅ PostgreSQL connected successfully');

    // Conectar MongoDB
    await dbMongoConnection();
    console.log('✅ MongoDB connected successfully');

    // Seed essential data (roles)
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();

    await seedRoles();
    // Seed usuario admin por default
    const { seedAdminUser } = await import('../helpers/admin-seed.js');
    await seedAdminUser();
    initInteresJob();//jobs  
    middlewares(app);
    routes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Proyecto Bancario Auth Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting Proyecto Bancario Auth Server: ${err.message}`);
    process.exit(1);
  }
};