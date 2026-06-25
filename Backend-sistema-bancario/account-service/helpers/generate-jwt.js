import jwt from 'jsonwebtoken';
import { config } from '../configs/config.js';

export const generateJWT = (userId, extraClaims = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: String(userId),
      ...extraClaims,
    };
    jwt.sign(payload, config.jwt.secret, {
      expiresIn: options.expiresIn || config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });
};

export const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};
