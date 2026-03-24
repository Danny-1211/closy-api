import express from 'express';
import { errorHandler } from '../../utils/errorMessage';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { updateUserGender } from '../../services/userService';

const userRouter = express.Router();
userRouter.patch('/gender', authMiddleWare, async (req, res) => {
  const { gender } = req.body;

  if (!gender) {
    return errorHandler({ statusCode: 400, message: '無效參數' }, res);
  }

  if (!req.user) {
    return errorHandler({ statusCode: 401, message: '使用者未驗證，請重新登入' }, res);
  }

  try {
    const userId = req.user.userId;
    const updatedUser = await updateUserGender(userId, gender);
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    return errorHandler(error as { statusCode: number; message: string }, res);
  }
});

export { userRouter };