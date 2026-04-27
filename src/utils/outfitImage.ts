import sharp from 'sharp';

const PERSON_TARGET = { width: 474, height: 1362 } as const;
const OUTPUT_DISPLAY_SIZE = { width: 139, height: 400 } as const;
const API_TARGET_WIDTH = 766;

export async function preprocessMannequinImage(buffer: Buffer): Promise<Buffer> {
  const SUPER_SAFE_WIDTH_RATIO = 0.55;
  const SUPER_SAFE_HEIGHT_RATIO = 0.65;

  const innerWidth = Math.round(PERSON_TARGET.width * SUPER_SAFE_WIDTH_RATIO);
  const innerHeight = Math.round(PERSON_TARGET.height * SUPER_SAFE_HEIGHT_RATIO);

  // 1. 先把人台大幅縮小
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

  // 2. 計算在 9:16 畫布中的置中位置
  const left = Math.max(0, Math.floor((API_TARGET_WIDTH - (metadata.width ?? 0)) / 2));
  const PUSH_DOWN_OFFSET = 50;
  const top = Math.max(0, Math.floor((PERSON_TARGET.height - (metadata.height ?? 0)) / 2) + PUSH_DOWN_OFFSET);

  // 3. 輸出 9:16 大畫布
  return sharp({
    create: {
      width: API_TARGET_WIDTH,
      height: PERSON_TARGET.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

export async function postProcessGeneratedImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(OUTPUT_DISPLAY_SIZE.width, OUTPUT_DISPLAY_SIZE.height, {
      fit: 'cover',
      position: 'center', // 確保置中裁切，只切左右，保留上下
      background: { r: 250, g: 250, b: 250, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}