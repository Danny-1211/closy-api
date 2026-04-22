type Preferences = {
  styles: string[];
  colors: string[];
  occasions: string;
};

type Location = {
  latitude: number | null;
  longitude: number | null;
};

type User = {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  gender: string;
  preferences: Preferences;
  location: Location;
  // 今日是否有行事曆行程（僅供前端介面渲染；後端邏輯仍以 Calendar collection 為真）
  hasTodayCalendarEvent: boolean;
  // 明日是否有行事曆行程（僅供前端介面渲染）
  hasTomorrowCalendarEvent: boolean;
  // 今日行程的場合 id，沒有則為空字串
  todayCalendarEventOccasion: string;
  // 明日行程的場合 id，沒有則為空字串
  tomorrowCalendarEventOccasion: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export { Location, Preferences, User };
