import express from 'express';
import { authRouter } from './module/auth';
import { userRouter } from './module/user';
const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
export { router };
