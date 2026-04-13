import { singleItem } from './clothes';
import { Preferences } from './user';

export type DayWeather = {
  temperature: string;
  weather: string;
  weatherCode: string;
  weatherDescription: string;
};

export type FilteredForecast = {
  today: DayWeather;
  tomorrow: DayWeather;
};

export type OutfitContext = {
  gender: string;
  occasion: Preferences['occasions'];
  styles: Preferences['styles'];
  colors: Preferences['colors'];
  items: singleItem[];
  weather: DayWeather
};

export type GeminiOutfitResponse = {
  selectedItems: { category: string; cloudImgUrl: string }[];
  reasoning: string;
};

// Service 層使用：圖片已下載為 Buffer
export type VirtualOutfitItem = {
  buffer: Buffer;
  category: string;
};

export type VirtualOutfitResponse = {
  imageUrl: string;
};
