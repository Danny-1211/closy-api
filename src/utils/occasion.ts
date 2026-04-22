import { OCCASIONS_SET } from '../constants/user';

// 將場合 id 轉為中文標籤；找不到時回傳原字串作為 fallback
export const getOccasionLabel = (occasionId: string): string => {
  const match = OCCASIONS_SET.find((o) => o.occasionId === occasionId);
  return match ? match.occasionName : occasionId;
};
