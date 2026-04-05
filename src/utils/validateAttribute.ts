// 驗證屬性是否正確
import { COLORS_SET, STYLES_SET, OCCASIONS_SET, genderOptions } from '../constant/user';
import { CLOTHES_COLORS_SET, CLOTHES_OCCASIONS_SET, CLOTHES_SEASONS_SET, CLOTHES_CATEGORIES_SET } from '../constant/clothes';

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
  if (!colors || !Array.isArray(colors) || colors.length === 0) return false;
  return !colors.some(colorId => !COLORS_SET.find(colorSet => colorSet.colorId === colorId));
}

// 檢查風格是否符合格式以及規則
// 回傳 true 表示合法，false 表示不合法
export function validateStyles(styles: unknown): boolean {
  if (!styles || !Array.isArray(styles) || styles.length === 0) return false;
  return !styles.some(styleId => !STYLES_SET.find(styleSet => styleSet.styleId === styleId));
}

// 檢查場合是否符合格式以及規則
// 回傳 true 表示合法，false 表示不合法
export function validateOccasions(occasion: unknown): boolean {
  if (!occasion || typeof occasion !== 'string') return false;
  return !!OCCASIONS_SET.find(occasionSet => occasionSet.occasionId === occasion);
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
