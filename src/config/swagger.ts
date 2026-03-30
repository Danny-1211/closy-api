// src/config/swagger.ts
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const swaggerFilePath = path.resolve(process.cwd(), 'swagger-output.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument);
