import { LoginAttempt } from '../src/loginAttempts/loginAttempt.model.js';

// Configuración del bloqueo
const MAX_FAILED_ATTEMPTS = 5;          // Intentos 
const BLOCK_DURATION_MINUTES = 1;      // Minutos de bloqueo
const ATTEMPT_WINDOW_MINUTES = 30;      // Ventana de tiempo para contar intentos

/**
 * Verifica si un usuario/IP está actualmente bloqueado.
 * @returns {{ blocked: boolean, minutesLeft: number }}
 */
export const checkIfBlocked = async (identifier, ip) => {
  try {
    const record = await LoginAttempt.findOne({
      identifier: identifier.toLowerCase(),
      ip,
    });

    if (!record || !record.isBlocked) return { blocked: false };

    // Si el bloqueo ya expiró, limpiar y permitir
    if (record.blockedUntil && new Date() > record.blockedUntil) {
      await LoginAttempt.deleteOne({ _id: record._id });
      return { blocked: false };
    }

    const minutesLeft = Math.ceil(
      (record.blockedUntil - new Date()) / (1000 * 60)
    );

    return {
      blocked: true,
      minutesLeft,
      blockedUntil: record.blockedUntil,
    };
  } catch (error) {
    console.error('Error verificando bloqueo:', error.message);
    return { blocked: false }; 
  }
};

/**
 * Registra un intento fallido de login.
 * Si supera MAX_FAILED_ATTEMPTS, bloquea al usuario.
 * @returns {{ blocked: boolean, attemptsLeft: number }}
 */
export const registerFailedAttempt = async (identifier, ip) => {
  try {
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000);

    let record = await LoginAttempt.findOne({
      identifier: identifier.toLowerCase(),
      ip,
      lastFailedAt: { $gte: windowStart },
    });

    if (!record) {
      // Primer intento fallido en esta ventana
      record = new LoginAttempt({
        identifier: identifier.toLowerCase(),
        ip,
        failedAttempts: 1,
        isBlocked: false,
        lastFailedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } else {
      // Incrementar contador
      record.failedAttempts += 1;
      record.lastFailedAt = new Date();
      record.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Bloquear si supera el límite
    if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      record.isBlocked = true;
      record.blockedUntil = new Date(
        Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000
      );
    }

    await record.save();

    const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts);

    return {
      blocked: record.isBlocked,
      attemptsLeft,
      blockedUntil: record.blockedUntil,
    };
  } catch (error) {
    console.error('Error registrando intento fallido:', error.message);
    return { blocked: false, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }
};

/**
 * Limpia los intentos fallidos tras un login exitoso.
 */
export const clearFailedAttempts = async (identifier, ip) => {
  try {
    await LoginAttempt.deleteOne({
      identifier: identifier.toLowerCase(),
      ip,
    });
  } catch (error) {
    console.error('Error limpiando intentos fallidos:', error.message);
  }
};
