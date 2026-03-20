// 產生 JWT Token
import jwt from 'jsonwebtoken';
import { config } from '../types/env';

export const signToken = (userId: string) => {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET);
};
