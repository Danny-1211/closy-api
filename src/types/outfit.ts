import { CLOTHES_OCCASIONS_SET } from '../constants/clothes'
import { singleItem } from './clothes';

type OccasionType = typeof CLOTHES_OCCASIONS_SET[number]['occasionId'];

type selectedItems = Pick<singleItem, 'cloudImgUrl' | 'name' | 'brand' | 'category'>;

type OutfitItem = {
    userId: string;
    outfitImgUrl: string;
    occasion: OccasionType;
    selectedItems: selectedItems[];
    createdAt: Date;
    updatedAt: Date;
};


export { OutfitItem, selectedItems, OccasionType }