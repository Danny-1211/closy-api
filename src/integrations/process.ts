import axios from 'axios';
import { config } from '../types/env';
import { uploadToCloudinary } from './cloudinary';

// 將傳進來的圖片去背，並上傳至 Cloudinary
async function removeBg(image: Buffer): Promise<string> {
  const form = new FormData();
  const imageUint8 = new Uint8Array(image);
  const blob = new Blob([imageUint8], { type: 'image/png' });
  form.append('file', blob, 'image.png');

  const response = await axios.post('https://fntxxx-rembg-service.hf.space/remove-bg', form, {
    headers: {
      Authorization: `Bearer ${config.PICTURE_TOKEN}`,
    },
    responseType: 'arraybuffer',
  });

  const imageUrl = await uploadToCloudinary(Buffer.from(response.data), '/closy/system');
  return imageUrl;
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
