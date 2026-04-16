// 驗證屬性是否正確
import { COLORS_SET, STYLES_SET, OCCASIONS_SET, genderOptions } from '../constants/user';
import { CLOTHES_COLORS_SET, CLOTHES_OCCASIONS_SET, CLOTHES_SEASONS_SET, CLOTHES_CATEGORIES_SET } from '../constants/clothes';
import { OccasionType } from '../types/outfit';

// ── User 偏好設定驗證 ──────────────────────────────────────────

// 檢查性別是否符合格式以及規則
// 回傳 true 表示合法，false 表示不合法
export function validateGender(gender: unknown): boolean {
  if (!gender || typeof gender !== 'string') return false;
  return genderOptions.includes(gender as 'male' | 'female');
}

// 檢查顏色是否符合格式以及規則
// 回傳 true 表示合法，false 表示不合法
export function validateColors(colors: unknown): boolean {
  if (!colors || !Array.isArray(colors)) return false;
  return !colors.some(colorId => !COLORS_SET.find(colorSet => colorSet.colorId === colorId));
}

// 檢查風格是否符合格式以及規則
// 回傳 true 表示合法，false 表示不合法
export function validateStyles(styles: unknown): boolean {
  if (!styles || !Array.isArray(styles)) return false;
  return !styles.some(styleId => !STYLES_SET.find(styleSet => styleSet.styleId === styleId));
}

// 檢查場合是否符合格式以及規則
// 回傳 true 表示合法，false 表示不合法
export function validateOccasions(occasion: unknown): boolean {
  if (!occasion || typeof occasion !== 'string') return false;
  return !!OCCASIONS_SET.find(occasionSet => occasionSet.occasionId === occasion);
}

// 檢查使用者有沒有授權，是否需要使用預設座標
// 回傳 true 表示沒有授權需要使用預設座標， false 表示有授權不需使用預設座標
export function validateUserAuthorization(longitude: unknown, latitude: unknown): boolean {
  if (typeof longitude === 'number' && typeof latitude === 'number') return false;
  return true;
}

// 將經緯度四捨五入到小數第三位（給 OpenWeather API 使用）
export function roundCoordinate(value: number): number {
  return Math.round(value * 1000) / 1000;
}

// 檢查前端提供經緯度是否符合格式以及規則
// 回傳 true 表示合法， false 表示不合法
export function validateLocation(longitude: number, latitude: number): boolean {
  if (Number.isNaN(longitude) || Number.isNaN(latitude)) return false;
  if (longitude < -180 || longitude > 180) return false;
  if (latitude < -90 || latitude > 90) return false;
  return true;
}

// ── 單品（Clothes）驗證 ────────────────────────────────────────

// 檢查單品類別是否符合 CLOTHES_CATEGORIES_SET
// 回傳 true 表示合法，false 表示不合法
export function validateClothesCategory(category: unknown): boolean {
  if (!category || typeof category !== 'string') return false;
  return !!CLOTHES_CATEGORIES_SET.find(c => c.categoryId === category);
}

// 檢查單品顏色是否符合 CLOTHES_COLORS_SET
// 回傳 true 表示合法，false 表示不合法
export function validateClothesColor(color: unknown): boolean {
  if (!color || typeof color !== 'string') return false;
  return !!CLOTHES_COLORS_SET.find(c => c.colorId === color);
}

// 檢查單品場合是否符合 CLOTHES_OCCASIONS_SET
// 回傳 true 表示合法，false 表示不合法
export function validateClothesOccasions(occasions: unknown): boolean {
  if (!occasions || !Array.isArray(occasions) || occasions.length === 0) return false;
  return !occasions.some(id => !CLOTHES_OCCASIONS_SET.find(o => o.occasionId === id));
}

// 檢查單品季節是否符合 CLOTHES_SEASONS_SET
// 回傳 true 表示合法，false 表示不合法
export function validateClothesSeasons(seasons: unknown): boolean {
  if (!seasons || !Array.isArray(seasons) || seasons.length === 0) return false;
  return !seasons.some(id => !CLOTHES_SEASONS_SET.find(s => s.seasonId === id));
}

// 檢查 PATCH 更新單品時的 partial 欄位是否合法
// 只驗證前端有帶進來的 key（用 'key' in body 判斷），回傳 true 表示合法，false 表示不合法
export function validateClothesPartialItem(body: unknown): boolean {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  if ('category' in b && !validateClothesCategory(b.category)) return false;
  if ('color' in b && !validateClothesColor(b.color)) return false;
  if ('occasions' in b && !validateClothesOccasions(b.occasions)) return false;
  if ('seasons' in b && !validateClothesSeasons(b.seasons)) return false;
  if ('name' in b && (typeof b.name !== 'string' || !b.name)) return false;
  if ('brand' in b && typeof b.brand !== 'string') return false;
  if ('cloudImgUrl' in b && (typeof b.cloudImgUrl !== 'string' || !b.cloudImgUrl)) return false;
  if ('imageHash' in b && typeof b.imageHash !== 'string') return false;
  return true;
}

// 檢查單品所有必填欄位是否完整且合法
// 回傳 true 表示全部合法，false 表示至少有一項不合法
export function validateClothesItem(body: {
  category: unknown;
  cloudImgUrl: unknown;
  name: unknown;
  color: unknown;
  occasions: unknown;
  seasons: unknown;
  brand: unknown;
}): boolean {
  const { category, cloudImgUrl, name, color, occasions, seasons, brand } = body;
  if (!cloudImgUrl || typeof cloudImgUrl !== 'string') return false;
  if (!name || typeof name !== 'string') return false;
  if (typeof brand !== 'string') return false;
  if (!validateClothesCategory(category)) return false;
  if (!validateClothesColor(color)) return false;
  if (!validateClothesOccasions(occasions)) return false;
  if (!validateClothesSeasons(seasons)) return false;
  return true;
}

// ── 穿搭（Outfit）驗證 ────────────────────────────────────────

export function validateOutfitOccasion(occasion: unknown): occasion is OccasionType {
  if (typeof occasion !== 'string') return false;
  return !!CLOTHES_OCCASIONS_SET.find(occasionSet => occasionSet.occasionId === occasion);
}