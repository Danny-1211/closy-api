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
import { validateOutfitOccasion } from '../../utils/validateAttribute';
import { getTargetDateSimply } from '../../utils/datetime';
import { getCalendarEventByDate } from '../../services/calendarServices';
import { buildCalendarRecommendation, refreshUserCalendarSnapshot, resolveCalendarOutfitImgUrl } from '../../utils/home';

type MongooseSingleItem = ClothesType.singleItem & { toObject(): any };

const homeRouter = express.Router();

homeRouter.post('/', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['Home']
     #swagger.summary = '取得穿搭建議與天氣資訊'
     #swagger.description = '根據使用者的性別、場合、風格與顏色偏好，產生指定日期的穿搭建議與天氣資訊，需要攜帶 Bearer Token。前端需在 request body 帶入 occasion。若使用者在行事曆已為目標日期（today/tomorrow）設定行程與穿搭，將直接沿用該筆穿搭（方案 B），不再呼叫 AI。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.parameters['day'] = {
       in: 'query',
       name: 'day',
       required: false,
       description: '查詢日期，today（今日）或 tomorrow（明日），預設為 today',
       '@schema': { type: 'string', example: 'today', default: 'today' }
     }

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['occasion'],
             properties: {
               occasion: { type: 'string', description: '場合（必填）', enum: ['socialGathering', 'campusCasual', 'businessCasual', 'professional'], example: 'socialGathering' }
             }
           }
         }
       }
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
                       occasion: { type: 'string', enum: ['socialGathering', 'campusCasual', 'businessCasual', 'professional'], example: 'socialGathering' },
                       reasoning: { type: 'string', example: '你已為今天的行程挑選這套穿搭。 22°C 多雲，這套衣服非常適合今日的 商務休閒 場合。' }
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

  const userOccasion = req.body.occasion;
  if (!validateOutfitOccasion(userOccasion)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的場合' }, res);
  }

  try {
    const userId = req.user!.userId;
    // 進場先刷新行事曆快照，解決跨午夜過期問題
    await refreshUserCalendarSnapshot(userId);

    const user = await getUserInformation(userId);
    if (!user) throw { statusCode: 404, message: '找不到使用者' };
    const weather = await getWeather(user.location);
    const selectedWeather: DayWeather = day === 'today' ? weather.weatherDataSet.today : weather.weatherDataSet.tomorrow;

    // 方案 B 判斷：目標日若有 Calendar 且 outfit 存在，直接沿用
    const targetDate = getTargetDateSimply(day);
    const calendarEvent = await getCalendarEventByDate(userId, targetDate);

    let result;
    if (calendarEvent && calendarEvent.outfit) {
      // 方案 B：略過 getUserClothes 與 Gemini 推薦
      result = buildCalendarRecommendation(calendarEvent, selectedWeather);
    } else {
      // 方案 A：Calendar 不存在或 outfit 為空
      const clothesList = await getUserClothes(userId);
      const context: OutfitContext = {
        gender: user.gender,
        occasion: userOccasion,
        styles: user.preferences.styles,
        colors: user.preferences.colors,
        items: clothesList.map((item: any) => (item as MongooseSingleItem).toObject()),
        weather: selectedWeather
      };
      result = await generateOutfitRecommendation(context);
    }

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
     #swagger.description = '根據使用者選擇的衣物，使用 AI 合成虛擬穿搭圖片，需要攜帶 Bearer Token。`day` 參數對應 GET /home 的日期（today / tomorrow，預設 today），確保兩支 API 查詢同一天的行事曆。若目標日期的行事曆已有 outfit.outfitImgUrl，將直接沿用該圖片（方案 B），不驗證 request body、不呼叫 Cloudinary 與 Gemini。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.parameters['day'] = {
       in: 'query',
       name: 'day',
       required: false,
       description: '查詢日期，today（今日）或 tomorrow（明日），預設為 today，需與 GET /home 的 day 參數保持一致',
       '@schema': { type: 'string', example: 'today', default: 'today' }
     }

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['selectedItems'],
             properties: {
               selectedItems: {
                 type: 'array',
                 description: '選擇的衣物列表，不可為空',
                 items: {
                   type: 'object',
                   required: ['cloudImgUrl', 'category', 'name', 'brand'],
                   properties: {
                     cloudImgUrl: { type: 'string', example: 'https://res.cloudinary.com/test/image.jpg' },
                     category: { type: 'string', enum: ['top', 'bottom', 'outerwear', 'shoes', 'skirt', 'dress'], example: 'top' },
                     name: { type: 'string', example: '白色基本款 T-shirt' },
                     brand: { type: 'string', example: 'UNIQLO' }
                   }
                 }
               },
               occasion: { type: 'string', description: '場合（必填）', enum: ['socialGathering', 'campusCasual', 'businessCasual', 'professional'], example: 'socialGathering' }
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
                   outfitImgUrl: { type: 'string', example: 'https://res.cloudinary.com/test/closy/users/outfits/abc123/outfit.jpg' },
                   occasion: { type: 'string', example: 'casual' }
                 }
               }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '參數錯誤（selectedItems 不可為空 / 請提供正確的場合）',
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
  // 解析 day 參數，與 GET /home 保持一致；確保方案 B 查詢正確日期的行事曆
  const rawDay = req.query.day;
  const day = rawDay === 'today' || rawDay === 'tomorrow' ? rawDay : rawDay === undefined ? 'today' : null;
  if (!day) {
    return errorHandler({ statusCode: 400, message: 'day 參數只接受 today 或 tomorrow' }, res);
  }

  try {
    const userId = req.user!.userId;

    // 方案 B 優先：目標日期 Calendar 若已有 outfitImgUrl，直接回傳，不需驗證、不呼叫 Cloudinary/Gemini
    const targetDate = getTargetDateSimply(day);
    const calendarEvent = await getCalendarEventByDate(userId, targetDate);
    const imgUrlFromCalendar = resolveCalendarOutfitImgUrl(calendarEvent);
    if (imgUrlFromCalendar !== null && calendarEvent) {
      return res.status(200).json({
        statusCode: 200,
        status: true,
        message: '虛擬穿搭圖片生成成功',
        data: {
          outfitImgUrl: imgUrlFromCalendar,
          occasion: calendarEvent.calendarEventOccasion,
        }
      });
    }

    // 方案 A：沿用既有驗證與合成流程
    const userOccasion = req.body.occasion;
    const selectedItems: { cloudImgUrl: string; category: string, name: string, brand: string }[] = req.body.selectedItems;

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return errorHandler({ statusCode: 400, message: 'selectedItems 不可為空' }, res);
    }

    if (!validateOutfitOccasion(userOccasion)) {
      return errorHandler({ statusCode: 400, message: '請提供正確的場合' }, res);
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
    const outfitImgUrl = await uploadToCloudinary(resultBuffer, `closy/users/outfits/${userId}`);

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '虛擬穿搭圖片生成成功',
      data: {
        outfitImgUrl,
        occasion: userOccasion,
      }
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
})

export { homeRouter }