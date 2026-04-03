import { v2 as cloudinary } from 'cloudinary';
import { config } from '../types/env';

cloudinary.config({
  cloud_name: config.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

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

export { uploadToCloudinary };
