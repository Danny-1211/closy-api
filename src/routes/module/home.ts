import express from 'express';
import path from 'path';
import fs from 'fs';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { generateOutfitRecommendation, generateVirtualOutfitImage } from '../../services/geminiServices';
import { getUserClothes } from '../../services/clothesServices';
import { getUserInformation } from '../../services/userServices';
import { DayWeather, OutfitContext, VirtualOutfitItem } from '../../types/gemini';
import { getWeather } from '../../integrations/openWeather';
import { downloadImgFromCloudinary, uploadToCloudinary } from '../../integrations/cloudinary';
import * as ClothesType from '../../types/clothes';

type MongooseSingleItem = ClothesType.singleItem & { toObject(): any };

const homeRouter = express.Router();

homeRouter.get('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Home']
     #swagger.summary = '取得穿搭建議與天氣資訊'
     #swagger.description = '根據使用者的性別、場合、風格與顏色偏好，產生指定日期的穿搭建議與天氣資訊，需要攜帶 Bearer Token'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.parameters['day'] = {
       in: 'query',
       name: 'day',
       required: false,
       description: '查詢日期，today（今日）或 tomorrow（明日），預設為 today',
       '@schema': { type: 'string', example: 'today', default: 'today' }
     }

     #swagger.responses[200] = {
       description: '取得穿搭建議成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '取得今日穿搭建議成功' },
               data: {
                 type: 'object',
                 properties: {
                   recommendation: {
                     type: 'object',
                     description: 'AI 穿搭建議結果',
                     properties: {
                       selectedItems: {
                         type: 'array',
                         items: {
                           type: 'object',
                           properties: {
                             category: { type: 'string', example: 'top' },
                             name: { type: 'string', example: '白色基本款 T-shirt' },
                             brand: { type: 'string', example: 'UNIQLO' },
                             cloudImgUrl: { type: 'string', example: 'https://res.cloudinary.com/test/image.jpg' }
                           }
                         }
                       },
                       reasoning: { type: 'string', example: '這套穿搭適合社交聚會，簡約的風格搭配大地色系，給人溫暖且不失禮貌的感覺。' }
                     }
                   },
                   weather: {
                     type: 'object',
                     description: '指定日期的天氣資訊',
                     properties: {
                       temperature: { type: 'string', example: '24' },
                       weather: { type: 'string', example: '多雲' },
                       weatherCode: { type: 'string', example: '03' },
                       weatherDescription: { type: 'string', example: '多雲，早晚稍涼，日夜溫差大，建議攜帶薄外套。' }
                     }
                   },
                   city: { type: 'string', example: '臺北市' }
                 }
               }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '參數錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: 'day 參數只接受 today 或 tomorrow' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[401] = {
       description: '未授權或 Token 錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '未提供 Token 或格式錯誤' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[404] = {
       description: '找不到相關資訊',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 404 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '找不到使用者' },
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
               message: { type: 'string', example: '伺服器發生不可預期的錯誤' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
  */
  const rawDay = req.query.day;
  const day = rawDay === 'today' || rawDay === 'tomorrow' ? rawDay : rawDay === undefined ? 'today' : null;

  if (!day) {
    return errorHandler({ statusCode: 400, message: 'day 參數只接受 today 或 tomorrow' }, res)
  }

  try {
    const userId = req.user!.userId;
    const user = await getUserInformation(userId);
    if (!user) throw { statusCode: 404, message: '找不到使用者' };
    const [clothesList, weather] = await Promise.all([
      getUserClothes(userId),
      getWeather(user.location)
    ]);
    const selectedWeather: DayWeather = day === 'today' ? weather.weatherDataSet.today : weather.weatherDataSet.tomorrow;
    const context: OutfitContext = {
      gender: user.gender,
      occasion: user.preferences.occasions,
      styles: user.preferences.styles,
      colors: user.preferences.colors,
      items: clothesList.map((item: any) => (item as MongooseSingleItem).toObject()),
      weather: selectedWeather
    }
    const result = await generateOutfitRecommendation(context);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: `取得${day === 'today' ? '今日' : '明日'}穿搭建議成功`,
      data: {
        recommendation: result,
        weather: selectedWeather,
        city: weather.city,
      }
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

homeRouter.post('/outfit', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Home']
     #swagger.summary = '生成虛擬穿搭圖片'
     #swagger.description = '根據使用者選擇的服飾與使用者的性別，使用 AI 生成穿搭圖片，需要攜帶 Bearer Token'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               selectedItems: {
                 type: 'array',
                 description: '選擇的服飾項目列表',
                 items: {
                   type: 'object',
                   properties: {
                     cloudImgUrl: { type: 'string', description: '圖片 URL' },
                     category: { type: 'string', description: '服飾類別' }
                   }
                 }
               },
               occasion: { type: 'string', description: '場合（例如：casual、formal、sport）', example: 'casual' }
             }
           },
           examples: {
             ValidRequest: {
               summary: '有效的請求範例',
               value: {
                 selectedItems: [
                   { cloudImgUrl: 'https://res.cloudinary.com/test/image.jpg', category: 'top' }
                 ],
                 occasion: 'casual'
               }
             }
           }
         }
       }
     }

     #swagger.responses[200] = {
       description: '虛擬穿搭圖片生成成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '虛擬穿搭圖片生成成功' },
               data: {
                 type: 'object',
                 properties: {
                   imageUrl: { type: 'string', example: 'https://res.cloudinary.com/test/image.jpg' },
                   occasion: { type: 'string', example: 'casual' }
                 }
               }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '參數錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: 'selectedItems 不可為空' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[401] = {
       description: '未授權或 Token 錯誤',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '未提供 Token 或格式錯誤' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }

     #swagger.responses[404] = {
       description: '找不到相關資訊',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'integer', example: 404 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '找不到使用者' },
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
               message: { type: 'string', example: '伺服器發生不可預期的錯誤' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
  */
  try {
    const userId = req.user!.userId;
    const userOccasion = req.body.occasion;
    const selectedItems: { cloudImgUrl: string; category: string }[] = req.body.selectedItems;

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return errorHandler({ statusCode: 400, message: 'selectedItems 不可為空' }, res);
    }

    const user = await getUserInformation(userId);
    if (!user) throw { statusCode: 404, message: '找不到使用者' };

    const gender = user.gender || 'male';
    const modelPath = path.join(process.cwd(), 'public', `${gender}.webp`);
    const modelBuffer = await fs.promises.readFile(modelPath);

    const clothesItems: VirtualOutfitItem[] = await Promise.all(
      selectedItems.map(async (item) => ({
        buffer: await downloadImgFromCloudinary(item.cloudImgUrl),
        category: item.category
      }))
    );

    const resultBuffer = await generateVirtualOutfitImage(modelBuffer, clothesItems);
    const imageUrl = await uploadToCloudinary(resultBuffer, `closy/users/outfits/${userId}`);

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '虛擬穿搭圖片生成成功',
      data: {
        imageUrl,
        occasion: userOccasion,
      }
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
})

export { homeRouter }