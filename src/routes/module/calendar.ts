import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { addCalendarEvent, getCalendarList, deleteCalendarEvent } from '../../services/calendarServices';

const calendarRouter = express.Router();

calendarRouter.post('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Calendar']
     #swagger.summary = '新增行程'
     #swagger.description = '新增使用者的行程與穿搭紀錄'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['scheduleDate', 'calendarEventOccasion', 'outfit'],
             properties: {
               scheduleDate: { type: 'string', format: 'date-time', description: '行程日期時間', example: '2024-11-20T10:00:00.000Z' },
               calendarEventOccasion: { type: 'string', description: '行程場合', example: 'businessCasual' },
               outfit: {
                 type: 'object',
                 description: '穿搭資訊',
                 properties: {
                   _id: { type: 'string', description: '穿搭 ID', example: '69e5e1d35368f7b91d76a8aa' },
                   userId: { type: 'string', description: '使用者 ID', example: '69c78a9f77ac6314790d6c16' },
                   outfitImgUrl: { type: 'string', description: '穿搭圖片網址', example: 'https://res.cloudinary.com/damapwahs/image/upload/v1776672966/closy/users/outfits/69c78a9f77ac6314790d6c16/i2skmm6sjbqlwyjysgex.png' },
                   occasion: { type: 'string', description: '穿搭場合', example: 'businessCasual' },
                   selectedItems: {
                     type: 'array',
                     description: '選擇的服飾單品',
                     items: {
                       type: 'object',
                       properties: {
                         cloudImgUrl: { type: 'string', description: '單品圖片網址', example: 'https://res.cloudinary.com/damapwahs/image/upload/v1776498082/closy/system/nlrfghk70weenchkpbw2.png' },
                         name: { type: 'string', description: '單品名稱', example: '襯衫98566' },
                         brand: { type: 'string', description: '單品品牌', example: '' },
                         category: { type: 'string', description: '單品分類', example: 'top' }
                       }
                     }
                   },
                   createdDateSimply: { type: 'string', description: '簡易日期格式', example: '2026/04/20' },
                   createdAt: { type: 'string', format: 'date-time', description: '穿搭建立時間', example: '2026-04-20T08:20:35.793Z' }
                 }
               }
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
       description: '缺少必要欄位',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '缺少必要欄位' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }

     #swagger.responses[401] = {
       description: '未授權 (Token 無效或過期)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請先登入' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }

     #swagger.responses[404] = {
       description: '新增失敗',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 404 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '新增失敗' },
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
  const { scheduleDate, calendarEventOccasion, outfit } = req.body;
  if (!scheduleDate || !calendarEventOccasion || !outfit) {
    return errorHandler({ statusCode: 400, message: '缺少必要欄位' }, res);
  }
  try {
    const userId = req.user!.userId;
    const newCalendarEvent = await addCalendarEvent(userId, scheduleDate, calendarEventOccasion, outfit);
    if (!newCalendarEvent) {
      return errorHandler({ statusCode: 404, message: '新增失敗' }, res);
    }
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
     #swagger.description = '取得使用者的所有行程與穿搭紀錄，包含過去與未來的行程，依照日期排序'
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
                     scheduleDate: { type: 'string', format: 'date-time', example: '2024-11-20T10:00:00.000Z' },
                     calendarEventOccasion: { type: 'string', example: 'businessCasual' },
                     outfit: {
                       type: 'object',
                       properties: {
                         _id: { type: 'string', example: '69e5e1d35368f7b91d76a8aa' },
                         userId: { type: 'string', example: '69c78a9f77ac6314790d6c16' },
                         outfitImgUrl: { type: 'string', example: 'https://res.cloudinary.com/damapwahs/image/upload/v1776672966/closy/users/outfits/69c78a9f77ac6314790d6c16/i2skmm6sjbqlwyjysgex.png' },
                         occasion: { type: 'string', example: 'businessCasual' },
                         selectedItems: {
                           type: 'array',
                           items: {
                             type: 'object',
                             properties: {
                               cloudImgUrl: { type: 'string', example: 'https://res.cloudinary.com/damapwahs/image/upload/v1776498082/closy/system/nlrfghk70weenchkpbw2.png' },
                               name: { type: 'string', example: '襯衫98566' },
                               brand: { type: 'string', example: '' },
                               category: { type: 'string', example: 'top' }
                             }
                           }
                         },
                         createdDateSimply: { type: 'string', example: '2026/04/20' },
                         createdAt: { type: 'string', format: 'date-time', example: '2026-04-20T08:20:35.793Z' }
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
       description: '未授權 (Token 無效或過期)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請先登入' },
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
     #swagger.description = '依行程 ID 刪除指定的行事曆行程紀錄。'
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
       description: '請求錯誤 (未提供行程 ID)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請提供行程 id' },
               data: { type: 'object', nullable: true, example: null }
             }
           }
         }
       }
     }

     #swagger.responses[401] = {
       description: '未授權 (Token 無效或過期)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請先登入' },
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
    const deletedCalendar = await deleteCalendarEvent(userId, calendarId);
    if (!deletedCalendar) {
      return errorHandler({ statusCode: 404, message: '刪除失敗' }, res);
    }
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

export { calendarRouter }