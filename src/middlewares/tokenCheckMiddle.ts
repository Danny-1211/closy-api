// 驗證 Token 格式與是否過期
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../utils/errorMessage';
import { verifyToken } from '../utils/jwt';

export const authMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  // 優先從 HttpOnly Cookie 取得 accessToken（前端正式流程）
  let token: string | undefined = req.cookies?.accessToken;

  // fallback：支援 Authorization: Bearer（保留給 Swagger UI / Postman 測試）
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return errorHandler({ statusCode: 401, message: '未提供 Token 或格式錯誤' }, res);
  }

  try {
    const decodedToken = verifyToken(token);
    req.user = decodedToken;
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }

  next();
};
