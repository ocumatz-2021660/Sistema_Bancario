import rateLimit from 'express-rate-limit';
import { config } from '../configs/config.js';

// Rate limiter general para la API
export const requestLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

// Rate limiter específico para endpoints de autenticación
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMaxRequests,
  message: {
    success: false,
    message:
      'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
    retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message:
        'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
      retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000),
    });
  },
});

// Rate limiter para email endpoints (más restrictivo pero más razonable)
export const emailRateLimit = rateLimit({
  windowMs: config.rateLimit.emailWindowMs, // 15 minutos
  max: config.rateLimit.emailMaxRequests, // máximo 3 emails por 15 minutos
  message: {
    success: false,
    message: 'Demasiados emails enviados, intenta de nuevo en 15 minutos.',
    retryAfter: Math.ceil(config.rateLimit.emailWindowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Email rate limit exceeded for: ${req.body.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Demasiados emails enviados, intenta de nuevo en 15 minutos.',
      retryAfter: Math.ceil(config.rateLimit.emailWindowMs / 1000),
    });
  },
});
