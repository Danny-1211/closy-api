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

// 取得這位使用者衣櫃的某件單品
export const getUserSpecificClothes = async (userId: string, singleItemId: string) => {
  const singleItem = await Clothes.findOne(
    { userId, "list._id": singleItemId },
    { "list.$": 1 }
  );
  return singleItem;
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
export const deleteSingleItem = async (userId: string, singleItemId: string) => {
  const singleItem = await Clothes.findOneAndUpdate(
    { userId: userId, 'list._id': singleItemId },
    { $pull: { list: { _id: singleItemId } } },
    {
      returnDocument: 'after',
    }
  );
  return singleItem;
}

// 更新這位使用者衣櫃的某件單品
export const updateSingleItem = async (userId: string, singleItemId: string, updateData: Partial<ClothesType.singleItem>) => {
  const allowedKeys = [
    'category', 'name', 'color', 'occasions',
    'seasons', 'brand', 'cloudImgUrl', 'imageHash'
  ];

  const updateFields: Record<string, any> = {};

  Object.entries(updateData).forEach(([key, value]) => {
    if (allowedKeys.includes(key)) {
      updateFields[`list.$.${key}`] = value;
    }
  })

  const updatedClothes = await Clothes.findOneAndUpdate(
    { userId: userId, "list._id": singleItemId },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  // 如果找不到這件衣服或衣櫃，就回傳 null
  if (!updatedClothes) return null;

  const updatedItem = updatedClothes.list.find(
    (item) => item._id?.toString() === singleItemId
  );

  return updatedItem;
}