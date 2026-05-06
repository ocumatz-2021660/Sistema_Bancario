import crypto from 'crypto';

// Generate secure tokens matching .NET TokenGenerator
export const generateEmailVerificationToken = () => {
  return generateSecureToken(32); // 32 bytes = 256 bits
};

export const generatePasswordResetToken = () => {
  return generateSecureToken(32); // 32 bytes = 256 bits
};

// Generate secure token exactly like .NET TokenGenerator
const generateSecureToken = (length) => {
  const bytes = crypto.randomBytes(length);
  return bytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};
