import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { generateOutfitRecommendation } from '../../services/geminiServices';
import { getUserClothes } from '../../services/clothesServices';
import { getUserInformation } from '../../services/userServices';
import { OutfitContext } from '../../types/gemini';

const homeRouter = express.Router();

homeRouter.get('/today', authMiddleWare, async (req, res) => {
  /*
  #swagger.tags = ['Home']
  #swagger.summary = '取得今日穿搭建議'
  #swagger.description = '根據使用者的性別、場合、風格與顏色偏好，產生今日的穿搭建議，需要攜帶 Bearer Token'
  #swagger.responses[200] = {
    description: '取得穿搭建議成功',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 200 },
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: '取得穿搭建議成功' },
            ok: { type: 'boolean', example: true },
            data: { 
              type: 'object', 
              properties: {
                reuslt: { 
                    type: 'object',
                    description: '穿搭建議結果',
                    properties: {
                        selectedItemIds: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['item1', 'item2']
                        },
                        reasoning: {
                            type: 'string',
                            example: '這套穿搭適合社交聚會，簡約的風格搭配大地色系，給人溫暖且不失禮貌的感覺。'
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
    description: '未授權，Token 無效或未提供',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 401 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: '未授權，請重新登入' }
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
            message: { type: 'string', example: '伺服器發生錯誤 / AI 未回傳結果，請稍後再試 / AI 推薦結果格式錯誤' }
          }
        }
      }
    }
  }
  */
  try {
    const userId = req.user!.userId;
    const [user, clothesList] = await Promise.all([
      getUserInformation(userId),
      getUserClothes(userId),
    ]);
    if (!user) throw { statusCode: 404, message: '找不到使用者' };
    const context: OutfitContext = {
      gender: user.gender,
      occasion: user.preferences.occasions,
      styles: user.preferences.styles,
      colors: user.preferences.colors,
      items: clothesList.map(item => item.toObject()),
    }
    const result = await generateOutfitRecommendation(context);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '取得穿搭建議成功',
      ok: true,
      data: {
        reuslt: result
      },
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

export { homeRouter }