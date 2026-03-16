import express from 'express';
import { config } from './config/env';
import { connectDB } from './utils/db';
const app = express();
const port = process.env.PORT || config.PORT;
app.use(express.json());

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
