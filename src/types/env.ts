import { SignOptions } from 'jsonwebtoken';

// 環境變數類型定義
export type EnvConfig = {
  PORT: string;
  MONGO_URI: string;
  GEMINI_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: SignOptions['expiresIn'];
  PICTURE_TOKEN: string;
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  GOOGLE_GEOCODING_API_KEY: string;
  CORS_MAIN: string;
  CORS_DEV: string;
  CORS_QA: string;
  CORS_DEMO: string;
  CORS_LOCALHOST1: string;
  CORS_LOCALHOST2: string;
};
