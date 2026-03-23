// swagger.ts (建議放在專案根目錄)
import swaggerAutogen from 'swagger-autogen';
import { config } from '../types/env';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || config.PORT;

const doc = {
  info: {
    title: 'Closy API',
    version: '1.0.0',
    description: 'closy-api dev test document',
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: '本地開發伺服器',
    },
    {
      url: 'https://closy-api.onrender.com',
      description: 'Render dev',
    },
  ],
};

const outputFile = '../../swagger-output.json';
const endpointsFiles = ['./src/app.ts'];


swaggerAutogen(outputFile, endpointsFiles, doc);