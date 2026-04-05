import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { addSingleItem } from '../../services/clothesServices';
import * as ClothesType from '../../types/clothes';
import { validateClothesItem } from '../../utils/validateAttribute';

const clothesRouter = express.Router();

clothesRouter.post('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Clothes']
     #swagger.summary = '新增單品'
     #swagger.description = '將新的衣物單品加入到使用者的衣櫃清單中。'
     #swagger.security = [{
       "bearerAuth": []
     }]
     
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: {
             type: "object",
             required: ["category", "cloudImgUrl", "name", "color", "occasions", "seasons", "brand"],
             properties: {
               category: { type: "string", example: "top" },
               cloudImgUrl: { type: "string", example: "https://example.com/clothes-url.jpg" },
               imageHash: { type: "string", example: "d41d8cd98f00b204e9800998ecf8427e", description: "圖片的 MD5 hash，用於去重檢查" },
               name: { type: "string", example: "白襯衫" },
               color: { type: "string", example: "white" },
               occasions: { type: "array", items: { type: "string" }, example: ["socialGathering", "campusCasual"] },
               seasons: { type: "array", items: { type: "string" }, example: ["spring", "summer"] },
               brand: { type: "string", example: "Uniqlo" }
             }
           }
         }
       }
     }

     #swagger.responses[200] = {
       description: '處理成功',
       schema: {
         type: 'object',
         properties: {
           message: { type: 'string', example: '單品加入衣櫃成功' },
           data: {
             type: 'object',
             description: '更新後的衣櫃資料 (包含所有單品清單)',
             properties: {
               _id: { type: 'string', example: '660a1b2c3d4e5f6g7h8i9j00' },
               userId: { type: 'string', example: '660a1b2c3d4e5f6g7h8i9j11' },
               list: {
                 type: 'array',
                 items: {
                   type: 'object',
                   properties: {
                     category: { type: 'string', example: 'top' },
                     name: { type: 'string', example: '白襯衫' },
                     color: { type: 'string', example: 'white' },
                     occasions: { type: 'array', items: { type: 'string' }, example: ['socialGathering', 'campusCasual'] },
                     seasons: { type: 'array', items: { type: 'string' }, example: ['spring', 'summer'] },
                     brand: { type: 'string', example: 'Uniqlo' },
                     cloudImgUrl: { type: 'string', example: 'https://example.com/clothes-url.jpg' },
                     _id: { type: 'string', example: '660a1b2c3d4e5f6g7h8i9j22' }
                   }
                 }
               }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '請求錯誤 (可能原因：缺少必要參數)',
       schema: {
         type: "object",
         properties: {
           statusCode: { type: "integer", example: 400 },
           message: { type: "string", example: "請提供正確的單品參數" }
         }
       }
     }

     #swagger.responses[401] = {
       description: '身分驗證失敗 (可能原因：未提供 Token、Token 格式錯誤、Token 已過期)',
       schema: {
         type: "object",
         properties: {
           statusCode: { type: "integer", example: 401 },
           message: { type: "string", example: "未提供 Token 或格式錯誤 / 無效的 Token 格式 / 無效的憑證或憑證已過期，請重新登入" }
         }
       }
     }

     #swagger.responses[500] = {
       description: '伺服器錯誤',
       schema: {
         type: 'object',
         properties: {
           statusCode: { type: 'integer', example: 500 },
           message: { type: 'string', example: '內部伺服器錯誤或其他錯誤訊息' }
         }
       }
     }
  */
  const { category, cloudImgUrl, imageHash, name, color, occasions, seasons, brand } = req.body;

  if (!validateClothesItem({ category, cloudImgUrl, name, color, occasions, seasons, brand })) {
    return errorHandler({ statusCode: 400, message: '請提供正確的單品參數' }, res);
  }

  try {
    const userId = req.user!.userId;
    const singleItem: ClothesType.singleItem = { category, cloudImgUrl, imageHash: imageHash || '', name, color, occasions, seasons, brand };
    const clothes = await addSingleItem(userId, singleItem);
    return res.status(200).json({
      message: '單品加入衣櫃成功',
      data: clothes,
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }

})


export { clothesRouter };