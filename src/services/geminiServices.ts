import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { OUTFIT_SYSTEM_INSTRUCTION, VIRTUAL_OUTFIT_BASE_DIRECTIVES } from '../constants/gemini';
import { OutfitContext, GeminiOutfitResponse, VirtualOutfitItem } from '../types/gemini';
import { preprocessMannequinImage, postProcessGeneratedImage } from '../utils/outfitImage';

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
        typeof (item as { category: string; cloudImgUrl: string }).category === 'string' &&
        typeof (item as { category: string; cloudImgUrl: string }).cloudImgUrl === 'string'
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
      referenceLines.push(`Reference image ${refCount}: One-piece garment / dress (primary reference). Preserve the exact garment identity, silhouette, color, material, and length.`);
    } else if (item.category === 'top') {
      referenceLines.push(`Reference image ${refCount}: Upper body garment (top). Preserve the exact top design, hem silhouette, and original material.`);
    } else if (item.category === 'bottom') {
      referenceLines.push(`Reference image ${refCount}: Lower body garment (pants/bottom). Preserve the exact silhouette and fit.`);
    } else if (item.category === 'skirt') {
      referenceLines.push(`Reference image ${refCount}: Lower body garment (skirt). Preserve the exact silhouette, length, and material.`);
    } else if (item.category === 'outerwear') {
      referenceLines.push(`Reference image ${refCount}: Outerwear garment. It must remain clearly visible as a separate outer layer without replacing the inner garments.`);
    } else if (item.category === 'shoes') {
      referenceLines.push(`Reference image ${refCount}: Footwear (shoes). Place on the mannequin's feet and preserve the exact shoe design, silhouette, and color.`);
    }
    refCount++;
  }

  if (hasDress) {
    modeLines = [
      'The outfit is a dress-based/one-piece look.',
      'The dress must remain a single main garment worn on the mannequin body.',
      'Do not turn the dress into separates and do not invent extra layers.',
      'Dress shoulders must align closely with the mannequin shoulders.',
      'The upper bodice must appear worn on the mannequin, not pasted beside it, and the dress should fit naturally to the torso and legs.',
    ];
  } else if (hasTop && hasLowerBody) {
    modeLines = [
      'The outfit is a separates look (top and bottom).',
      'The top and the bottom must remain two separate garments.',
      'Do not merge the top and lower piece into one dress, jumpsuit, or one-piece garment.',
      'Do not fully tuck the top into the lower garment and do not blend the two garments into a dress-like silhouette.',
      'The waist connection between the top and the lower garment must look natural, aligned, and worn together, without a floating gap.',
      'Allow only a very slight natural overlap at the center front waist if needed.',
    ];
    lowerBodyLines.push(
      'The bottom garment must fit naturally to the mannequin waist, hips, and leg position.',
      'Do not enlarge the lower body, do not widen the hips or legs, and keep the lower garment fitted to the original mannequin proportions.',
    );
  } else if (hasTop && !hasLowerBody) {
    modeLines = [
      'The outfit is a top-only look. The mannequin should only wear the provided upper body garment.',
      'Do not invent or generate pants, skirts, or any lower body garments.',
      'The lower body of the mannequin must remain bare (white and featureless).',
    ];
  } else if (!hasTop && hasLowerBody) {
    modeLines = [
      'The outfit is a bottom-only look. The mannequin should only wear the provided lower body garment.',
      'Do not invent or generate shirts, t-shirts, or any upper body garments.',
      'The upper body of the mannequin must remain bare (white and featureless).',
    ];
  }

  return [
    ...VIRTUAL_OUTFIT_BASE_DIRECTIVES,
    ...modeLines,
    ...lowerBodyLines,
    '--- GARMENT REFERENCES ---',
    ...referenceLines,
  ].join('\n');
}

export async function generateVirtualOutfitImage(
  modelBuffer: Buffer,
  clothesItems: VirtualOutfitItem[]
): Promise<Buffer> {
  const strictPrompt = buildVirtualOutfitPrompt(clothesItems);
  const processedModelBuffer = await preprocessMannequinImage(modelBuffer);

  const response = await aiInstance.models.generateContent({
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
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find(p => p.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw { statusCode: 500, message: 'AI 未回傳圖片，請稍後再試' };
  }

  const rawBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
  return postProcessGeneratedImage(rawBuffer);
}
