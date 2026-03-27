import express from 'express';
import { errorHandler } from '../../utils/errorMessage';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { updateUserGender, updateUserColor } from '../../services/userService';
import { COLORS_SET } from '../../constant/color';

const userRouter = express.Router();
const genderOptions = ['male', 'female'];
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
// userRouter.patch('/preferences/styles', authMiddleWare, async (req, res) => {

// })

// // 使用者偏好設定 - 修改場合
// userRouter.patch('/preferences/occasions', authMiddleWare, async (req, res) => {

// })

export { userRouter };