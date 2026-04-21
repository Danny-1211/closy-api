import { Calendar } from "../models/calendar";
import * as CalendarType from '../types/calendar';
import { getTargetDateSimply } from '../utils/datetime';

// 以使用者與日期（YYYY/MM/DD）查詢單筆行程（呼叫端自行傳入已格式化好的日期）
export const getCalendarEventByDate = async (userId: string, scheduleDate: string) => {
  const event = await Calendar.findOne({
    userId: userId,
    scheduleDate: scheduleDate,
  });
  return event;
};

// 根據今日與明日的行程資料，組出使用者文件需要的 4 個快照欄位
export const computeUserCalendarSnapshot = async (userId: string) => {
  const todayDate = getTargetDateSimply('today');
  const tomorrowDate = getTargetDateSimply('tomorrow');
  const [todayEvent, tomorrowEvent] = await Promise.all([
    getCalendarEventByDate(userId, todayDate),
    getCalendarEventByDate(userId, tomorrowDate),
  ]);
  return {
    hasTodayCalendarEvent: !!todayEvent,
    hasTomorrowCalendarEvent: !!tomorrowEvent,
    todayCalendarEventOccasion: todayEvent?.calendarEventOccasion ?? '',
    tomorrowCalendarEventOccasion: tomorrowEvent?.calendarEventOccasion ?? '',
  };
};

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
  updates: Partial<Pick<CalendarType.CalendarItem, 'calendarEventOccasion' | 'scheduleDate'> & { outfit: CalendarType.ThisOutfit | null }>
) => {
  const setFields: Record<string, unknown> = {};
  const unsetFields: Record<string, string> = {};
  if (updates.calendarEventOccasion !== undefined) setFields.calendarEventOccasion = updates.calendarEventOccasion;
  if (updates.scheduleDate !== undefined) setFields.scheduleDate = updates.scheduleDate;
  if (updates.outfit === null) {
    unsetFields.outfit = '';
  } else if (updates.outfit !== undefined) {
    setFields.outfit = updates.outfit;
  }

  const mongoUpdate: Record<string, unknown> = {};
  if (Object.keys(setFields).length > 0) mongoUpdate.$set = setFields;
  if (Object.keys(unsetFields).length > 0) mongoUpdate.$unset = unsetFields;

  const updated = await Calendar.findOneAndUpdate(
    { _id: calendarId, userId: userId },
    mongoUpdate,
    { returnDocument: 'after', runValidators: true }
  );
  return updated;
};