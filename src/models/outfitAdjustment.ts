import { Schema, model } from 'mongoose';
import { IOutfitAdjustment } from '../types/gemini';

const outfitAdjustmentSchema = new Schema<IOutfitAdjustment>(
  {
    userId: { type: String, required: true },
    prompt: { type: String, required: true },
    aiResponseText: { type: String, default: '' },
    originalImageUrl: { type: String, required: true },
    adjustedImageUrl: { type: String, default: '' },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 優化當日額度查詢的複合索引
outfitAdjustmentSchema.index({ userId: 1, createdAt: -1 });

// 原子保證同一 userId 最多只有一筆 processing，防止前端快速重試繞過併發鎖
// partialFilterExpression 讓 unique 約束只作用在 status === 'processing' 的文件上
outfitAdjustmentSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'processing' } }
);

export const OutfitAdjustment = model<IOutfitAdjustment>('OutfitAdjustment', outfitAdjustmentSchema);
