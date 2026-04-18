import express from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../../config/env';

const devRouter = express.Router();

// 強制附加的 JSON 回傳格式規則（此部分不可被使用者修改）
const FORCED_JSON_RULE = `
7. 回傳格式必須是合法的 JSON，結構如下：
{
  "selectedItems": [
    { "category": "<category>", "name": "<name>", "brand": "brand ?  <brand>: \\"\\" ", "cloudImgUrl": "<cloudImgUrl>" }
  ],
  "occasion": "使用者資訊: 場合的 value ( occasions )",
  "reasoning": "搭配理由（繁體中文，2-4句）"
}`;

// gemini.ts 的絕對路徑
const GEMINI_CONSTANTS_PATH = path.join(process.cwd(), 'src', 'constants', 'gemini.ts');

// 取得前端所需的公開設定（GOOGLE_CLIENT_ID）
devRouter.get('/config', (_req, res) => {
  res.json({ googleClientId: config.GOOGLE_CLIENT_ID });
});

// 讀取目前的 OUTFIT_SYSTEM_INSTRUCTION，去除第 6 條後回傳可編輯部分
devRouter.get('/outfit-instruction', (_req, res) => {
  try {
    const fileContent = fs.readFileSync(GEMINI_CONSTANTS_PATH, 'utf-8');
    const match = fileContent.match(/export const OUTFIT_SYSTEM_INSTRUCTION = `([\s\S]*?)`;/);
    if (!match || match[1] === undefined) {
      return res.status(500).json({ message: '無法解析 OUTFIT_SYSTEM_INSTRUCTION' });
    }
    // 找到第 6 條的起始位置並截斷，只回傳可編輯部分
    const fullInstruction = match[1];
    const rule6Index = fullInstruction.indexOf('\n7. 回傳格式');
    const editablePart = rule6Index !== -1 ? fullInstruction.slice(0, rule6Index) : fullInstruction;
    return res.json({ instruction: editablePart });
  } catch {
    return res.status(500).json({ message: '讀取 gemini.ts 失敗' });
  }
});

// 更新 OUTFIT_SYSTEM_INSTRUCTION，強制附加第 6 條 JSON 格式規則後寫入檔案
devRouter.put('/outfit-instruction', (req, res) => {
  try {
    const { instruction } = req.body;
    if (typeof instruction !== 'string') {
      return res.status(400).json({ message: 'instruction 必須為字串' });
    }
    // 組合最終指令：使用者編輯部分 + 強制附加的 JSON 格式規則
    const finalInstruction = instruction.trimEnd() + FORCED_JSON_RULE;
    const fileContent = fs.readFileSync(GEMINI_CONSTANTS_PATH, 'utf-8');
    const updated = fileContent.replace(
      /export const OUTFIT_SYSTEM_INSTRUCTION = `[\s\S]*?`;/,
      `export const OUTFIT_SYSTEM_INSTRUCTION = \`${finalInstruction}\`;`
    );
    fs.writeFileSync(GEMINI_CONSTANTS_PATH, updated, 'utf-8');
    return res.json({ message: '指令已更新，伺服器重啟中...' });
  } catch {
    return res.status(500).json({ message: '更新 gemini.ts 失敗' });
  }
});

// 驗證測試頁密碼，比對 config.TEST_PASSWORD
devRouter.post('/verify-test-password', (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: '請提供密碼' });
  }
  if (!config.TEST_PASSWORD) {
    return res.status(500).json({ success: false, message: '伺服器未設定 TEST_PASSWORD' });
  }
  if (password === config.TEST_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: '密碼錯誤' });
});

export { devRouter };
