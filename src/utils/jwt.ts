// JWT 工具函式：產生與驗證 Token
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserPayload } from '../types/express';
export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): UserPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return decoded as UserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      throw { statusCode: 401, message: '無效的憑證或憑證已過期，請重新登入' };
    }
    throw error;
  }
};
