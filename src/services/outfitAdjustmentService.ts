import { Types } from 'mongoose';
import { OutfitAdjustment } from '../models/outfitAdjustment';
import { IOutfitAdjustment } from '../types/gemini';

// 查詢今日已完成次數（UTC+8 當日起算）
export async function countCompletedToday(userId: string, dayStart: Date): Promise<number> {
  return OutfitAdjustment.countDocuments({ userId, status: 'completed', createdAt: { $gte: dayStart } });
}

// 建立一筆 processing 紀錄
// 若同一 userId 已有 processing 紀錄，MongoDB unique index 會拋出 E11000
// 呼叫端捕捉後回傳 429，避免「先 find 再 create」的 race condition
export async function createAdjustmentRecord(data: {
  userId: string;
  prompt: string;
  originalImageUrl: string;
}) {
  try {
    return await OutfitAdjustment.create({ ...data, status: 'processing' });
  } catch (err: any) {
    if (err.code === 11000) {
      throw { statusCode: 429, message: '有一筆微調正在進行中，請等待完成後再試' };
    }
    throw err;
  }
}

// 以 id 更新紀錄狀態（通用，供 failed 標記使用）
export async function updateAdjustmentRecord(id: Types.ObjectId, update: Partial<IOutfitAdjustment>) {
  return OutfitAdjustment.findByIdAndUpdate(id, update);
}

// 條件式完成：只有紀錄仍為 processing 時才更新為 completed
// 防止前端斷線後 failed 被背景流程覆寫
export async function completeIfProcessing(id: Types.ObjectId, update: Partial<IOutfitAdjustment>) {
  return OutfitAdjustment.findOneAndUpdate(
    { _id: id, status: 'processing' },
    update
  );
}
