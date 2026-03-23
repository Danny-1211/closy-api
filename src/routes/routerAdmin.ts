import express from 'express';
import { authRouter } from './module/auth';

const router = express.Router();

router.use('/auth', authRouter);
export { router };
