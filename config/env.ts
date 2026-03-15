import dotenv from 'dotenv';
dotenv.config();

// 環境變數類型定義
type EnvConfig = {
  PORT:string;
  MONGO_URI: string;
  GEMINI_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

export const config: EnvConfig = {
  PORT: process.env.PORT || '3000',
  MONGO_URI: process.env.MONGO_URI || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
};
