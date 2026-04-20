import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import {
  countCompletedToday,
  createAdjustmentRecord,
  updateAdjustmentRecord,
  completeIfProcessing,
} from '../../services/outfitAdjustmentService';
import { runAdjustmentSelection, runAdjustmentImageGeneration } from '../../integrations/outfitAdjustment';
import { getTaipeiDayStart } from '../../utils/datetime';
import { OutfitAdjustmentRequestBody, OutfitAdjustmentSSEEvent } from '../../types/gemini';

const outfitAdjustmentRouter = express.Router();

const MAX_DAILY_LIMIT = 3;

// SSE 推送工具
function sendSSE(res: express.Response, event: OutfitAdjustmentSSEEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }
}

// GET /outfit-adjustment/quota — 取得今日剩餘微調次數
outfitAdjustmentRouter.get('/quota', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['OutfitAdjustment']
     #swagger.summary = '取得今日剩餘微調次數'
     #swagger.description = '回傳目前登入使用者今日剩餘的 AI 穿搭微調次數（每日上限 3 次，以 UTC+8 凌晨 00:00 重置），需要攜帶 Bearer Token'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.responses[200] = {
       description: '取得成功',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'number', example: 200 },
               status: { type: 'boolean', example: true },
               message: { type: 'string', example: '取得今日剩餘次數成功' },
               data: {
                 type: 'object',
                 properties: {
                   maxLimit: { type: 'number', example: 3 },
                   used: { type: 'number', example: 1 },
                   remaining: { type: 'number', example: 2 }
                 }
               }
             }
           }
         }
       }
     }
     #swagger.responses[401] = {
       description: '未提供或無效的 Token',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'number', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '未提供 Token 或格式錯誤' },
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
               statusCode: { type: 'number', example: 500 },
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
    const dayStart = getTaipeiDayStart();

    const used = await countCompletedToday(userId, dayStart);

    const remaining = Math.max(0, MAX_DAILY_LIMIT - used);

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: '取得今日剩餘次數成功',
      data: { maxLimit: MAX_DAILY_LIMIT, used, remaining },
    });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }
});

