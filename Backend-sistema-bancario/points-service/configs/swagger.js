import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema Bancario - Points Service API',
      version: '1.0.0',
      description: 'API de servicios y canje de puntos',
    },
    servers: [
      {
        url: `http://localhost:${process.env.POINTS_PORT || 3003}/api/v1`,
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
    './points-service/src/**/*.routes.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Points Service Swagger docs en http://localhost:${process.env.POINTS_PORT || 3003}/api-docs`);
};
