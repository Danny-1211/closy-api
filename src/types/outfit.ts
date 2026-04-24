import { CLOTHES_OCCASIONS_SET } from '../constants/clothes'
import { singleItem } from './clothes';

type OccasionType = typeof CLOTHES_OCCASIONS_SET[number]['occasionId'];

type selectedItems = Pick<singleItem, 'cloudImgUrl' | 'name' | 'brand' | 'category'>;

type OutfitItem = {
  _id: string;
  userId: string;
  outfitImgUrl: string;
  occasion: OccasionType;
  selectedItems: selectedItems[];
  outfitDate: string;
  createdAt: Date;
  updatedAt: Date;
  createdDateSimply: string;
};

type OccasionSummaryItem = {
  occasionId: OccasionType;
  count: number;
  recentDates: string[];
};


export { OutfitItem, selectedItems, OccasionType, OccasionSummaryItem }