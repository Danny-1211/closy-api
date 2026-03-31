import { Schema, model } from 'mongoose';
import * as ClothesType from '../types/clothes';

// 單品屬性
const singleItemSchema = new Schema<ClothesType.singleItem>(
    {
        category: { type: String, default: '' },
        name: { type: String, default: '' },
        color: { type: String, default: '' },
        occasions: { type: [String], default: [] },
        seasons: { type: [String], default: [] },
        brand: { type: String, default: '' },
        cloudImgUrl: { type: String, default: '' },
    },
    { timestamps: true },
);

// 使用者衣物（我的衣櫃）
const clothesSchema = new Schema<ClothesType.Clothes>(
    {
        userId: { type: String, default: '' },
        list: { type: [singleItemSchema], default: [] },
        pagination: { type: Object, default: {} },
    },
    { timestamps: true, collection: 'clothes' },
);

export const Clothes = model('Clothes', clothesSchema);


