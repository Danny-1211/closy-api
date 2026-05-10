import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { addCalendarEvent, getCalendarList, deleteCalendarEvent, updateCalendarEvent } from '../../services/calendarServices';
import { validateCalendarPatchBody } from '../../utils/validateAttribute';
import { getOutfitById } from '../../services/outfitServices';
import * as CalendarType from '../../types/calendar';
import { refreshUserCalendarSnapshot } from '../../utils/home';
import { getUserInformation } from '../../services/userServices';
import { fetchGoogleCalendarEvents } from '../../integrations/googleCalendar';
import { syncGoogleCalendarEvents } from '../../services/googleCalendarServices';
import { Calendar } from '../../models/calendar';

// 將 Outfit 文件整形為 Calendar embed 用的 ThisOutfit 結構
const toThisOutfit = (outfitDoc: {
  _id: string;
  userId: string;
  outfitImgUrl: string;
  occasion: CalendarType.ThisOutfit['occasion'];
  selectedItems: CalendarType.ThisOutfit['selectedItems'];
  createdAt: Date;
  createdDateSimply: string;
}): CalendarType.ThisOutfit => ({
  _id: outfitDoc._id,
  userId: outfitDoc.userId,
  outfitImgUrl: outfitDoc.outfitImgUrl,
  occasion: outfitDoc.occasion,
  selectedItems: outfitDoc.selectedItems,
  createdAt: outfitDoc.createdAt,
  createdDateSimply: outfitDoc.createdDateSimply
});

const calendarRouter = express.Router();

