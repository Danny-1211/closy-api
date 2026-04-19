import { singleItem } from './clothes';
import { Preferences } from './user';

export type DayWeather = {
  temperature: string;
  weather: string;
  weatherCode: string;
  weatherDescription: string;
};

export type FilteredForecast = {
  today: DayWeather;
  tomorrow: DayWeather;
};

export type OutfitContext = {
  gender: string;
  occasion: Preferences['occasions'];
  styles: Preferences['styles'];
  colors: Preferences['colors'];
  items: singleItem[];
  weather: DayWeather
};

export type GeminiOutfitResponse = {
  selectedItems: { category: string; cloudImgUrl: string; name: string; brand: string }[];
  reasoning: string;
};

export type VirtualOutfitItem = {
  buffer: Buffer;
  category: string;
};

export type VirtualOutfitResponse = {
  imageUrl: string;
};

// ── 穿搭微調相關型別 ──────────────────────────────────────────

export type IOutfitAdjustment = {
  userId: string;
  prompt: string;
  aiResponseText: string;
  originalImageUrl: string;
  adjustedImageUrl: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
};

export type OutfitAdjustmentSelectedItem = {
  cloudImgUrl: string;
  category: string;
  name: string;
  brand: string;
};

export type OutfitAdjustmentRequestBody = {
  prompt: string;
  originalImageUrl: string;
  selectedItems: OutfitAdjustmentSelectedItem[];
  day: 'today' | 'tomorrow'; // 要以哪一天的天氣為基準進行穿搭調整
};

export type OutfitAdjustmentContext = OutfitContext & {
  currentSelectedItems: OutfitAdjustmentSelectedItem[];
  adjustmentPrompt: string;
};

export type OutfitAdjustmentSSEEvent =
  | { status: 'processing'; step: 1 | 2; message: string }
  | { status: 'completed'; data: { text: string; originalImageUrl: string; adjustedImageUrl: string; selectedItems: OutfitAdjustmentSelectedItem[] } }
  | { status: 'error'; message: string };

export type OutfitAdjustmentResult = {
  adjustedImageUrl: string;
  aiResponseText: string;
  selectedItems: OutfitAdjustmentSelectedItem[];
};

// runAdjustmentSelection 完成後的中間結果，供 route 層在兩個階段之間推 SSE
export type OutfitAdjustmentSelectionResult = {
  gender: string;                                // 用於選 mannequin 路徑
  selectedItems: OutfitAdjustmentSelectedItem[]; // 新的完整搭配清單
  reasoning: string;                             // AI 說明文字
};
