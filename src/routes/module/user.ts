import express from 'express';
import { errorHandler } from '../../utils/errorMessage';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { updateUserGender, updateUserColor, updateUserStyle, updateUserOccasion, updateUserLocation, getUserInformation } from '../../services/userServices';
import { validateColors, validateStyles, validateOccasions, validateGender, validateLocation, validateUserAuthorization, roundCoordinate } from '../../utils/validateAttribute';
import { defaultLocation } from '../../constants/user';
import { checkOutfitGeneratedToday, checkOutfitGeneratedTomorrow } from '../../services/outfitServices';

const userRouter = express.Router();

// 修改性別
userRouter.patch('/gender', authMiddleWare, async (req, res) => {
  /*
  #swagger.tags = ['User']
  #swagger.summary = '更新使用者性別'
  #swagger.description = '更新目前登入使用者的性別資訊，需要攜帶 Bearer Token'
  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['gender'],
          properties: {
            gender: {
              type: 'string',
              example: 'male',
              description: '使用者性別，例如：male / female '
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: '性別更新成功',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 200 },
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: '性別更新成功' },
            data: { type: 'object', example: {} }
          }
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: '未提供性別參數',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: '請提供正確的性別參數' }
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
    description: '伺服器錯誤，資料更新失敗',
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
  const { gender } = req.body;

  if (!validateGender(gender)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的性別參數' }, res);
  }

  try {
    const userId = req.user!.userId;
    const IsupdatedUserGenderSuccessful = await updateUserGender(userId, gender);
    if (!IsupdatedUserGenderSuccessful) {
      return errorHandler({ statusCode: 404, message: '找不到使用者' }, res);
    }
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '性別更新成功',
      data: {},
    });
  } catch (error) {
    return errorHandler(error as { statusCode: number; message: string }, res);
  }
});

// 使用者偏好設定 - 修改色系
userRouter.patch('/preferences/colors', authMiddleWare, async (req, res) => {
  /*
  #swagger.tags = ['User']
  #swagger.summary = '更新使用者偏好色系'
  #swagger.description = '更新目前登入使用者的偏好色系，需要攜帶 Bearer Token'
  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['colors'],
          properties: {
            colors: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['black', 'white', 'gray', 'brown', 'yellow', 'orange', 'pink', 'green', 'blue', 'purple'],
              description: '使用者偏好色系，例如：black / white / gray / brown / yellow / orange / pink / green / blue / purple '
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: '偏好色系更新成功',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 200 },
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: '偏好色系更新成功' },
            data: { type: 'object', example: {} }
          }
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: '並沒有這個色系',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: '請提供正確的色系參數' }
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
    description: '伺服器錯誤，資料更新失敗',
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
  const { colors }: { colors: string[] } = req.body;

  if (!validateColors(colors)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的色系' }, res);
  }

  try {
    const userId = req.user!.userId;
    const IsupdatedUserColorSuccessful = await updateUserColor(userId, colors);
    if (!IsupdatedUserColorSuccessful) {
      return errorHandler({ statusCode: 404, message: '找不到使用者' }, res);
    }
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '偏好色系更新成功',
      data: {},
    });
  } catch (error) {
    return errorHandler(error as { statusCode: number; message: string }, res);
  }
});

// // 使用者偏好設定 - 修改風格
userRouter.patch('/preferences/styles', authMiddleWare, async (req, res) => {
  /*
 #swagger.tags = ['User']
 #swagger.summary = '更新使用者偏好風格'
 #swagger.description = '更新目前登入使用者的偏好風格，需要攜帶 Bearer Token'
 #swagger.requestBody = {
   required: true,
   content: {
     'application/json': {
       schema: {
         type: 'object',
         required: ['styles'],
         properties: {
           styles: {
             type: 'array',
             items: {
               type: 'string'
             },
             example: ['simple', 'street', 'outdoor', 'american', 'japanese', 'korean', 'retro', 'city', 'sweety'],
             description: '使用者偏好風格，例如：simple / street / outdoor / american / japanese / korean / retro / city / sweety '
           }
         }
       }
     }
   }
 }
 #swagger.responses[200] = {
   description: '偏好風格更新成功',
   content: {
     'application/json': {
       schema: {
         type: 'object',
         properties: {
           statusCode: { type: 'integer', example: 200 },
           status: { type: 'boolean', example: true },
           message: { type: 'string', example: '偏好風格更新成功' },
           data: { type: 'object', example: {} }
         }
       }
     }
   }
 }
 #swagger.responses[400] = {
   description: '並沒有這個風格',
   content: {
     'application/json': {
       schema: {
         type: 'object',
         properties: {
           statusCode: { type: 'integer', example: 400 },
           status: { type: 'boolean', example: false },
           message: { type: 'string', example: '請提供正確的風格參數' }
         }
       }
     }
   }
 }
 #swagger.responses[400] = {
   description: '請提供風格',
   content: {
     'application/json': {
       schema: {
         type: 'object',
         properties: {
           statusCode: { type: 'integer', example: 400 },
           status: { type: 'boolean', example: false },
           message: { type: 'string', example: '請提供正確的風格參數' }
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
   description: '伺服器錯誤，資料更新失敗',
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
  const { styles }: { styles: string[] } = req.body;

  if (!validateStyles(styles)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的風格' }, res);
  }

  try {
    const userId = req.user!.userId;
    const IsupdatedUserStyleSuccessful = await updateUserStyle(userId, styles);
    if (!IsupdatedUserStyleSuccessful) {
      return errorHandler({ statusCode: 404, message: '找不到使用者' }, res);
    }
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '偏好風格更新成功',
      data: {},
    });
  } catch (error) {
    return errorHandler(error as { statusCode: number; message: string }, res);
  }
});

// // 使用者偏好設定 - 修改場合
userRouter.patch('/preferences/occasions', authMiddleWare, async (req, res) => {
  /*
  #swagger.tags = ['User']
  #swagger.summary = '切換場合'
  #swagger.description = '更新目前登入使用者的偏好場合，需要攜帶 Bearer Token'
  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['occasionId'],
          properties: {
            occasionId: {
              type: 'string',
              example: 'socialGathering',
              description: '使用者偏好場合，例如：socialGathering / campusCasual / businessCasual / professional'
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: '偏好場合更新成功',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 200 },
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: '偏好場合更新成功' },
            data: { type: 'object', example: {} }
          }
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: '請提供場合 / 並沒有這個場合',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: '請提供正確的場合參數' }
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
  #swagger.responses[404] = {
    description: '找不到使用者',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 404 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: '找不到使用者' }
          }
        }
      }
    }
  }
  #swagger.responses[500] = {
    description: '伺服器錯誤，資料更新失敗',
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
  const { occasionId }: { occasionId: string } = req.body;

  if (!validateOccasions(occasionId)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的場合' }, res);
  }

  try {
    const userId = req.user!.userId;
    const IsupdatedUserOccasionSuccessful = await updateUserOccasion(userId, occasionId);
    if (!IsupdatedUserOccasionSuccessful) {
      return errorHandler({ statusCode: 404, message: '找不到使用者' }, res);
    }
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '偏好場合更新成功',
      data: {},
    });
  } catch (error) {
    return errorHandler(error as { statusCode: number; message: string }, res);
  }
});

// 使用者定位
userRouter.post('/location', authMiddleWare, async (req, res) => {
  /*
  #swagger.tags = ['User']
  #swagger.summary = '更新使用者定位'
  #swagger.description = '更新目前登入使用者的經緯度定位，需要攜帶 Bearer Token。備註：如果使用者沒有授權，請將參數 {longitude, latitude} 都各自帶入 null 給後端。'
  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['longitude', 'latitude'],
          properties: {
            longitude: {
              type: 'number',
              nullable: true,
              example: 121.5654,
              description: '經度 (若使用者沒有授權請帶入 null)'
            },
            latitude: {
              type: 'number',
              nullable: true,
              example: 25.033,
              description: '緯度 (若使用者沒有授權請帶入 null)'
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: '定位更新成功',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 200 },
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: '定位更新成功' },
            data: { type: 'object', example: {} }
          }
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: '請提供正確的經緯度',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: '請提供正確的經緯度' }
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
  #swagger.responses[404] = {
    description: '找不到使用者',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 404 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: '找不到使用者' }
          }
        }
      }
    }
  }
  #swagger.responses[500] = {
    description: '伺服器錯誤，資料更新失敗',
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
  const { longitude, latitude } = req.body;
  let tempLong = longitude;
  let tempLat = latitude;

  if (validateUserAuthorization(tempLong, tempLat)) {
    tempLong = defaultLocation.longitude;
    tempLat = defaultLocation.latitude;
  }

  if (!validateLocation(tempLong, tempLat)) {
    return errorHandler({ statusCode: 400, message: '請提供正確的經緯度' }, res);
  }

  tempLong = roundCoordinate(tempLong);
  tempLat = roundCoordinate(tempLat);

  try {
    const userId = req.user!.userId;
    const isUpdatedUserLocationSuccessful = await updateUserLocation(userId, tempLong, tempLat);
    if (!isUpdatedUserLocationSuccessful) {
      return errorHandler({ statusCode: 404, message: '找不到使用者' }, res);
    }
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '定位更新成功',
      data: {},
    });
  } catch (error) {
    return errorHandler(error as { statusCode: number; message: string }, res);
  }
})

userRouter.get('/information', authMiddleWare, async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = '取得使用者資訊'
    #swagger.description = '取得目前登入使用者的個人資訊，包含姓名、大頭貼、性別、偏好設定、定位與行程穿搭狀態等，需要攜帶 Bearer Token'
    #swagger.security = [{ "bearerAuth": [] }]
  
    #swagger.responses[200] = {
      description: '取得使用者資訊成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 200 },
              status: { type: 'boolean', example: true },
              message: { type: 'string', example: '取得使用者資訊成功' },
              data: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: '王小明', description: '使用者姓名' },
                  picture: { type: 'string', example: 'https://example.com/avatar.jpg', description: '大頭貼 URL' },
                  gender: { type: 'string', example: 'male', description: '性別（male / female）' },
                  preferences: {
                    type: 'object',
                    properties: {
                      colors: { type: 'array', items: { type: 'string' }, example: ['black', 'white'] },
                      styles: { type: 'array', items: { type: 'string' }, example: ['simple', 'street'] },
                      occasions: { type: 'string', example: 'socialGathering' }
                    }
                  },
                  location: {
                    type: 'object',
                    properties: {
                      longitude: { type: 'number', example: 121.56 },
                      latitude: { type: 'number', example: 25.037 }
                    }
                  },
                  hasTodayCalendarEvent: { type: 'boolean', example: false, description: '今日有行事曆行程且已設定穿搭' },
                  hasTodayCalendarEventWithoutOutfit: { type: 'boolean', example: false, description: '今日有行事曆行程但尚未設定穿搭' },
                  hasTomorrowCalendarEvent: { type: 'boolean', example: false, description: '明日有行事曆行程且已設定穿搭' },
                  hasTomorrowCalendarEventWithoutOutfit: { type: 'boolean', example: false, description: '明日有行事曆行程但尚未設定穿搭' },
                  todayCalendarEventOccasion: { type: 'string', example: '', description: '今日行程的場合 id，沒有則為空字串' },
                  tomorrowCalendarEventOccasion: { type: 'string', example: '', description: '明日行程的場合 id，沒有則為空字串' },
                  hasOutfitGeneratedToday: { type: 'boolean', example: false, description: '今日是否已經生成過穿搭' },
                  hasOutfitGeneratedTomorrow: { type: 'boolean', example: false, description: '明日是否已經生成過穿搭' }
                }
              }
            }
          }
        }
      }
    }
  
    #swagger.responses[401] = {
      description: '未提供 Token 或格式錯誤 / 無效的 Token 格式 / 無效的憑證或憑證已過期，請重新登入',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 401 },
              status: { type: 'boolean', example: false },
              message: { type: 'string', example: '無效的憑證或憑證已過期，請重新登入' },
              data: { type: 'object', example: null }
            }
          }
        }
      }
    }
  
    #swagger.responses[404] = {
      description: '找不到使用者',
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
      description: '伺服器錯誤，資料讀取失敗',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 500 },
              status: { type: 'boolean', example: false },
              message: { type: 'string', example: '伺服器發生錯誤，資料讀取失敗，請稍後再試' },
              data: { type: 'object', example: null }
            }
          }
        }
      }
    }
  */
  try {
    const userId = req.user!.userId;
    const userInformation = await getUserInformation(userId);
    if (!userInformation) {
      return errorHandler({ statusCode: 404, message: '找不到使用者' }, res);
    }
    const [outfitGeneratedToday, outfitGeneratedTomorrow] = await Promise.all([
      checkOutfitGeneratedToday(userId),
      checkOutfitGeneratedTomorrow(userId),
    ]);
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '取得使用者資訊成功',
      data: {
        name: userInformation.name,
        picture: userInformation.picture,
        gender: userInformation.gender,
        preferences: userInformation.preferences,
        location: userInformation.location,
        hasTodayCalendarEvent: userInformation.hasTodayCalendarEvent && outfitGeneratedToday,
        hasTodayCalendarEventWithoutOutfit: userInformation.hasTodayCalendarEvent && !outfitGeneratedToday,
        hasTomorrowCalendarEvent: userInformation.hasTomorrowCalendarEvent && outfitGeneratedTomorrow,
        hasTomorrowCalendarEventWithoutOutfit: userInformation.hasTomorrowCalendarEvent && !outfitGeneratedTomorrow,
        todayCalendarEventOccasion: userInformation.todayCalendarEventOccasion,
        tomorrowCalendarEventOccasion: userInformation.tomorrowCalendarEventOccasion,
        hasOutfitGeneratedToday: outfitGeneratedToday,
        hasOutfitGeneratedTomorrow: outfitGeneratedTomorrow,
      },
    });
  } catch (error) {
    return errorHandler(error as { statusCode: number; message: string }, res);
  }
})

export { userRouter };
