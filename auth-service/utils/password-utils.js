import argon2 from 'argon2';
import crypto from 'crypto';
import { config } from '../configs/config.js';

export const hashPassword = async (password) => {
  try {
    // Configuración explícita para compatibilidad con .NET
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 102400, // 100 MB (igual que .NET)
      timeCost: 2, // 2 iteraciones (igual que .NET)
      parallelism: 8, // 8 hilos (igual que .NET)
      hashLength: 32, // 32 bytes de hash (igual que .NET)
      saltLength: 16, // 16 bytes de salt (igual que .NET)
    });
  } catch (error) {
    throw new Error('Error al hashear la contraseña');
  }
};

const verifyDotNetHashManually = async (password, hashedPassword) => {
  try {
    if (!hashedPassword.startsWith('$argon2id$v=19$')) {
      return false;
    }

    const parts = hashedPassword.split('$');
    if (parts.length !== 6) {
      return false;
    }

    // Extraer componentes: $argon2id$v=19$m=102400,t=2,p=8$salt$hash
    const paramsStr = parts[3]; // "m=102400,t=2,p=8"
    const saltB64 = parts[4];
    const expectedHashB64 = parts[5];

    // Parsear parámetros
    const params = {};
    paramsStr.split(',').forEach((param) => {
      const [key, value] = param.split('=');
      params[key] = parseInt(value);
    });

    // Decodificar salt y hash esperado
    const salt = Buffer.from(saltB64, 'base64');
    const expectedHash = Buffer.from(expectedHashB64, 'base64');

    // Generar hash con argon2 usando los parámetros extraídos
    const computedHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: params.m || 102400,
      timeCost: params.t || 2,
      parallelism: params.p || 8,
      salt: salt,
      hashLength: expectedHash.length,
      raw: true, // Obtener hash raw (Buffer) para comparar
    });

    // Comparar hashes usando timing-safe comparison
    const isMatch = crypto.timingSafeEqual(expectedHash, computedHash);
    return isMatch;
  } catch (error) {
    return false;
  }
};

const fromBase64UrlSafe = (base64url) => {
  return base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), '=');
};

const convertDotNetHashToNodeFormat = (hash) => {
  try {
    // El hash de Argon2 tiene el formato: $argon2id$v=19$m=102400,t=2,p=8$<salt>$<hash>
    const parts = hash.split('$');
    if (parts.length !== 6) {
      return hash; // No es el formato esperado, devolver tal como está
    }

    const [, algorithm, version, params, salt, hashPart] = parts;

    // Parsear los parámetros
    const paramParts = params.split(',');
    let memory = 102400,
      time = 2,
      parallel = 8;

    paramParts.forEach((param) => {
      if (param.startsWith('m=')) {
        memory = parseInt(param.substring(2));
      } else if (param.startsWith('t=')) {
        time = parseInt(param.substring(2));
      } else if (param.startsWith('p=')) {
        parallel = parseInt(param.substring(2));
      }
    });

    // Formatear parámetros para Node.js (solo usa 'm' para memory)
    const nodeParams = `m=${memory},t=${time},p=${parallel}`;

    // Salt y hash ya están en formato Base64 estándar desde .NET
    return `$${algorithm}$${version}$${nodeParams}$${salt}$${hashPart}`;
  } catch (error) {
    return hash;
  }
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    // Primero intentar verificación directa con argon2 (formato Node.js nativo)
    try {
      const result = await argon2.verify(hashedPassword, plainPassword);
      if (result) return true;
    } catch (directError) {
      // Continue to manual verification
    }

    // Si es un hash de .NET, usar verificación manual
    if (hashedPassword.startsWith('$argon2id$v=19$')) {
      const manualResult = await verifyDotNetHashManually(
        plainPassword,
        hashedPassword
      );
      if (manualResult) return true;
    }

    return false;
  } catch (error) {
    console.error('Password verification error:', error.message);
    return false;
  }
};

export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < config.security.passwordMinLength) {
    errors.push(
      `La contraseña debe tener al menos ${config.security.passwordMinLength} caracteres`
    );
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
