import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { uploadSingleImage } from '../../middlewares/uploadMiddle';
import { removeBg } from '../../services/processService';
import { errorHandler } from '../../utils/errorMessage';
const processRouter = express.Router();

// 圖片去背 api
processRouter.post('/removeBg', authMiddleWare, uploadSingleImage, async (req, res) => {
  /* #swagger.tags = ['Process']
    #swagger.summary = '圖片去背'
    #swagger.description = '上傳單張圖片進行去背處理，回傳去背後的圖片結果。<br>需要發送 multipart/form-data 格式，並帶上 key 名稱為 `image` 的檔案。<br>⚠️ **注意**：需要在後端環境變數中設定 `PICTURE_TOKEN` 才能成功呼叫去背 API。'
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["image"],
            properties: {
              image: {
                type: "string",
                format: "binary",
                description: '要進行去背的圖片 (格式可以 jpg 、png 、webp，最大 5MB)'
              }
            }
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '處理成功',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          status: { type: "boolean", example: true },
          message: { type: "string", example: "成功" },
          ok: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              message: { type: "string", example: "圖片去背完成" },
              imageUrl: { type: "string", example: "https://res.cloudinary.com/xxx/image/upload/v1/system/abc123.png" }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '請求錯誤 (可能原因：未提供圖片、不支援的檔案格式、檔案超出 5MB 限制)',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 400 },
          message: { type: "string", example: "未提供圖片 / 不支援的檔案格式，請上傳 jpg、png、webp 格式的圖片 / File too large" }
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
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 500 },
              status: { type: 'boolean', example: false },
              message: { type: 'string', example: '伺服器發生錯誤，資料更新失敗，請稍後再試' }
            }
          }
        }
      }
    }
  */
  const image = req.file?.buffer;
  if (!image) {
    return errorHandler({ statusCode: 400, message: '未提供圖片' }, res);
  }
  try {
    const result = await removeBg(image);

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '圖片去背完成',
      ok: true,
      data: {
        message: '圖片去背完成',
      },
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }

});

export { processRouter };
