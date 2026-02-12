export const helmetConfiguration = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  // HSTS desactivado por simplicidad (evita depender de entornos). Activar solo si se requiere.
  hsts: false,
  // Cabeceras básicas y útiles para API
  frameguard: { action: 'deny' },
  noSniff: true,
  hidePoweredBy: true,
  // Compatibilidad con Swagger UI y recursos embebidos
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
};
 
 