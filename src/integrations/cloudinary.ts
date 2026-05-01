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

// 從 Cloudinary URL 解析出 public_id（含資料夾路徑，不含副檔名）
function extractPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  return match?.[1] ?? null;
}

// 依 public_id 刪除 Cloudinary 上的圖片
async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { uploadToCloudinary, downloadImgFromCloudinary, extractPublicIdFromUrl, deleteFromCloudinary };
