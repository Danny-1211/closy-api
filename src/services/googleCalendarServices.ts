import { AnyBulkWriteOperation } from 'mongoose';
import { Calendar } from '../models/calendar';
import { CalendarItem, GoogleEvent } from '../types/calendar';

// 將 integrations 層整理好的 Google 事件（按日期分組）同步到 Calendar collection
export const syncGoogleCalendarEvents = async (
  userId: string,
  eventsByDate: Map<string, GoogleEvent[]>,
): Promise<void> => {
  const incomingDates = Array.from(eventsByDate.keys());

  // 對每個有 Google 事件的日期進行 upsert（批次處理）
  if (incomingDates.length > 0) {
    const bulkOps: AnyBulkWriteOperation<CalendarItem>[] = [];

    for (const [scheduleDate, googleEvents] of eventsByDate) {
      // Google 優先：若本地事項存在則覆蓋 occasion/outfit
      bulkOps.push({
        updateOne: {
          filter: { userId, scheduleDate, source: 'local' },
          update: {
            $set: { source: 'google', googleEvents, calendarEventOccasion: '' },
            $unset: { outfit: '' },
          },
        },
      });

      // 更新既有 google 事項，或新增；保留使用者設定的 occasion/outfit
      bulkOps.push({
        updateOne: {
          filter: { userId, scheduleDate, source: { $ne: 'local' } },
          update: {
            $set: { googleEvents },
            $setOnInsert: { source: 'google', calendarEventOccasion: '' },
          },
          upsert: true,
        },
      });
    }

    await Calendar.bulkWrite(bulkOps);
  }

  // 移除已不在 Google 回傳清單中的 google 事項
  await Calendar.deleteMany({
    userId,
    source: 'google',
    scheduleDate: { $nin: incomingDates },
  });
};
