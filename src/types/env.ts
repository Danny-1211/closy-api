import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';
dotenv.config();

// 環境變數類型定義
type EnvConfig = {
  PORT: string;
  MONGO_URI: string;
  GEMINI_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: SignOptions['expiresIn'];
  PICTURE_TOKEN: string;
};

export const config: EnvConfig = {
  PORT: process.env.PORT || '3000',
  MONGO_URI: process.env.MONGO_URI || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default_fallback_secret',
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
  PICTURE_TOKEN: process.env.PICTURE_TOKEN || '',
};
