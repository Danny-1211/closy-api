import { Outfit } from "../models/outfit";
import { OutfitItem } from "../types/outfit";


export const addOutfit = async (outfitItem: Omit<OutfitItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    const outfit = new Outfit(outfitItem);
    return await outfit.save();
}