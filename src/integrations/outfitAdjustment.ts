import path from 'path';
import fs from 'fs';
import { adjustOutfitSelection, generateVirtualOutfitImage } from '../services/geminiServices';
import { getUserClothes } from '../services/clothesServices';
import { getUserInformation } from '../services/userServices';
import { getWeather } from './openWeather';
import { downloadImgFromCloudinary, uploadToCloudinary } from './cloudinary';
import { postProcessGeneratedImage } from '../utils/outfitImage';
import { abortable } from '../utils/abortable';
import {
  OutfitAdjustmentResult,
  OutfitAdjustmentSelectedItem,
  OutfitAdjustmentSelectionResult,
  VirtualOutfitItem,
} from '../types/gemini';

// Stage 1：語意挑選衣物（Gemini 文字模型根據 prompt 從衣櫃重新組合搭配）
export async function runAdjustmentSelection(
  userId: string,
  adjustmentPrompt: string,
  currentSelectedItems: OutfitAdjustmentSelectedItem[],
  day: 'today' | 'tomorrow',
  signal?: AbortSignal
): Promise<OutfitAdjustmentSelectionResult> {
  // 組出與推薦流程相同的 OutfitContext
  const user = await getUserInformation(userId);
  if (!user) throw { statusCode: 404, message: '找不到使用者' };

  if (signal?.aborted) throw { statusCode: 499, message: '請求已取消' };

  const [clothesList, weather] = await Promise.all([
    getUserClothes(userId),
    getWeather(user.location),
  ]);

  if (signal?.aborted) throw { statusCode: 499, message: '請求已取消' };

  // 依前端指定的 day 取對應天氣資料（today / tomorrow）
  const selectedWeather = weather.weatherDataSet[day];

  // 呼叫 Gemini 文字模型挑選調整後衣物（透傳 signal，前端斷線時提早離開）
  const adjustmentResult = await adjustOutfitSelection(
    {
      gender: user.gender,
      occasion: user.preferences.occasions,
      styles: user.preferences.styles,
      colors: user.preferences.colors,
      items: clothesList.map((item: any) => item.toObject ? item.toObject() : item),
      weather: selectedWeather,
      currentSelectedItems,
      adjustmentPrompt,
    },
    signal
  );

  return {
    gender: user.gender || 'male',
    selectedItems: adjustmentResult.selectedItems,
    reasoning: adjustmentResult.reasoning,
  };
}

// Stage 2：虛擬試穿生圖（以 Stage 1 挑出的衣物進行合成，上傳 Cloudinary）
export async function runAdjustmentImageGeneration(
  userId: string,
  selectionResult: OutfitAdjustmentSelectionResult,
  signal?: AbortSignal
): Promise<OutfitAdjustmentResult> {
  if (signal?.aborted) throw { statusCode: 499, message: '請求已取消' };

  const modelPath = path.join(process.cwd(), 'public', `${selectionResult.gender}.webp`);

  // 讀取 mannequin 圖與下載衣物圖片（並行，任一步驟在 abort 後提早結束）
  const [modelBuffer, clothesItems] = await Promise.all([
    abortable(fs.promises.readFile(modelPath), signal),
    Promise.all(
      selectionResult.selectedItems.map(async (item): Promise<VirtualOutfitItem> => ({
        buffer: await abortable(downloadImgFromCloudinary(item.cloudImgUrl), signal),
        category: item.category,
      }))
    ),
  ]);

  if (signal?.aborted) throw { statusCode: 499, message: '請求已取消' };

  // 虛擬試穿 → 後處理 → 上傳 Cloudinary（透傳 signal）
  const rawBuffer = await generateVirtualOutfitImage(modelBuffer, clothesItems, signal);
  const processedBuffer = await postProcessGeneratedImage(rawBuffer);
  const adjustedImageUrl = await abortable(
    uploadToCloudinary(processedBuffer, `closy/users/outfits/${userId}/adjustments`),
    signal
  );

  return {
    adjustedImageUrl,
    aiResponseText: selectionResult.reasoning,
    selectedItems: selectionResult.selectedItems,
  };
}
