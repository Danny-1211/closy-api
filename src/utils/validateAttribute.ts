// 驗證屬性是否正確
import { COLORS_SET, STYLES_SET, OCCASIONS_SET, genderOptions } from '../constant/user';

// 檢查性別是否符合格式以及規則
// 回傳 true 表示合法，false 表示不合法
export function validateGender(gender: string): boolean {
  if (!gender || typeof gender !== 'string' || !genderOptions.includes(gender as 'male' | 'female')) return false;
  return true;
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
  if (!occasion) return false;
  return !OCCASIONS_SET.find(occasionSet => occasionSet.occasionId === occasion);
}
