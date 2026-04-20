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
