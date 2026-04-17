import express from 'express';
import { authRouter } from './module/auth';
import { userRouter } from './module/user';
import { processRouter } from './module/process';
import { homeRouter } from './module/home';
import { clothesRouter } from './module/clothes'
import { outfitRouter } from './module/outfit'
import { devRouter } from './module/dev';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/process', processRouter);
router.use('/clothes', clothesRouter);
router.use('/home', homeRouter);
router.use('/outfit', outfitRouter);
router.use('/dev', devRouter);


export { router };
