import { OutfitItem } from './outfit';

type ThisOutfit = Pick<
  OutfitItem,
  | 'userId'
  | 'outfitImgUrl'
  | 'occasion'
  | 'selectedItems'
  | 'createdAt'
  | 'createdDateSimply'
  | '_id'
>;

// Google Calendar 子事件（同一天可能有多筆）
type GoogleEvent = {
  googleEventId: string;
  title: string;
  startTime: string;
  endTime: string;
};

// 單筆行程
type CalendarItem = {
  userId: string;
  calendarEventOccasion: string;
  scheduleDate: string;
  outfit?: ThisOutfit;
  source: 'local' | 'google';
  googleEvents?: GoogleEvent[];
};

export { CalendarItem, ThisOutfit, GoogleEvent };
