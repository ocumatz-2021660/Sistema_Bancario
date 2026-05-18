import { randomUUID } from 'crypto';

/**
 * Middleware global para el manejo de errores
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err);
  const traceId = err.traceId || randomUUID();
  const timestamp = new Date().toISOString();
  const errorCode = err.errorCode || null;

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      success: false,
      message: `El ${field} '${value}' ya está en uso`,
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de multer (archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de conexión a base de datos
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error personalizado con status
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Error del servidor',
      errorCode: err.errorCode || null,
      traceId,
      timestamp,
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    errorCode,
    traceId,
    timestamp,
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFound = (req, res) => {
  const traceId = randomUUID();
  const timestamp = new Date().toISOString();
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    errorCode: null,
    traceId,
    timestamp,
  });
};

/**
 * Wrapper para manejar errores en funciones asíncronas
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
