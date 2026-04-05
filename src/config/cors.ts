import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://qa-closy-nine.vercel.app',
      'https://closy-api.onrender.com',
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
