import { Outfit } from "../models/outfit";
import { OutfitItem, OccasionSummaryItem } from "../types/outfit";
import { CLOTHES_OCCASIONS_SET } from "../constants/clothes";
import { formatDateSimply } from "../utils/datetime";

// 取得我的穿搭列表
export const getOutfits = async (userId: string, occasion: string) => {
  // 如果有放上 occasion 
  if (occasion) {
    return await Outfit.find({ userId, occasion });
  }
  return await Outfit.find({ userId });
}

// 收藏穿搭
export const addOutfit = async (outfitItem: Omit<OutfitItem, '_id' | 'createdAt' | 'updatedAt' | 'createdDateSimply'>) => {
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

// 取得場合以及總數
export const getOccasionSummary = async (userId: string) => {
  const summaryList: OccasionSummaryItem[] = await Promise.all(
    CLOTHES_OCCASIONS_SET.map(async (singleOccasion) => {
      const count = await Outfit.countDocuments({
        userId,
        occasion: singleOccasion.occasionId
      });

      const recentItems = await Outfit.find({
        userId,
        occasion: singleOccasion.occasionId
      }).sort({ createdAt: -1 }).limit(2).select('createdDateSimply createdAt');

      const recentDates = recentItems.map((item: OutfitItem) => {
        return item.createdDateSimply || formatDateSimply(item.createdAt);
      });

      return {
        occasionId: singleOccasion.occasionId,
        count,
        recentDates
      };
    })
  );

  return summaryList;
}


