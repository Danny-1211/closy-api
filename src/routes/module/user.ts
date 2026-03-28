import express from 'express';
import { errorHandler } from '../../utils/errorMessage';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { updateUserGender, updateUserColor, updateUserStyle, updateUserOccasion } from '../../services/userService';
import { COLORS_SET, STYLES_SET, OCCASIONS_SET, genderOptions } from '../../constant/user';

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

  if (!gender || !genderOptions.includes(gender)) {
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
  if (!colors) {
    return errorHandler({ statusCode: 400, message: '請提供色系' }, res);
  }

  const hasInvalidColor = colors.some(colorId => !COLORS_SET.find(colorSet => colorSet.colorId === colorId));

  if (hasInvalidColor) {
    return errorHandler({ statusCode: 400, message: '並沒有這個色系' }, res);
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

})

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

  if (!styles || styles.length === 0) {
    return errorHandler({ statusCode: 400, message: '請提供風格' }, res);
  }

  const hasInvalidStyle = styles.some(styleId => !STYLES_SET.find(styleSet => styleSet.styleId === styleId));

  if (hasInvalidStyle) {
    return errorHandler({ statusCode: 400, message: '並沒有這個風格' }, res);
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
})

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

  if (!occasionId) {
    return errorHandler({ statusCode: 400, message: '請提供場合' }, res);
  }

  const hasInvalidOccasion = OCCASIONS_SET.find(occasionSet => occasionSet.occasionId === occasionId);

  if (!hasInvalidOccasion) {
    return errorHandler({ statusCode: 400, message: '並沒有這個場合' }, res);
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
})

export { userRouter };