import { Calendar } from "../models/calendar";
import * as CalendarType from '../types/calendar';

// 取得行事曆行程列表
export const getCalendarList = async (userId: string) => {
  const calendarList = await Calendar.find({
    userId: userId
  }).sort({ scheduleDate: 1 });
  return calendarList;
};

// 新增行事曆行程
export const addCalendarEvent = async (userId: string, scheduleDate: string, calendarEventOccasion: string, outfit?: CalendarType.ThisOutfit) => {
  // 僅在有傳入 outfit 時才寫入該欄位，避免覆蓋為 undefined
  const setFields: Record<string, unknown> = {
    calendarEventOccasion: calendarEventOccasion
  };
  if (outfit !== undefined) setFields.outfit = outfit;

  const newCalendarEvent = await Calendar.findOneAndUpdate(
    {
      userId: userId,
      scheduleDate: scheduleDate
    },
    { $set: setFields },
    {
      returnDocument: 'after',
      upsert: true,
      runValidators: true
    }
  );
  return newCalendarEvent;
};

// 刪除行事曆行程
export const deleteCalendarEvent = async (userId: string, calendarId: string) => {

  const deleteCalendarEvent = await Calendar.findOneAndDelete({
    _id: calendarId,
    userId: userId
  }, {
    returnDocument: 'after',
  });
  return deleteCalendarEvent;
};

// 更新行事曆行程（只更新有傳入的欄位）
export const updateCalendarEvent = async (
  userId: string,
  calendarId: string,
  updates: Partial<Pick<CalendarType.CalendarItem, 'calendarEventOccasion' | 'scheduleDate'> & { outfit: CalendarType.ThisOutfit }>
) => {
  const setFields: Record<string, unknown> = {};
  if (updates.calendarEventOccasion !== undefined) setFields.calendarEventOccasion = updates.calendarEventOccasion;
  if (updates.scheduleDate !== undefined) setFields.scheduleDate = updates.scheduleDate;
  if (updates.outfit !== undefined) setFields.outfit = updates.outfit;

  const updated = await Calendar.findOneAndUpdate(
    { _id: calendarId, userId: userId },
    { $set: setFields },
    { returnDocument: 'after', runValidators: true }
  );
  return updated;
};