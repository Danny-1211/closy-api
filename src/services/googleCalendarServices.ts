import { Calendar } from '../models/calendar';
import { GoogleEvent } from '../types/calendar';

// 將 integrations 層整理好的 Google 事件（按日期分組）同步到 Calendar collection
export const syncGoogleCalendarEvents = async (
  userId: string,
  eventsByDate: Map<string, GoogleEvent[]>,
): Promise<void> => {
  const incomingDates = Array.from(eventsByDate.keys());

  // 對每個有 Google 事件的日期進行 upsert
  for (const [scheduleDate, googleEvents] of eventsByDate) {
    const existing = await Calendar.findOne({ userId, scheduleDate });

    if (existing && existing.source === 'local') {
      // Google 優先：覆蓋本地事項
      await Calendar.findOneAndUpdate(
        { userId, scheduleDate },
        {
          $set: {
            source: 'google',
            googleEvents,
            calendarEventOccasion: '',
            outfit: undefined,
          },
          $unset: { outfit: '' },
        },
      );
    } else if (existing && existing.source === 'google') {
      // 保留使用者設定的 occasion 和 outfit，只更新 googleEvents
      await Calendar.findOneAndUpdate(
        { userId, scheduleDate },
        { $set: { googleEvents } },
      );
    } else {
      // 新增 Google 事項
      await Calendar.create({
        userId,
        scheduleDate,
        source: 'google',
        calendarEventOccasion: '',
        googleEvents,
      });
    }
  }

  // 移除已不在 Google 回傳清單中的 google 事項
  await Calendar.deleteMany({
    userId,
    source: 'google',
    scheduleDate: { $nin: incomingDates },
  });
};
