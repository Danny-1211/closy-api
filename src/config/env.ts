import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';
import { EnvConfig } from '../types/env';
dotenv.config();

export const config: EnvConfig = {
  PORT: process.env.PORT || '3000',
  MONGO_URI: process.env.MONGO_URI || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default_fallback_secret',
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '14d') as SignOptions['expiresIn'],
  PICTURE_TOKEN: process.env.PICTURE_TOKEN || '',
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  GOOGLE_GEOCODING_API_KEY: process.env.GOOGLE_GEOCODING_API_KEY || '',
  CORS_MAIN: process.env.CORS_MAIN || '',
  CORS_DEV: process.env.CORS_DEV || '',
  CORS_QA: process.env.CORS_QA || '',
  CORS_DEMO: process.env.CORS_DEMO || '',
  CORS_LOCALHOST1: process.env.CORS_LOCALHOST1 || '',
  CORS_LOCALHOST2: process.env.CORS_LOCALHOST2 || '',
};
