// 驗證 Token 格式與是否過期
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../utils/errorMessage';
import { verifyToken } from '../utils/jwt';

export const authMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorHandler({ statusCode: 401, message: '未提供 Token 或格式錯誤' }, res);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return errorHandler({ statusCode: 401, message: '無效的 Token 格式' }, res)
    }

    try {
        const decodedToken = verifyToken(token);
        req.user = decodedToken;
    } catch (err) {
        return errorHandler(err as { statusCode: number; message: string }, res)
    }

    next();

}
