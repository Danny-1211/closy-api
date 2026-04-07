import { GoogleGenAI } from '@google/genai';
import { config } from '../types/env';
import { OUTFIT_SYSTEM_INSTRUCTION } from '../constants/gemini';
import { OutfitContext, GeminiOutfitResponse } from '../types/gemini';

const aiInstance = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

function buildOutfitPrompt(context: OutfitContext): string {
    const { gender, occasion, styles, colors } = context;

    return `
## 使用者資訊
- 性別：${gender === 'male' ? '男' : '女'}
- 場合：${occasion.occasionName}（${occasion.occasionId}
- 偏好風格：${styles.join('、') || '無'}
- 偏好色系：${colors.join('、') || '無'}

請根據以上資訊，選出最適合的穿搭組合。
    `.trim();
}

function isValidGeminiResponse(value: unknown): value is GeminiOutfitResponse {
    return (
        typeof value === 'object' &&
        value !== null &&
        Array.isArray((value as GeminiOutfitResponse).selectedItemIds) &&
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
