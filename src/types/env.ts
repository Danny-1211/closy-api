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
  TEST_PASSWORD: string;
};
