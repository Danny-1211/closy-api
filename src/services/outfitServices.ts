import { Outfit } from "../models/outfit";
import { OutfitItem } from "../types/outfit";

// 取得我的穿搭列表
export const getOutfits = async (userId: string, occasion: string) => {
    // 如果有放上 occasion 
    if (occasion) {
        return await Outfit.find({ userId, occasion });
    }
    return await Outfit.find({ userId });
}

// 收藏穿搭
export const addOutfit = async (outfitItem: Omit<OutfitItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    const outfit = new Outfit(outfitItem);
    return await outfit.save();
}

// 刪除穿搭
export const deleteOutfit = async (userId: string, outfitId: string) => {
    const singleOutfitItem = await Outfit.findOneAndDelete({
        _id: outfitId,
        userId: userId
    }, {
        returnDocument: 'after',
    });
    return singleOutfitItem;
}