calendarRouter.post('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Calendar']
     #swagger.summary = '新增行程'
     #swagger.description = '新增使用者的行程與穿搭紀錄。若當天已有 Google 行事曆事項，則無法新增本地行程。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['scheduleDate', 'calendarEventOccasion'],
             properties: {
               scheduleDate: { type: 'string', description: '行程日期', example: '2024/11/20' },
               calendarEventOccasion: { type: 'string', description: '行程場合', example: 'businessCasual' },
               outfitId: { type: 'string', description: '穿搭 ID（選填，帶入時後端會自動撈取該筆穿搭資料）', example: '69e5e1d35368f7b91d76a8aa' }
             }
           }
         }
       }
     }

     #swagger.responses[200] = {
       description: '行程新增成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '行程新增成功' },
               data: { type: 'object', example: {} }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '缺少必要欄位 / outfitId 格式錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '缺少必要欄位 / outfitId 格式錯誤' },
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

     #swagger.responses[404] = {
       description: '新增失敗 / 找不到該穿搭',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 404 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '新增失敗 / 找不到該穿搭' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }

     #swagger.responses[409] = {
       description: '當天已有 Google 行事曆事項，無法新增本地行程',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 409 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '當天已有 Google 行事曆事項，無法新增本地行程' },
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
  const { scheduleDate, calendarEventOccasion, outfitId } = req.body;
  if (!scheduleDate || !calendarEventOccasion) {
    return errorHandler({ statusCode: 400, message: '缺少必要欄位' }, res);
  }
  if (outfitId !== undefined && typeof outfitId !== 'string') {
    return errorHandler({ statusCode: 400, message: 'outfitId 格式錯誤' }, res);
  }
  try {
    const userId = req.user!.userId;

    let outfitEmbed: CalendarType.ThisOutfit | undefined;
    if (outfitId) {
      const outfitDoc = await getOutfitById(userId, outfitId);
      if (!outfitDoc) {
        return errorHandler({ statusCode: 404, message: '找不到該穿搭' }, res);
      }
      outfitEmbed = toThisOutfit(outfitDoc);
    }

    const newCalendarEvent = await addCalendarEvent(userId, scheduleDate, calendarEventOccasion, outfitEmbed);
    if (!newCalendarEvent) {
      return errorHandler({ statusCode: 404, message: '新增失敗' }, res);
    }
    await refreshUserCalendarSnapshot(userId);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '行程新增成功',
      data: {}
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

calendarRouter.get('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Calendar']
     #swagger.summary = '取得行事曆列表'
     #swagger.description = '取得使用者的所有行程與穿搭紀錄。若使用者已連結 Google Calendar，會自動同步最新事件後再回傳。回傳資料包含 source 欄位（local / google）供前端判斷顯示方式；google 來源的事項含有 googleEvents 子事件陣列。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.responses[200] = {
       description: '取得行事曆列表成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '取得行事曆列表成功' },
               data: {
                 type: 'array',
                 items: {
                   type: 'object',
                   properties: {
                     _id: { type: 'string', example: '67329dcb2a38d7aa9bc71415' },
                     userId: { type: 'string', example: '67329dcb2a38d7aa9bc71415' },
                     scheduleDate: { type: 'string', example: '2024/11/20' },
                     calendarEventOccasion: { type: 'string', example: 'businessCasual' },
                     source: { type: 'string', enum: ['local', 'google'], example: 'local' },
                     googleEvents: {
                       type: 'array',
                       description: '僅 source 為 google 時有值',
                       items: {
                         type: 'object',
                         properties: {
                           googleEventId: { type: 'string', example: 'abc123xyz' },
                           title: { type: 'string', example: '跟朋友吃飯' },
                           startTime: { type: 'string', example: '10:00' },
                           endTime: { type: 'string', example: '12:00' }
                         }
                       }
                     },
                     outfit: {
                       type: 'object',
                       nullable: true,
                       properties: {
                         _id: { type: 'string', example: '69e5e1d35368f7b91d76a8aa' },
                         userId: { type: 'string', example: '69c78a9f77ac6314790d6c16' },
                         outfitImgUrl: { type: 'string', example: 'https://res.cloudinary.com/...' },
                         occasion: { type: 'string', example: 'businessCasual' },
                         selectedItems: { type: 'array', items: { type: 'object' } },
                         createdDateSimply: { type: 'string', example: '2026/04/20' },
                         createdAt: { type: 'string', format: 'date-time' }
                       }
                     }
                   }
                 }
               }
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

     #swagger.responses[404] = {
       description: '取得列表失敗',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 404 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '取得列表失敗' },
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

    // 若使用者已連結 Google Calendar，先同步最新事件
    const user = await getUserInformation(userId);
    if (user?.isGoogleCalendarConnected && user.googleCalendarAccessToken) {
      try {
        const eventsByDate = await fetchGoogleCalendarEvents(user.googleCalendarAccessToken);
        await syncGoogleCalendarEvents(userId, eventsByDate);
      } catch {
        // 同步失敗不中斷主流程，繼續回傳已存的資料
      }
    }

    const calendarList = await getCalendarList(userId);
    if (!calendarList) {
      return errorHandler({ statusCode: 404, message: '取得列表失敗' }, res);
    }
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '取得行事曆列表成功',
      data: calendarList
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

calendarRouter.delete('/:id', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Calendar']
     #swagger.summary = '刪除行程'
     #swagger.description = '依行程 ID 刪除指定的行事曆行程紀錄。僅限本地行程（source: local），Google 行事曆事項無法刪除。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.parameters['id'] = {
       in: 'path',
       required: true,
       description: '行程 ID',
       '@schema': { type: 'string', example: '69e5e1d35368f7b91d76a8aa' }
     }

     #swagger.responses[200] = {
       description: '刪除成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '刪除成功' },
               data: { type: 'object', example: {} }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '請求錯誤 (未提供行程 ID / 不可刪除 Google 行事曆事項)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請提供行程 id / 無法刪除 Google 行事曆事項' },
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

     #swagger.responses[404] = {
       description: '刪除失敗 (找不到該行程)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 404 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '刪除失敗' },
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
    const calendarId = req.params.id;
    if (!calendarId || typeof calendarId !== 'string') {
      return errorHandler({ statusCode: 400, message: '請提供行程 id' }, res);
    }

    // 先檢查 source，Google 事項不可刪除
    const target = await Calendar.findOne({ _id: calendarId, userId });
    if (target && target.source === 'google') {
      return errorHandler({ statusCode: 400, message: '無法刪除 Google 行事曆事項' }, res);
    }

    const deletedCalendar = await deleteCalendarEvent(userId, calendarId);
    if (!deletedCalendar) {
      return errorHandler({ statusCode: 404, message: '刪除失敗' }, res);
    }
    await refreshUserCalendarSnapshot(userId);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '刪除成功',
      data: {}
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

