import mongoose from 'mongoose';
import { config } from '../config/env';

const connectDB = async (): Promise<void> => {
  await mongoose.connect(config.MONGO_URI);
};

export { connectDB };
