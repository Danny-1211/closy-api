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
       schema: { type: 'string', default: 'today' },
       description: '查詢日期，today（今日）或 tomorrow（明日），預設為 today'
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
                             category: { type: 'string' },
                             cloudImgUrl: { type: 'string' }
                           }
                         }
                       },
                       reasoning: { type: 'string' }
                     }
                   },
                   weather: {
                     type: 'object',
                     description: '指定日期的天氣資訊',
                     properties: {
                       temperature: { type: 'string' },
                       weather: { type: 'string' },
                       weatherCode: { type: 'string' },
                       weatherDescription: { type: 'string' }
                     }
                   },
                   city: { type: 'string' }
                 }
               }
             }
           },
           examples: {
             Today: {
               summary: '取得今日穿搭建議成功',
               value: {
                 statusCode: 200,
                 status: true,
                 message: '取得今日穿搭建議成功',
                 data: {
                   recommendation: {
                     selectedItems: [
                       { category: 'top', cloudImgUrl: 'https://storage.googleapis.com/test/item1.jpg' },
                       { category: 'bottom', cloudImgUrl: 'https://storage.googleapis.com/test/item2.jpg' }
                     ],
                     reasoning: '這套穿搭適合社交聚會，簡約的風格搭配大地色系，給人溫暖且不失禮貌的感覺。'
                   },
                   weather: {
                     temperature: '24',
                     weather: '多雲',
                     weatherCode: '03',
                     weatherDescription: '多雲，早晚稍涼，日夜溫差大，建議攜帶薄外套。'
                   },
                   city: '臺北市'
                 }
               }
             },
             Tomorrow: {
               summary: '取得明日穿搭建議成功',
               value: {
                 statusCode: 200,
                 status: true,
                 message: '取得明日穿搭建議成功',
                 data: {
                   recommendation: {
                     selectedItems: [
                       { category: 'outerwear', cloudImgUrl: 'https://storage.googleapis.com/test/item3.jpg' }
                     ],
                     reasoning: '明日預測較涼，建議穿著長袖與薄外套。'
                   },
                   weather: {
                     temperature: '22',
                     weather: '陰天',
                     weatherCode: '04',
                     weatherDescription: '陰天，有局部短暫陣雨的機會。'
                   },
                   city: '臺北市'
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             InvalidDay: {
               summary: 'day 參數不合法',
               value: {
                 statusCode: 400,
                 status: false,
                 message: 'day 參數只接受 today 或 tomorrow',
                 data: null
               }
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             MissingToken: {
               summary: '未提供 Token',
               value: { statusCode: 401, status: false, message: '未提供 Token 或格式錯誤', data: null }
             },
             InvalidFormat: {
               summary: '格式錯誤',
               value: { statusCode: 401, status: false, message: '無效的 Token 格式', data: null }
             },
             ExpiredOrInvalid: {
               summary: '憑證過期或無效',
               value: { statusCode: 401, status: false, message: '無效的憑證或憑證已過期，請重新登入', data: null }
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             UserNotFound: {
               summary: '找不到使用者',
               value: { statusCode: 404, status: false, message: '找不到使用者', data: null }
             },
             LocationNotFound: {
               summary: '位置資訊未找到',
               value: { statusCode: 404, status: false, message: '使用者位置資訊未找到', data: null }
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             WeatherFailed: {
               summary: '取得天氣失敗',
               value: { statusCode: 500, status: false, message: '取得今天天氣資訊失敗', data: null }
             },
             AIFailed: {
               summary: 'AI 服務異常',
               value: { statusCode: 500, status: false, message: 'AI 未回傳結果，請稍後再試', data: null }
             },
             AIFormatError: {
               summary: 'AI 推薦格式錯誤',
               value: { statusCode: 500, status: false, message: 'AI 推薦結果格式錯誤', data: null }
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
               }
             }
           },
           examples: {
             ValidRequest: {
               summary: '有效的請求範例',
               value: {
                 selectedItems: [
                   { cloudImgUrl: 'https://res.cloudinary.com/test/image.jpg', category: 'top' }
                 ]
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
                   imageUrl: { type: 'string', example: 'https://res.cloudinary.com/test/image.jpg' }
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             EmptyItems: {
               summary: '未提供或 selectedItems 為空',
               value: {
                 statusCode: 400,
                 status: false,
                 message: 'selectedItems 不可為空',
                 data: null
               }
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             MissingToken: {
               summary: '未提供 Token',
               value: { statusCode: 401, status: false, message: '未提供 Token 或格式錯誤', data: null }
             },
             ExpiredOrInvalid: {
               summary: '憑證過期或無效',
               value: { statusCode: 401, status: false, message: '無效的憑證或憑證已過期，請重新登入', data: null }
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             UserNotFound: {
               summary: '找不到使用者',
               value: { statusCode: 404, status: false, message: '找不到使用者', data: null }
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
               message: { type: 'string' },
               data: { type: 'object', nullable: true, example: null }
             }
           },
           examples: {
             GenerateFailed: {
               summary: '伺服器端錯誤',
               value: { statusCode: 500, status: false, message: '伺服器發生不可預期的錯誤', data: null }
             },
             AIFailed: {
               summary: 'AI 服務異常',
               value: { statusCode: 500, status: false, message: 'AI 未回傳圖片，請稍後再試', data: null }
             }
           }
         }
       }
     }
  */
  try {
    const userId = req.user!.userId;
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
        category: item.category,
      }))
    );

    const resultBuffer = await generateVirtualOutfitImage(modelBuffer, clothesItems);
    const imageUrl = await uploadToCloudinary(resultBuffer, `closy/users/outfits/${userId}`);

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '虛擬穿搭圖片生成成功',
      data: { imageUrl }
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
})

export { homeRouter }