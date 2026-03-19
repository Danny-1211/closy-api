import { Schema, model } from "mongoose";
import * as UserType from '../types/user';
// 使用者定位
const locationSchema = new Schema<UserType.Location>({
  latitude: { type: Number, default: null },
  longtitude: { type: Number, default: null },
}, { _id: false });

// 使用者偏好
const preferencesSchema = new Schema<UserType.Preferences>({
  styles: { type: [String], default: [] },
  colors: { type: [String], default: [] },
  occasions: { type: [String], default: [] },
}, { _id: false });

// 使用者資訊
const userSchema = new Schema<UserType.User>({
  googleId: String,
  email: String,
  name: String,
  picture: String,
  gender: String,
  preferences: preferencesSchema,
  location: locationSchema,
}, { timestamps: true, collection: 'users' });

export const User = model('User', userSchema);
