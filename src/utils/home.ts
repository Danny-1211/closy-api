import { computeUserCalendarSnapshot } from '../services/calendarServices';
import { updateUserCalendarSnapshot } from '../services/userServices';
import { getOccasionLabel } from './occasion';
import { DayWeather, GeminiOutfitResponse } from '../types/gemini';

// 為了避免相依過多 Calendar 型別，這裡用結構化型別描述方案 B 需要的欄位
type CalendarEventLike = {
  calendarEventOccasion: string;
  outfit?: {
    outfitImgUrl?: string;
    selectedItems?: GeminiOutfitResponse['selectedItems'];
  } | null;
};

// 方案 B：拼出 GET /home 需要的 reasoning 字串
export const buildCalendarReasoning = (occasionId: string, weather: DayWeather): string => {
  const occasionLabel = getOccasionLabel(occasionId);
  return `你已為今天的行程挑選這套穿搭。 ${weather.temperature}°C ${weather.weatherDescription}，這套衣服非常適合今日的 ${occasionLabel} 場合。`;
};

// 方案 B：把 Calendar 的資料整理成與方案 A Gemini 回傳相同形狀的 recommendation
export const buildCalendarRecommendation = (
  calendarEvent: CalendarEventLike,
  selectedWeather: DayWeather
): GeminiOutfitResponse & { occasion: string } => {
  return {
    selectedItems: calendarEvent.outfit?.selectedItems ?? [],
    occasion: calendarEvent.calendarEventOccasion,
    reasoning: buildCalendarReasoning(calendarEvent.calendarEventOccasion, selectedWeather),
  };
};

// 方案 B（POST /home/outfit）：若 Calendar 已有 outfitImgUrl 則回傳該字串，否則回 null
export const resolveCalendarOutfitImgUrl = (calendarEvent: CalendarEventLike | null): string | null => {
  const url = calendarEvent?.outfit?.outfitImgUrl;
  return typeof url === 'string' && url.length > 0 ? url : null;
};

// 重新計算並寫回使用者文件上的 4 個行事曆快照欄位；供 home / calendar 路由共用
export const refreshUserCalendarSnapshot = async (userId: string) => {
  const snapshot = await computeUserCalendarSnapshot(userId);
  await updateUserCalendarSnapshot(userId, snapshot);
  return snapshot;
};
