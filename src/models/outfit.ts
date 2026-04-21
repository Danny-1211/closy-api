import { Schema, model } from 'mongoose';
import * as OutfitType from '../types/outfit';
import { formatDateSimply } from '../utils/datetime';

const selectedItemsSchema = new Schema<OutfitType.selectedItems>(
  {
    cloudImgUrl: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    category: { type: String, required: true },
  },
  { _id: false }
);

const outfitItemSchema = new Schema<OutfitType.OutfitItem>(
  {
    userId: { type: String, required: true, index: true },
    outfitImgUrl: { type: String, required: true },
    occasion: { type: String, required: true, index: true },
    selectedItems: { type: [selectedItemsSchema], default: [] },
    createdDateSimply: { type: String, required: true, default: () => formatDateSimply(new Date()) }
  },
  { timestamps: true }
);

outfitItemSchema.index({ userId: 1, occasion: 1 });

export const Outfit = model('Outfit', outfitItemSchema);