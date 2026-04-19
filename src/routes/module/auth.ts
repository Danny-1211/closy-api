// google 登入驗證路由
import express from 'express';
import { loginWithGoogle } from '../../services/authServices';
import { config } from '../../config/env';
import { errorHandler } from '../../utils/errorMessage';

const authRouter = express.Router();

// accessToken Cookie 的有效期：14 天
const ACCESS_TOKEN_COOKIE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

// accessToken Cookie 共用設定
const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

authRouter.post('/google', async (req, res) => {
  /* #swagger.tags = ['Auth']
    #swagger.summary = 'Google 登入驗證'
    #swagger.description = '前端傳遞 Google 登入後的 id_token，後端驗證後將系統自訂的 JWT 以 HttpOnly Cookie（名稱 accessToken）形式回傳。前端所有後續 API 請求請以 credentials: "include" 發起，瀏覽器會自動夾帶 cookie。'

    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Google 登入資訊',
      required: true,
      schema: {
          id_token:"eyJhbGciOiJSUzI1NiIsImtp12312312321ZCI6..."
      }
    }

    #swagger.responses[200] = {
      description: '登入成功（JWT 已寫入 HttpOnly Cookie accessToken）',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          status: { type: "boolean", example: true },
          message: { type: "string", example: "登入成功" },
          data: {
            type: "object",
            properties: {
              tokenExpiresIn: { type: "string", example: "1h" },
              user: {
                type: "object",
                properties: {
                  userId: { type: "string", example: "65a1b2c3d4e5f6g7h8i9j0k1" },
                  name: { type: "string", example: "王小明" },
                  email: { type: "string", example: "xiaoming@gmail.com" },
                  avatar: { type: "string", example: "https://lh3.googleusercontent.com/a/..." },
                  preferences: {
                    type: "object",
                    properties: {
                      styles: { type: "array", items: { type: "string" }, example: ["casual", "vintage"] },
                      colors: { type: "array", items: { type: "string" }, example: ["black", "white"] },
                      occasions: { type: "string", example: "work" }
                    }
                  },
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
          statusCode: { type: "integer", example: 400 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "未提供 Token 或格式錯誤" },
          data: { type: "object", nullable: true, example: null }
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

    #swagger.responses[500] = {
      description: '伺服器錯誤',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 500 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "伺服器錯誤，請稍後再試" },
          data: { type: "object", nullable: true, example: null }
        }
      }
    }
  */
  const { id_token } = req.body;

  if (!id_token) {
    return errorHandler({ statusCode: 400, message: '未提供 Token 或格式錯誤' }, res);
  }

  try {
    const { token, user } = await loginWithGoogle(id_token);

    // 將 JWT 寫入 HttpOnly Cookie
    res.cookie('accessToken', token, {
      ...ACCESS_TOKEN_COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
    });

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '登入成功',
      data: {
        tokenExpiresIn: config.JWT_EXPIRES_IN,
        user: {
          userId: String(user.id),
          name: user.name,
          email: user.email,
          avatar: user.picture,
          preferences: user.preferences,
          isProfileCompleted: user.gender ? true : false, // gender 有值代表已完成引導頁
        },
      },
    });
  } catch (err) {
    const statusCode = (err as any)?.statusCode ?? 500;
    const message = statusCode === 401 ? 'Google token 驗證失敗' : '伺服器錯誤，請稍後再試';
    return errorHandler({ statusCode, message }, res);
  }
});

authRouter.post('/logout', async (req, res) => {
  /* #swagger.tags = ['Auth']
    #swagger.summary = '登出'
    #swagger.description = '清除 HttpOnly Cookie 中的 accessToken。此 API 為冪等：無論是否帶有合法 token 皆回 200。'

    #swagger.responses[200] = {
      description: '登出成功',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          status: { type: "boolean", example: true },
          message: { type: "string", example: "登出成功" },
          data: { type: "object", nullable: true, example: null }
        }
      }
    }

    #swagger.responses[500] = {
      description: '伺服器錯誤',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 500 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "伺服器發生錯誤" },
          data: { type: "object", nullable: true, example: null }
        }
      }
    }
  */
  // 清除該 cookie
  res.clearCookie('accessToken', ACCESS_TOKEN_COOKIE_OPTIONS);

  return res.status(200).json({
    statusCode: 200,
    status: true,
    message: '登出成功',
    data: null,
  });
});

export { authRouter };
