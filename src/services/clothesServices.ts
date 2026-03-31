import { Clothes } from '../models/clothes';
import * as ClothesType from '../types/clothes';

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