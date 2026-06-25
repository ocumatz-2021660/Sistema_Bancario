import { randomBytes } from 'crypto';

export const generateShortUUID = () => {
  const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const bytes = randomBytes(12);
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
};

export const generateUserId = () => {
  return `usr_${generateShortUUID()}`;
};
