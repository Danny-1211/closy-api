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
  selectedItemIds: string[];
  reasoning: string;
};
