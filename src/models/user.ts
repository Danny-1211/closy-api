import { Schema, model } from 'mongoose';
import * as UserType from '../types/user';
// 使用者定位
const locationSchema = new Schema<UserType.Location>(
  {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false },
);

// 使用者偏好
const preferencesSchema = new Schema<UserType.Preferences>(
  {
    styles: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    occasions: { type: String, default: '' },
  },
  { _id: false },
);

// 使用者資訊
const userSchema = new Schema<UserType.User>(
  {
    googleId: { type: String, default: '' },
    email: { type: String, default: '' },
    name: { type: String, default: '' },
    picture: { type: String, default: '' },
    gender: { type: String, default: '' },
    preferences: {
      type: preferencesSchema,
      default: () => ({ styles: [], colors: [], occasions: '' }),
    },
    location: { type: locationSchema, default: () => ({ latitude: null, longitude: null }) },
    // 今日是否有行程（供前端介面渲染）
    hasTodayCalendarEvent: { type: Boolean, default: false },
    // 明日是否有行程（供前端介面渲染）
    hasTomorrowCalendarEvent: { type: Boolean, default: false },
    // 今日行程的場合 id，沒有則為空字串
    todayCalendarEventOccasion: { type: String, default: '' },
    // 明日行程的場合 id，沒有則為空字串
    tomorrowCalendarEventOccasion: { type: String, default: '' },
  },
  { timestamps: true, collection: 'users' },
);

export const User = model('User', userSchema);
