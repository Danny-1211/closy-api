// google 登入驗證路由
import express from 'express';
import { loginWithGoogle } from '../../services/authServices';
import { config } from '../../types/env';
const authRouter = express.Router();

authRouter.post('/google', async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    res.status(400).json({ message: 'token is required' });
    return;
  }

  try {
    const { token, user } = await loginWithGoogle(id_token);
    res.status(200).json({
      statusCode: 200,
      status: true,
      message: '登入成功',
      data: {
        token,
        tokenExpiresIn: config.JWT_EXPIRES_IN,
        user: {
          userId: String(user.id),
          name: user.name,
          email: user.email,
          avatar: user.picture,
          isProfileCompleted: user.gender ? true : false, // gender 有值代表已完成引導頁
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({
      statusCode: 401,
      status: false,
      message: 'Google token 驗證失敗',
      data: null,
    });
  }
});

export { authRouter };
