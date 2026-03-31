// multer 上傳圖片檔案檢查
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = Object.assign(new Error('不支援的檔案格式，請上傳 jpg、png、webp 格式的圖片'), { statusCode: 400 });
    cb(err);
  }
}

const uploadMiddleWare = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

function uploadSingleImage(req: Request, res: Response, next: NextFunction) {
  uploadMiddleWare.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(Object.assign(err, { statusCode: 400 }));
    }
    next(err);
  });
}

export { uploadSingleImage };
