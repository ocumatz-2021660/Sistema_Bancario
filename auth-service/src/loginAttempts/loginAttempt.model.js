import mongoose from 'mongoose';

/**
 * Modelo MongoDB para rastrear intentos de login fallidos.
 * Se usa MongoDB por su TTL index (auto-elimina documentos expirados)
 * y porque no requiere migraciones como PostgreSQL.
 */
const loginAttemptSchema = new mongoose.Schema(
  {
    // Identificador del usuario (email o username que intentó loguearse)
    identifier: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // IP desde donde se hizo el intento
    ip: {
      type: String,
      required: true,
    },
    // Número de intentos fallidos consecutivos
    failedAttempts: {
      type: Number,
      default: 1,
    },
    // Si la cuenta está bloqueada
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Hasta cuándo está bloqueada (null = no bloqueada)
    blockedUntil: {
      type: Date,
      default: null,
    },
    // Último intento fallido
    lastFailedAt: {
      type: Date,
      default: Date.now,
    },
    // TTL: el documento se elimina automáticamente 24h después de la última actividad
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// Índice TTL — MongoDB elimina el documento automáticamente cuando expira
loginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índice compuesto para buscar por identifier + ip rápidamente
loginAttemptSchema.index({ identifier: 1, ip: 1 });

export const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