calendarRouter.patch('/:id', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Calendar']
     #swagger.summary = '更新行程'
     #swagger.description = '依行程 ID 更新指定的行事曆行程紀錄，支援部分欄位更新（至少提供一項）。Google 行事曆事項（source: google）僅允許更新 calendarEventOccasion 和 outfitId，不可更新 scheduleDate。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.parameters['id'] = {
       in: 'path',
       required: true,
       description: '行程 ID',
       '@schema': { type: 'string', example: '67329dcb2a38d7aa9bc71415' }
     }

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               scheduleDate: { type: 'string', description: '行程日期（僅本地行程可更新）', example: '2024/11/20' },
               calendarEventOccasion: { type: 'string', description: '行程場合', example: 'businessCasual' },
               outfitId: { type: 'string', description: '穿搭 ID（選填，帶入時後端會自動撈取該筆穿搭資料）', example: '69e5e1d35368f7b91d76a8aa' }
             }
           }
         }
       }
     }

     #swagger.responses[200] = {
       description: '更新成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '更新成功' },
               data: { type: 'object', example: {} }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '請求錯誤 (未提供行程 ID / 未提供更新欄位 / 格式錯誤 / Google 事項不可更新日期)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請提供至少一個更新欄位 / 日期格式錯誤 / 場合格式錯誤 / 請提供行程 id / Google 行事曆事項不可更新日期' },
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

     #swagger.responses[404] = {
       description: '更新失敗 (找不到該行程 / 找不到該穿搭)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 404 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '更新失敗 / 找不到該穿搭' },
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
    const calendarId = req.params.id as string;

    const validationError = validateCalendarPatchBody(calendarId, req.body);
    if (validationError) {
      return errorHandler(validationError, res);
    }

    // 若為 Google 事項，不允許更新 scheduleDate
    const target = await Calendar.findOne({ _id: calendarId, userId });
    if (target?.source === 'google' && req.body.scheduleDate !== undefined) {
      return errorHandler({ statusCode: 400, message: 'Google 行事曆事項不可更新日期' }, res);
    }

    const { scheduleDate, calendarEventOccasion, outfitId } = req.body as {
      scheduleDate?: string;
      calendarEventOccasion?: string;
      outfitId?: string;
    };
    const updates: Partial<{ scheduleDate: string; calendarEventOccasion: string; outfit: CalendarType.ThisOutfit | null }> = {};
    if (scheduleDate !== undefined) updates.scheduleDate = scheduleDate;
    if (calendarEventOccasion !== undefined) updates.calendarEventOccasion = calendarEventOccasion;
    if (outfitId === '') {
      updates.outfit = null;
    } else if (outfitId) {
      const outfitDoc = await getOutfitById(userId, outfitId);
      if (!outfitDoc) {
        return errorHandler({ statusCode: 404, message: '找不到該穿搭' }, res);
      }
      updates.outfit = toThisOutfit(outfitDoc);
    }

    const updatedCalendar = await updateCalendarEvent(userId, calendarId, updates);

    if (!updatedCalendar) {
      return errorHandler({ statusCode: 404, message: '更新失敗' }, res);
    }

    if (updates.scheduleDate !== undefined || updates.calendarEventOccasion !== undefined) {
      await refreshUserCalendarSnapshot(userId);
    }

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '更新成功',
      data: {}
    });

  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

export { calendarRouter };
