import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { exchangeCodeForTokens } from '../../integrations/googleCalendar';
import { updateUserGoogleCalendarTokens, clearUserGoogleCalendarTokens } from '../../services/userServices';
import { Calendar } from '../../models/calendar';

const googleCalendarRouter = express.Router();

googleCalendarRouter.post('/callback', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['GoogleCalendar']
     #swagger.summary = '連結 Google Calendar'
     #swagger.description = '接收前端取得的 authorization code，換取 Google Calendar OAuth token 並存入使用者資料。完成後使用者的行事曆列表（GET /calendar）將自動同步 Google Calendar 事件。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['code'],
             properties: {
               code: { type: 'string', description: '前端從 Google OAuth 授權頁面取得的 authorization code', example: '4/0AX4XfWj...' }
             }
           }
         }
       }
     }

     #swagger.responses[200] = {
       description: '連結成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: 'Google Calendar 連結成功' },
               data: { type: 'object', example: {} }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '缺少 authorization code',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '缺少 authorization code' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }

     #swagger.responses[401] = {
       description: '身分驗證失敗 (可能原因：未提供 Token、Token 格式錯誤、Token 已過期)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '未提供 Token 或格式錯誤 / 無效的 Token 格式 / 無效的憑證或憑證已過期，請重新登入' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }

     #swagger.responses[500] = {
       description: '系統錯誤 / Google token 交換失敗',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 500 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '伺服器發生錯誤' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }
  */
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return errorHandler({ statusCode: 400, message: '缺少 authorization code' }, res);
  }
  try {
    const userId = req.user!.userId;
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      return errorHandler({ statusCode: 500, message: 'Google token 交換失敗' }, res);
    }

    await updateUserGoogleCalendarTokens(userId, {
      googleCalendarAccessToken: tokens.access_token,
      googleCalendarRefreshToken: tokens.refresh_token ?? '',
      googleCalendarTokenExpiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 60 * 60 * 1000),
    });

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: 'Google Calendar 連結成功',
      data: {}
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

googleCalendarRouter.post('/disconnect', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['GoogleCalendar']
     #swagger.summary = '中斷 Google Calendar 連結'
     #swagger.description = '清除使用者的 Google Calendar OAuth token，並刪除所有由 Google Calendar 同步過來的行事曆事項。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.responses[200] = {
       description: '中斷連結成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: 'Google Calendar 已中斷連結' },
               data: { type: 'object', example: {} }
             }
           }
         }
       }
     }

     #swagger.responses[401] = {
       description: '身分驗證失敗 (可能原因：未提供 Token、Token 格式錯誤、Token 已過期)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '未提供 Token 或格式錯誤 / 無效的 Token 格式 / 無效的憑證或憑證已過期，請重新登入' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }

     #swagger.responses[500] = {
       description: '系統錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 500 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '伺服器發生錯誤' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }
  */
  try {
    const userId = req.user!.userId;

    // 刪除所有 Google 同步的事項
    await Calendar.deleteMany({ userId, source: 'google' });

    // 清除 token
    await clearUserGoogleCalendarTokens(userId);

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: 'Google Calendar 已中斷連結',
      data: {}
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

export { googleCalendarRouter };
