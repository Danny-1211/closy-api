import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import { config } from '../config/env';

cloudinary.config({
  cloud_name: config.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// 上傳圖片到 cloudinary
async function uploadToCloudinary(imageBuffer: Buffer, folder = 'closy/system'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    stream.end(imageBuffer);
  });
}

// 從 cloudinary 下載圖片
async function downloadImgFromCloudinary(imageUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  } catch (err) {
    throw { statusCode: 500, message: '從 Cloudinary 下載圖片失敗' };
  }
}

export { uploadToCloudinary, downloadImgFromCloudinary };
