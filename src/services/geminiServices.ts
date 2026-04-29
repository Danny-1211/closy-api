import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { OUTFIT_ADJUSTMENT_SYSTEM_INSTRUCTION, OUTFIT_SYSTEM_INSTRUCTION, VIRTUAL_OUTFIT_BASE_DIRECTIVES } from '../constants/gemini';
import { OutfitAdjustmentContext, OutfitContext, GeminiOutfitResponse, VirtualOutfitItem } from '../types/gemini';
import { preprocessMannequinImage, postProcessGeneratedImage } from '../utils/outfitImage';
import { abortable } from '../utils/abortable';

const aiInstance = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

function buildOutfitPrompt(context: OutfitContext): string {
  const { gender, occasion, styles, colors, items } = context;

  const itemList = items
    .map((item, i) => {
      return `${i + 1}. 圖片URL: ${item.cloudImgUrl} | 類別: ${item.category} | 名稱: ${item.name} | 顏色: ${item.color} | 場合: ${item.occasions.join('、')} | 季節: ${item.seasons.join('、')}`;
    })
    .join('\n');

  return `
## 使用者資訊
- 性別：${gender === 'male' ? '男' : '女'}
- 場合：${occasion}
- 偏好風格：${styles.join('、') || '無'}
- 偏好色系：${colors.join('、') || '無'}

## 衣櫃清單
${itemList || '（無衣物）'}

## 天氣資訊
- 天氣：${context.weather.temperature} | ${context.weather.weatherDescription}
    `.trim();
}

function isValidGeminiResponse(value: unknown): value is GeminiOutfitResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as GeminiOutfitResponse).selectedItems) &&
    (value as GeminiOutfitResponse).selectedItems.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { category: string; cloudImgUrl: string; name: string; brand: string }).category === 'string' &&
        typeof (item as { category: string; cloudImgUrl: string; name: string; brand: string }).cloudImgUrl === 'string' &&
        typeof (item as { category: string; cloudImgUrl: string; name: string; brand: string }).name === 'string' &&
        typeof (item as { category: string; cloudImgUrl: string; name: string; brand: string }).brand === 'string'
    ) &&
    typeof (value as GeminiOutfitResponse).reasoning === 'string'
  );
}

