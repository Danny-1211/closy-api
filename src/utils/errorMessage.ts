// respone 錯誤統一發送
import { Response } from 'express';
import { AppError } from '../types/error';
const errorHandler = (err: AppError, res: Response,) => {
    const statusCode = err.statusCode ?? 500;

    res.status(statusCode).json({
        statusCode,
        status: false,
        message: err.message ?? "伺服器發生錯誤",
        data: null,
    });
};

export { errorHandler };