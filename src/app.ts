import express from 'express';
import { config } from './types/env';
import { connectDB } from './config/db';
import { router } from './routes/routerAdmin'
const app = express();
const port = process.env.PORT || config.PORT;

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
