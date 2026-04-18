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
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
  PICTURE_TOKEN: process.env.PICTURE_TOKEN || '',
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  GOOGLE_GEOCODING_API_KEY: process.env.GOOGLE_GEOCODING_API_KEY || '',
  TEST_PASSWORD: process.env.TEST_PASSWORD || '',
};
