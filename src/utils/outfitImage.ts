import sharp from 'sharp';

const PERSON_TARGET = { width: 474, height: 1362 } as const;
const MANNEQUIN_MAX_WIDTH_RATIO = 0.78;
const MANNEQUIN_MAX_HEIGHT_RATIO = 0.84;
const OUTPUT_DISPLAY_SIZE = { width: 139, height: 400 } as const;

// 前處理人台圖：縮放至安全範圍，置中在白色畫布上
export async function preprocessMannequinImage(buffer: Buffer): Promise<Buffer> {
  const innerWidth = Math.round(PERSON_TARGET.width * MANNEQUIN_MAX_WIDTH_RATIO);
  const innerHeight = Math.round(PERSON_TARGET.height * MANNEQUIN_MAX_HEIGHT_RATIO);

  const resized = await sharp(buffer)
    .resize(innerWidth, innerHeight, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      withoutEnlargement: true,
      position: "center",
    })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  const metadata = await sharp(resized).metadata();
  const left = Math.max(0, Math.floor((PERSON_TARGET.width - (metadata.width ?? 0)) / 2));
  const top = Math.max(0, Math.floor((PERSON_TARGET.height - (metadata.height ?? 0)) / 2));

  return sharp({
    create: {
      width: PERSON_TARGET.width,
      height: PERSON_TARGET.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

// 後處理生成圖：裁切並縮放至前端顯示尺寸
export async function postProcessGeneratedImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(OUTPUT_DISPLAY_SIZE.width, OUTPUT_DISPLAY_SIZE.height, {
      fit: 'cover',
      position: 'attention',
    })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}
