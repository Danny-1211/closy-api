import express from 'express';
import { authRouter } from './module/auth';
import { userRouter } from './module/user';
import { clothesRouter } from './module/clothes'
const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/clothes', clothesRouter);

export { router };
