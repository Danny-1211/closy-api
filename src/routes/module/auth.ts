// google 登入驗證路由
import express from 'express';
import { loginWithGoogle } from '../../services/authServices';
import { config } from '../../types/env';
const authRouter = express.Router();

authRouter.post('/google', async (req, res) => {
  /* #swagger.tags = ['Auth']
    #swagger.summary = 'Google 登入驗證'
    #swagger.description = '前端傳遞 Google 登入後的 id_token，後端驗證後回傳系統自訂的 JWT token 與使用者資訊。'
    
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Google 登入資訊',
      required: true,
      schema: {
          id_token:"eyJhbGciOiJSUzI1NiIsImtp12312312321ZCI6..." 
      }
    }

    #swagger.responses[200] = {
      description: '登入成功',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          status: { type: "boolean", example: true },
          message: { type: "string", example: "登入成功" },
          data: {
            type: "object",
            properties: {
              token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
              tokenExpiresIn: { type: "string", example: "1h" },
              user: {
                type: "object",
                properties: {
                  userId: { type: "string", example: "65a1b2c3d4e5f6g7h8i9j0k1" },
                  name: { type: "string", example: "王小明" },
                  email: { type: "string", example: "xiaoming@gmail.com" },
                  avatar: { type: "string", example: "https://lh3.googleusercontent.com/a/..." },
                  isProfileCompleted: { type: "boolean", example: false }
                }
              }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '缺少 id_token',
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "token is required" }
        }
      }
    }

    #swagger.responses[401] = {
      description: 'Google token 驗證失敗',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 401 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "Google token 驗證失敗" },
          data: { type: "object", nullable: true, example: null }
        }
      }
    }
  */
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
