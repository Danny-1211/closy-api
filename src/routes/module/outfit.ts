import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { addOutfit, getOutfits, deleteOutfit, getOccasionSummary } from '../../services/outfitServices';
import { validateOutfitOccasion } from '../../utils/validateAttribute';
const outfitRouter = express.Router();


outfitRouter.get('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Outfit']
     #swagger.summary = '取得穿搭清單'
     #swagger.description = '取得目前登入使用者的穿搭列表，可選擇性地依場合篩選。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.parameters['occasion'] = {
       in: 'query',
       required: false,
       description: '場合篩選（可選）。有效值：socialGathering / campusCasual / businessCasual / professional',
       '@schema': { type: 'string', example: 'campusCasual' }
     }

     #swagger.responses[200] = {
       description: '取得成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '取得穿搭清單成功' },
               data: {
                 type: 'object',
                 properties: {
                   list: {
                     type: 'array',
                     items: {
                       type: 'object',
                       properties: {
                         _id: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
                         outfitImgUrl: { type: 'string', example: 'https://example.com/outfit.jpg' },
                         occasion: { type: 'string', example: 'campusCasual' },
                         selectedItems: {
                           type: 'array',
                           items: {
                             type: 'object',
                             properties: {
                               cloudImgUrl: { type: 'string', example: 'https://example.com/item.jpg' },
                               name: { type: 'string', example: '白襯衫' },
                               brand: { type: 'string', example: 'Uniqlo' },
                               category: { type: 'string', example: 'top' }
                             }
                           }
                         },
                         createdAt: { type: 'string', example: '2024-06-01T12:00:00.000Z' },
                         updatedAt: { type: 'string', example: '2024-06-01T12:00:00.000Z' }
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

     #swagger.responses[400] = {
       description: '請求錯誤 (場合參數不合法)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請提供正確的場合' },
               data: { type: 'object', example: null }
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
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[500] = {
       description: '伺服器錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 500 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '內部伺服器錯誤或其他錯誤訊息' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
  */
  const occasionId = req.query.occasion as string | '';

  if (occasionId && !validateOutfitOccasion(occasionId)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的場合' }, res);
  }

  try {
    const userId = req.user!.userId;
    const outfitList = await getOutfits(userId, occasionId);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '取得穿搭清單成功',
      data: {
        list: outfitList
      }
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

outfitRouter.post('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Outfit']
     #swagger.summary = '新增穿搭'
     #swagger.description = '將生成的穿搭影像及單品記錄儲存。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['cloudImgUrl', 'occasion', 'selectedItems'],
             properties: {
               outfitImgUrl: { type: 'string', description: '穿搭圖片雲端 URL', example: 'https://example.com/outfit-url.jpg' },
               occasion: { type: 'string', description: '穿搭場合', example: 'campusCasual' },
               selectedItems: {
                 type: 'array',
                 description: '搭配的單品清單',
                 items: {
                   type: 'object',
                   required: ['cloudImgUrl', 'name', 'category'],
                   properties: {
                     cloudImgUrl: { type: 'string', example: 'https://example.com/item-url.jpg' },
                     name: { type: 'string', example: '白襯衫' },
                     brand: { type: 'string', example: 'Uniqlo' },
                     category: { type: 'string', example: 'top' }
                   }
                 }
               }
             }
           }
         }
       }
     }

     #swagger.responses[200] = {
       description: '新增成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '新增成功' },
               data: { type: 'object', example: {} }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '請求錯誤 (新增失敗)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '新增失敗' },
               data: { type: 'object', example: null }
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
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[500] = {
       description: '伺服器錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 500 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '內部伺服器錯誤或其他錯誤訊息' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
  */
  const { outfitImgUrl, occasion, selectedItems } = req.body;

  if (!outfitImgUrl || !occasion || !Array.isArray(selectedItems) || selectedItems.length === 0) {
    return errorHandler({ statusCode: 400, message: '請提供完整的穿搭資訊' }, res);
  }

  if (!validateOutfitOccasion(occasion)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的場合' }, res);
  }

  try {
    const userId = req.user!.userId;
    const outfitItem = { userId, outfitImgUrl, occasion, selectedItems }
    const newOutfit = await addOutfit(outfitItem);

    if (!newOutfit) {
      return errorHandler({ statusCode: 400, message: '新增失敗' }, res);
    }

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '新增成功',
      data: {}
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

outfitRouter.delete('/:id', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Outfit']
     #swagger.summary = '刪除穿搭'
     #swagger.description = '依穿搭 ID 刪除指定穿搭紀錄。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.parameters['id'] = {
       in: 'path',
       required: true,
       description: '穿搭 ID',
       '@schema': { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' }
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
       description: '請求錯誤 (未提供 ID 或刪除失敗)',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '請提供單品 id / 刪除失敗' },
               data: { type: 'object', example: null }
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
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[500] = {
       description: '伺服器錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 500 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '內部伺服器錯誤或其他錯誤訊息' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
  */
  const outfitId = req.params.id;
  if (!outfitId || typeof outfitId !== 'string') {
    return errorHandler({ statusCode: 400, message: '請提供單品 id' }, res);
  }

  try {
    const userId = req.user!.userId;
    const OutfitList = await deleteOutfit(userId, outfitId);
    if (!OutfitList) {
      return errorHandler({ statusCode: 400, message: '刪除失敗' }, res);
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

outfitRouter.get('/summary', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Outfit']
     #swagger.summary = '取得場合分類統計'
     #swagger.description = '取得各個場合的穿搭總數及最近的更新日期。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.responses[200] = {
       description: '取得場合列表成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '取得場合列表成功' },
               data: {
                 type: 'object',
                 properties: {
                   summaryList: {
                     type: 'array',
                     items: {
                       type: 'object',
                       properties: {
                         occasionId: { type: 'string', example: 'campusCasual' },
                         count: { type: 'integer', example: 5 },
                         recentDates: { 
                           type: 'array', 
                           items: { type: 'string', example: '2024/6/1' } 
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
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[500] = {
       description: '伺服器錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 500 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '內部伺服器錯誤或其他錯誤訊息' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
  */
  try {
    const userId = req.user!.userId;
    const summaryList = await getOccasionSummary(userId);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '取得場合列表成功',
      data: {
        summaryList
      }
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
})

export { outfitRouter };