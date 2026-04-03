import axios from 'axios';
import { config } from '../types/env';
import { uploadToCloudinary } from '../utils/cloudinary';

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

export { removeBg };