export async function generateOutfitRecommendation(context: OutfitContext): Promise<GeminiOutfitResponse> {
  const prompt = buildOutfitPrompt(context);

  const response = await aiInstance.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: OUTFIT_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  if (!text) {
    throw { statusCode: 500, message: 'AI 未回傳結果，請稍後再試' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw { statusCode: 500, message: 'AI 推薦結果格式錯誤' };
  }

  if (!isValidGeminiResponse(parsed)) {
    throw { statusCode: 500, message: 'AI 推薦結果格式錯誤' };
  }

  return parsed;
}

// 微調 prompt：沿用 buildOutfitPrompt 主體，附加目前穿搭與調整需求
function buildAdjustmentPrompt(context: OutfitAdjustmentContext): string {
  const basePrompt = buildOutfitPrompt(context);
  const currentList = context.currentSelectedItems
    .map((item, i) => `${i + 1}. 類別: ${item.category} | 名稱: ${item.name} | 品牌: ${item.brand || '無'} | URL: ${item.cloudImgUrl}`)
    .join('\n');

  return `${basePrompt}

## 目前已選穿搭
${currentList}

## 本次調整需求
${context.adjustmentPrompt}`;
}

function buildVirtualOutfitPrompt(clothesItems: VirtualOutfitItem[]): string {
  const hasDress = clothesItems.some(item => item.category === 'dress');
  const hasTop = clothesItems.some(item => item.category === 'top');
  const hasLowerBody = clothesItems.some(item => ['bottom', 'skirt'].includes(item.category));

  let modeLines: string[] = [];
  const lowerBodyLines: string[] = [];
  const referenceLines: string[] = [];
  let refCount = 2;

  for (const item of clothesItems) {
    if (item.category === 'dress') {
      referenceLines.push(`Reference image ${refCount}: One-piece dress. Apply seamlessly to the torso and legs.`);
    } else if (item.category === 'top') {
      referenceLines.push(`Reference image ${refCount}: Upper body top. Apply seamlessly to the torso.`);
    } else if (item.category === 'bottom') {
      referenceLines.push(`Reference image ${refCount}: Lower body pants/bottom. Apply seamlessly to the waist and legs.`);
    } else if (item.category === 'skirt') {
      referenceLines.push(`Reference image ${refCount}: Lower body skirt. Apply seamlessly to the waist and legs.`);
    } else if (item.category === 'outerwear') {
      referenceLines.push(`Reference image ${refCount}: Outerwear. Must be worn as an outer layer.`);
    } else if (item.category === 'shoes') {
      referenceLines.push(`Reference image ${refCount}: Footwear. Place exactly on the dummy's feet.`);
    }
    refCount++;
  }

  if (hasDress) {
    modeLines = [
      'Outfit mode: One-piece dress look.',
      'The dress is the single main garment. Dress shoulders must align precisely with the dummy shoulders.',
      'Do not invent extra layers or separate the dress into two pieces.',
    ];
  } else if (hasTop && hasLowerBody) {
    modeLines = [
      'Outfit mode: Separates (Top + Bottom).',
      'The top and bottom are two distinct garments. Do not merge them into a jumpsuit or dress.',
      'The waist connection must look natural. Allow only a slight natural overlap at the center front waist; do not create floating gaps.',
    ];
    lowerBodyLines.push(
      'Keep the lower garment fitted to the original dummy proportions. Do not arbitrarily widen the hips or legs.',
    );
  } else if (hasTop && !hasLowerBody) {
    modeLines = [
      'Outfit mode: Top-only. The dummy wears ONLY the upper body garment.',
      'Do not generate pants, skirts, or shoes. The lower body must remain bare (matching the featureless off-white background).',
    ];
  } else if (!hasTop && hasLowerBody) {
    modeLines = [
      'Outfit mode: Bottom-only. The dummy wears ONLY the lower body garment.',
      'Do not generate shirts or tops. The upper body must remain bare.',
    ];
  }

  return [
    ...VIRTUAL_OUTFIT_BASE_DIRECTIVES,
    ...modeLines,
    ...lowerBodyLines,
    '--- GARMENT REFERENCES ---',
    ...referenceLines,
    '--- FINAL SAFETY RECHECK ---',
    '- Is the abstract featureless head still there? IT MUST BE PRESERVED.',
    '- Is it free of human faces or hair? IT MUST REMAIN FACELESS.',
    '- Are the feet and head uncropped? IT MUST NOT BE CROPPED.',
  ].join('\n');
}

// 呼叫 Gemini 文字模型，依調整需求從衣櫃挑出新的 selectedItems
// signal 為選填，未傳入時行為與舊版一致
export async function adjustOutfitSelection(
  context: OutfitAdjustmentContext,
  signal?: AbortSignal
): Promise<GeminiOutfitResponse> {
  const prompt = buildAdjustmentPrompt(context);

  const response = await abortable(
    aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: OUTFIT_ADJUSTMENT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    }),
    signal
  );

  const text = response.text;
  if (!text) {
    throw { statusCode: 500, message: 'AI 未回傳結果，請稍後再試' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw { statusCode: 500, message: 'AI 微調結果格式錯誤' };
  }

  if (!isValidGeminiResponse(parsed)) {
    throw { statusCode: 500, message: 'AI 微調結果格式錯誤' };
  }

  return parsed;
}

// signal 為選填，未傳入時行為與舊版一致（home.ts 推薦流程不傳 signal）
export async function generateVirtualOutfitImage(
  modelBuffer: Buffer,
  clothesItems: VirtualOutfitItem[],
  signal?: AbortSignal
): Promise<Buffer> {
  const strictPrompt = buildVirtualOutfitPrompt(clothesItems);
  const processedModelBuffer = await preprocessMannequinImage(modelBuffer);

  const response = await abortable(
    aiInstance.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            { text: strictPrompt },
            { inlineData: { mimeType: 'image/png', data: processedModelBuffer.toString('base64') } },
            ...clothesItems.map(item => ({
              inlineData: { mimeType: 'image/jpeg', data: item.buffer.toString('base64') },
            })),
          ],
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '9:16',
          imageSize: '1K',
        },
      },
    }),
    signal
  );
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find(p => p.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw { statusCode: 500, message: 'AI 未回傳圖片，請稍後再試' };
  }

  const rawBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
  return postProcessGeneratedImage(rawBuffer);
}
