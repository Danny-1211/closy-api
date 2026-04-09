import { singleItem } from './clothes';
import { Preferences } from './user'

export type OutfitContext = {
  gender: string;
  occasion: Preferences['occasions'];
  styles: Preferences['styles'];
  colors: Preferences['colors'];
  items: singleItem[];
};

export type GeminiOutfitResponse = {
  selectedItemUrls: string[];
  reasoning: string;
};

export type ForecastEntry = {
    dt: number;
    dt_txt: string;
    [key: string]: any;
};
