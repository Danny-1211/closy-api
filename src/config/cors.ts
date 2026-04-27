import { CorsOptions } from 'cors';
import { config } from './env';
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      config.CORS_LOCALHOST1,
      config.CORS_LOCALHOST2,
      config.CORS_QA,
      config.CORS_DEV,
      config.CORS_MAIN,
      config.CORS_DEMO
    ];

    // 允許沒有 origin 的請求（例如 Swagger UI、Postman、curl）
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS 不允許此來源: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};

export { corsOptions };
