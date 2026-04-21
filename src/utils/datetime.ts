// 將 Date 轉為 "YYYY/MM/DD"（月、日補零）
export const formatDateSimply = (date: Date): string => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
};

// 根據 today/tomorrow 以台北時區回傳對應日期的 "YYYY/MM/DD"
export const getTargetDateSimply = (day: 'today' | 'tomorrow'): string => {
  const base = getTaipeiDayStart();
  if (day === 'tomorrow') {
    base.setUTCDate(base.getUTCDate() + 1);
  }
  // 以台北時區 +8 小時再取出年月日，避免 UTC 顯示日期
  const taipei = new Date(base.getTime() + 8 * 60 * 60 * 1000);
  const yyyy = taipei.getUTCFullYear();
  const mm = String(taipei.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(taipei.getUTCDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
};

// 回傳指定日期在 UTC+8 當天 00:00:00 的 UTC Date（用於每日額度查詢）
export function getTaipeiDayStart(date: Date = new Date()): Date {
  const UTC8_OFFSET_MS = 8 * 60 * 60 * 1000;
  const localMs = date.getTime() + UTC8_OFFSET_MS;
  const localDate = new Date(localMs);

  // 取得 UTC+8 的年月日，再轉回 UTC
  const year = localDate.getUTCFullYear();
  const month = localDate.getUTCMonth();
  const day = localDate.getUTCDate();

  return new Date(Date.UTC(year, month, day) - UTC8_OFFSET_MS);
}
