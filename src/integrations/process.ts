import axios from 'axios';
import crypto from 'crypto';
import { config } from '../types/env';
import { uploadToCloudinary } from './cloudinary';
import { checkDuplicateByHash } from '../services/clothesServices';

// 將傳進來的圖片去背，並上傳至 Cloudinary
async function removeBg(image: Buffer, userId: string) {
  const form = new FormData();
  const imageUint8 = new Uint8Array(image);
  const blob = new Blob([imageUint8], { type: 'image/pngetClothesImageAttributeg' });
  form.append('file', blob, 'image.png');

  const response = await axios.post('https://fntxxx-rembg-service.hf.space/remove-bg', form, {
    headers: {
      Authorization: `Bearer ${config.PICTURE_TOKEN}`,
    },
    responseType: 'arraybuffer',
  });

  const imageBuffer = Buffer.from(response.data);
  const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex');

  const isDuplicate = await checkDuplicateByHash(userId, imageHash);
  if (isDuplicate) {
    throw { statusCode: 409, message: '您已上傳過相同的衣物圖片' };
  }

  const imageUrl = await uploadToCloudinary(imageBuffer, 'closy/system');
  return { imageUrl, imageHash };
}

// 將傳進來的圖片進行屬性標籤辨識
async function getClothesImageAttribute(image: Buffer) {
  try {
    const form = new FormData();
    const imageUint8 = new Uint8Array(image);
    const blob = new Blob([imageUint8], { type: 'image/png' });
    form.append('image', blob, 'image.png');

    const response = await axios.post('https://fntxxx-fashion-attr-service.hf.space/predict', form, {
      headers: {
        Authorization: `Bearer ${config.PICTURE_TOKEN}`,
      },
    });

    return response.data.data;
  } catch {
    throw { statusCode: 500, message: 'AI 辨識衣物屬性失敗' };
  }
}

export { removeBg, getClothesImageAttribute };
