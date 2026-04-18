import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { uploadSingleImage } from '../../middlewares/uploadMiddle';
import { removeBg, getClothesImageAttribute } from '../../integrations/process';
import { downloadImgFromCloudinary } from '../../integrations/cloudinary';
import { errorHandler } from '../../utils/errorMessage';
const processRouter = express.Router();

// 圖片去背 api
processRouter.post('/remove-bg', authMiddleWare, uploadSingleImage, async (req, res) => {
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
          message: { type: "string", example: "圖片去背完成" },
          data: {
            type: "object",
            properties: {
              message: { type: "string", example: "圖片去背完成" },
              cloudinaryImageUrl: { type: "string", example: "https://res.cloudinary.com/xxx/image/upload/v1/system/abc123.png" },
              imageHash: { type: "string", example: "d41d8cd98f00b204e9800998ecf8427e" }
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
          status: { type: "boolean", example: false },
          message: { type: "string", example: "未提供圖片 / 不支援的檔案格式，請上傳 jpg、png、webp 格式的圖片 / File too large" },
          data: { type: "object", example: null },
          ok: { type: "boolean", example: false }
        }
      }
    }

    #swagger.responses[401] = {
      description: '身分驗證失敗 (可能原因：未提供 Token、Token 格式錯誤、Token 已過期)',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 401 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "未提供 Token 或格式錯誤 / 無效的 Token 格式 / 無效的憑證或憑證已過期，請重新登入" },
          data: { type: "object", example: null },
          ok: { type: "boolean", example: false }
        }
      }
    }

    #swagger.responses[409] = {
      description: '圖片重複 (該使用者已上傳過相同的衣物圖片)',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 409 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "您已上傳過相同的衣物圖片" },
          data: { type: "object", example: null },
          ok: { type: "boolean", example: false }
        }
      }
    }

    #swagger.responses[500] = {
      description: '伺服器錯誤',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 500 },
          status: { type: 'boolean', example: false },
          message: { type: 'string', example: '伺服器發生錯誤' },
          data: { type: "object", example: null },
          ok: { type: "boolean", example: false }
        }
      }
    }
  */
  const image = req.file?.buffer;
  if (!image) {
    return errorHandler({ statusCode: 400, message: '未提供圖片' }, res);
  }
  try {
    const userId = req.user!.userId;
    const result = await removeBg(image, userId);

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '圖片去背完成',
      data: {
        message: '圖片去背完成',
        cloudinaryImageUrl: result.imageUrl,
        imageHash: result.imageHash,
      },
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }

});

// Ai 辨識屬性 : cloudinary 抓下圖片 -> ai 辨識 -> 回傳屬性
processRouter.post('/analyze-clothes', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Process']
    #swagger.summary = 'AI 辨識衣物屬性'
    #swagger.description = '透過圖片網址進行 AI 辨識，提取衣物的分類、名稱、季節、場合與顏色等屬性。'
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["imageUrl"],
            properties: {
              imageUrl: {
                type: "string",
                description: 'Cloudinary 圖片網址',
                example: 'https://res.cloudinary.com/xxx/image/upload/v1/system/abc123.png'
              },
              imageHash: {
                type: "string",
                description: '圖片的 MD5 hash，由 /removeBg 回傳，用於去重檢查 (非必填)',
                example: 'd41d8cd98f00b204e9800998ecf8427e'
              }
            }
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '辨識成功',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          status: { type: "boolean", example: true },
          message: { type: "string", example: "圖片屬性辨識完成" },
          data: {
            type: "object",
            properties: {
              cloudImgUrl: { type: "string", example: "https://res.cloudinary.com/xxx/image/upload/v1/system/abc123.png" },
              category: { type: "string", example: "上衣" },
              name: { type: "string", example: "T-shirt" },
              seasons: { type: "array", items: { type: "string" }, example: ["夏季", "春季"] },
              occasions: { type: "array", items: { type: "string" }, example: ["休閒"] },
              color: { type: "string", example: "白色" },
              brand: { type: "string", example: "" },
              imageHash: { type: "string", example: "d41d8cd98f00b204e9800998ecf8427e" }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '請求錯誤 (可能原因：未提供圖片網址)',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 400 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "未提供圖片網址" },
          data: { type: "object", example: null }
        }
      }
    }

    #swagger.responses[401] = {
      description: '身分驗證失敗 (可能原因：未提供 Token、Token 格式錯誤、Token 已過期)',
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 401 },
          status: { type: "boolean", example: false },
          message: { type: "string", example: "未提供 Token 或格式錯誤 / 無效的 Token 格式 / 無效的憑證或憑證已過期，請重新登入" },
          data: { type: "object", example: null }
        }
      }
    }

    #swagger.responses[500] = {
      description: '伺服器錯誤 (可能原因：AI 辨識衣物屬性失敗、從 Cloudinary 下載圖片失敗)',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 500 },
          status: { type: 'boolean', example: false },
          message: { type: 'string', example: 'AI 辨識衣物屬性失敗 / 從 Cloudinary 下載圖片失敗' },
          data: { type: "object", example: null }
        }
      }
    }
  */
  const imageUrl = req.body.cloudinaryImageUrl;
  const imageHash = req.body.imageHash;
  if (!imageUrl) {
    return errorHandler({ statusCode: 400, message: '未提供圖片網址' }, res);
  }
  try {
    const imageBuffer = await downloadImgFromCloudinary(imageUrl);
    const attributes = await getClothesImageAttribute(imageBuffer);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '圖片屬性辨識完成',
      data: {
        cloudImgUrl: imageUrl,
        category: attributes.category,
        name: attributes.name,
        seasons: attributes.season,
        occasions: attributes.occasion,
        color: attributes.color,
        brand: attributes.brand,
        imageHash: imageHash
      },
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
})

export { processRouter };
