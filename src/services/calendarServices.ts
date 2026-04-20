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
export const addCalendarEvent = async (userId: string, scheduleDate: string, calendarEventOccasion: string, outfit: CalendarType.ThisOutfit) => {
  const newCalendarEvent = await Calendar.findOneAndUpdate(
    {
      userId: userId,
      scheduleDate: scheduleDate
    },
    {
      $set: {
        calendarEventOccasion: calendarEventOccasion,
        outfit: outfit
      }
    },
    {
      returnDocument: 'after',
      upsert: true,
      runValidators: true
    }
  );
  return newCalendarEvent;
};

