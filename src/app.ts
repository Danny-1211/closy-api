import express from 'express';
import cors from 'cors';
import { config } from './types/env';
import { connectDB } from './config/db';
import { router } from './routes/routerAdmin';
import { corsOptions } from './config/cors';
import { swaggerServe, swaggerSetup } from './config/swagger';

const app = express();
const port = process.env.PORT || config.PORT;

app.use(cors(corsOptions));
app.use('/api-docs', swaggerServe, swaggerSetup);
app.use(express.json());

app.use(router);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log('server is running on port ' + port);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
};

startServer();
