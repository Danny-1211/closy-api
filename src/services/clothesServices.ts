import { Clothes } from '../models/clothes';
import * as ClothesType from '../types/clothes';

// 檢查該使用者是否已有相同 imageHash 的衣物
export const checkDuplicateByHash = async (userId: string, imageHash: string) => {
  const clothes = await Clothes.findOne({
    userId,
    'list.imageHash': imageHash,
  });
  return !!clothes;
}

// 取得使用者衣櫃清單
export const getUserClothes = async (userId: string) => {
  const clothes = await Clothes.findOne({ userId });
  return clothes?.list ?? [];
}

// 將單品加入衣櫃
export const addSingleItem = async (userId: string, singleItem: ClothesType.singleItem) => {
  const clothes = await Clothes.findOneAndUpdate(
    { userId },
    { $push: { list: singleItem } },
    {
      returnDocument: 'after',
      upsert: true
    }
  );
  return clothes;
}

// 刪除這位使用者衣櫃的某件單品
export const deleteSingleItem = async (userd: string, singleItemId: string) => {
  const clothes = await Clothes.findOneAndUpdate(
    { userId: userd },
    { $pull: { list: { _id: singleItemId } } },
    {
      returnDocument: 'after',
    }
  );
  return clothes;
}