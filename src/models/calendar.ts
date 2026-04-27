import { Schema, model } from 'mongoose';
import * as CalendarType from '../types/calendar';
import { selectedItems } from '../types/outfit';

const selectedItemSchema = new Schema<selectedItems>(
  {
    cloudImgUrl: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    category: { type: String, required: true },
  },
  { _id: false }
);

const outfitSubSchema = new Schema<CalendarType.ThisOutfit>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    outfitImgUrl: { type: String, required: true },
    occasion: { type: String, required: true },
    selectedItems: { type: [selectedItemSchema], default: [] },
    createdAt: { type: Date, required: true },
    createdDateSimply: { type: String, required: true }
  }, { _id: false }
);

const calendarSchema = new Schema<CalendarType.CalendarItem>(
  {
    userId: { type: String, required: true, index: true },
    calendarEventOccasion: { type: String, required: true },
    scheduleDate: { type: String, required: true },
    outfit: { type: outfitSubSchema, required: false }
  }, { timestamps: true }
);

calendarSchema.index({ userId: 1, scheduleDate: 1 }, { unique: true });

export const Calendar = model('Calendar', calendarSchema);
