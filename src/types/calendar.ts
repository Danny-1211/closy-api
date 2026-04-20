import { OutfitItem } from './outfit';

type ThisOutfit = Pick<OutfitItem, 'userId' | 'outfitImgUrl' | 'occasion' | 'selectedItems' | 'createdAt' | 'createdDateSimply'>;

// 單筆行程
type CalendarItem = {
  userId: string;
  calendarEventOccasion: string;
  scheduleDate: string;
  outfit?: ThisOutfit
}


export { CalendarItem, ThisOutfit };


