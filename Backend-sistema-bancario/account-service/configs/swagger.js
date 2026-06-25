import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema Bancario - Account Service API',
      version: '1.0.0',
      description: 'API de cuentas, transacciones, depósitos y más',
    },
    servers: [
      {
        url: `http://localhost:${process.env.ACCOUNT_PORT || 3002}/api/v1`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './account-service/src/**/*.routes.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Account Service Swagger docs en http://localhost:${process.env.ACCOUNT_PORT || 3002}/api-docs`);
};