// POST /outfit-adjustment/stream — 送出微調需求（SSE 串流）
outfitAdjustmentRouter.post('/stream', authMiddleWare, async (req, res) => {
  /* #swagger.tags = ['OutfitAdjustment']
     #swagger.summary = '送出 AI 穿搭微調需求（SSE 串流）'
     #swagger.description = '接收使用者的微調需求，以 SSE 串流依序回傳處理狀態，AI 生成完成後回傳調整後圖片 URL。每日上限 3 次（以 UTC+8 為準），需要攜帶 Bearer Token。\n\n回傳格式為 text/event-stream，每個 event 為一行 `data: {...}` 的 JSON。'
     #swagger.security = [{ "bearerAuth": [] }]

     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['prompt', 'originalImageUrl', 'selectedItems', 'day'],
             properties: {
               prompt: { type: 'string', example: '都在冷氣房，幫我加件薄外套' },
               originalImageUrl: { type: 'string', example: 'https://res.cloudinary.com/test/image.jpg' },
               day: { type: 'string', enum: ['today', 'tomorrow'], example: 'today' },
               selectedItems: {
                 type: 'array',
                 description: '目前穿搭的衣物清單',
                 items: {
                   type: 'object',
                   required: ['cloudImgUrl', 'category', 'name', 'brand'],
                   properties: {
                     cloudImgUrl: { type: 'string', example: 'https://res.cloudinary.com/test/item.jpg' },
                     category: { type: 'string', enum: ['top', 'bottom', 'outerwear', 'shoes', 'skirt', 'dress'], example: 'top' },
                     name: { type: 'string', example: '白色基本款 T-shirt' },
                     brand: { type: 'string', example: 'UNIQLO' }
                   }
                 }
               }
             }
           }
         }
       }
     }

     #swagger.responses[400] = {
       description: '缺少必要參數',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'number', example: 400 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '缺少必要參數' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
     #swagger.responses[403] = {
       description: '今日調整次數已達上限',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'number', example: 403 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '今日調整次數已達上限' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
     #swagger.responses[429] = {
       description: '有一筆微調正在進行中，請等待完成後再試',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'number', example: 429 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '有一筆微調正在進行中，請等待完成後再試' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
     #swagger.responses[401] = {
       description: '未提供或無效的 Token',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               statusCode: { type: 'number', example: 401 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '未提供 Token 或格式錯誤' },
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
               statusCode: { type: 'number', example: 500 },
               status: { type: 'boolean', example: false },
               message: { type: 'string', example: '伺服器發生不可預期的錯誤' },
               data: { type: 'object', example: null }
             }
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'SSE 串流（Content-Type: text/event-stream）。處理中會推送 step 1、step 2，成功時推送 completed event。若發生預期外錯誤則會推送 error event。',
       content: {
         'text/event-stream': {
           schema: { type: 'string', example: 'data: {"status":"completed","data":{"text":"...","originalImageUrl":"...","adjustedImageUrl":"...","selectedItems":[]}}' }
         }
       }
     }
  */
  const body = req.body as OutfitAdjustmentRequestBody;
  const { prompt, originalImageUrl, selectedItems, day } = body;

  // 驗參（此時 SSE 尚未開始，用 errorHandler 回 JSON）
  if (!prompt || !prompt.trim()) {
    return errorHandler({ statusCode: 400, message: '缺少必要參數' }, res);
  }
  if (!originalImageUrl) {
    return errorHandler({ statusCode: 400, message: '缺少必要參數' }, res);
  }
  if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
    return errorHandler({ statusCode: 400, message: '缺少必要參數' }, res);
  }
  if (day !== 'today' && day !== 'tomorrow') {
    return errorHandler({ statusCode: 400, message: '缺少必要參數' }, res);
  }

  const userId = req.user!.userId;
  const dayStart = getTaipeiDayStart();

  // 額度檢查
  const used = await countCompletedToday(userId, dayStart);
  if (used >= MAX_DAILY_LIMIT) {
    return errorHandler({ statusCode: 403, message: '今日調整次數已達上限' }, res);
  }

  // 建立 processing 紀錄（若已有一筆 processing，DB unique index 會拋 429）
  let record;
  try {
    record = await createAdjustmentRecord({ userId, prompt: prompt.trim(), originalImageUrl });
  } catch (err) {
    return errorHandler(err as { statusCode: number; message: string }, res);
  }

  // ── 開始 SSE 串流 ──────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.socket?.setNoDelay(true);
  res.flushHeaders();

  const abortController = new AbortController();

  // aborted 旗標：明確標記前端已斷線，避免背景流程完成後覆寫 failed 狀態
  let aborted = false;

  // 前端斷線：只 abort，intentionally 不立即標記 DB 為 failed。
  // 原因：DB 的 processing 狀態就是「併發鎖」，必須等 catch block 執行後才釋放，
  // 否則 unique index 保護在 Gemini 仍跑的情況下就消失，惡意使用者可立刻重試。
  req.on('close', () => {
    aborted = true;
    abortController.abort();
  });

  try {
    sendSSE(res, { status: 'processing', step: 1, message: '分析需求中' });

    // 語意挑選衣物
    const selectionResult = await runAdjustmentSelection(
      userId,
      prompt.trim(),
      selectedItems,
      day,
      abortController.signal
    );

    sendSSE(res, { status: 'processing', step: 2, message: '生成穿搭中' });

    // 虛擬試穿生圖
    const result = await runAdjustmentImageGeneration(
      userId,
      selectionResult,
      abortController.signal
    );

    // 條件式寫入完成：只有紀錄仍為 processing 才會更新（前端斷線後已是 failed，不會被覆寫）
    await completeIfProcessing(record._id, {
      status: 'completed',
      aiResponseText: result.aiResponseText,
      adjustedImageUrl: result.adjustedImageUrl,
    });

    // 若前端已斷線，不推送 completed event（res 已關閉）
    if (!aborted) {
      sendSSE(res, {
        status: 'completed',
        data: {
          text: result.aiResponseText,
          originalImageUrl,
          adjustedImageUrl: result.adjustedImageUrl,
          selectedItems: result.selectedItems,
        },
      });
    }

    res.end();
  } catch (err) {
    const error = err as { statusCode?: number; message?: string };

    // 不論原因（含 499 前端取消）都標記 failed，processing 鎖在此才釋放
    // 499 時 SSE 已關閉，跳過推送；其他錯誤則推送 error event 給前端
    await updateAdjustmentRecord(record._id, { status: 'failed' });
    if (error.statusCode !== 499) {
      sendSSE(res, { status: 'error', message: error.message || '生成失敗，請稍後再試' });
    }

    res.end();
  }
});

export { outfitAdjustmentRouter };
