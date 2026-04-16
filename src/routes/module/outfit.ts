import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { addOutfit } from '../../services/outfitServices';

const outfitRouter = express.Router();


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
                 cloudImgUrl: { type: 'string', description: '穿搭圖片雲端 URL', example: 'https://example.com/outfit-url.jpg' },
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
})

export { outfitRouter };