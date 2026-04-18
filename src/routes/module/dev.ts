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
    { "category": "<category>", "name": "<name>", "brand": "<brand>", "cloudImgUrl": "<cloudImgUrl>" }
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

// 讀取目前的 OUTFIT_SYSTEM_INSTRUCTION，去除第 7 條後回傳可編輯部分
devRouter.get('/outfit-instruction', (_req, res) => {
  try {
    const fileContent = fs.readFileSync(GEMINI_CONSTANTS_PATH, 'utf-8');
    const match = fileContent.match(/export const OUTFIT_SYSTEM_INSTRUCTION = `([\s\S]*?)`;/);
    if (!match || match[1] === undefined) {
      return res.status(500).json({ message: '無法解析 OUTFIT_SYSTEM_INSTRUCTION' });
    }
    // 找到第 7 條的起始位置並截斷，只回傳可編輯部分
    const fullInstruction = match[1];
    const rule7Index = fullInstruction.indexOf('\n7. 回傳格式');
    const editablePart = rule7Index !== -1 ? fullInstruction.slice(0, rule7Index) : fullInstruction;
    return res.json({ instruction: editablePart });
  } catch {
    return res.status(500).json({ message: '讀取 gemini.ts 失敗' });
  }
});

// 更新 OUTFIT_SYSTEM_INSTRUCTION，強制附加第 7 條 JSON 格式規則後寫入檔案
devRouter.put('/outfit-instruction', (req, res) => {
  try {
    const { instruction } = req.body;
    if (typeof instruction !== 'string') {
      return res.status(400).json({ message: 'instruction 必須為字串' });
    }
    // 反引號可跳脫 template literal 並注入任意程式碼
    if (instruction.includes('`')) {
      return res.status(400).json({ message: 'instruction 不可包含反引號（`）' });
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

const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 60 * 60 * 1000;

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}
const attemptMap = new Map<string, AttemptRecord>();

// 每小時清除已過期的鎖定記錄，避免 Map 無限成長
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of attemptMap) {
    if (record.lockedUntil && now >= record.lockedUntil) {
      attemptMap.delete(ip);
    }
  }
}, 60 * 60 * 1000);

// 驗證測試頁密碼，比對 config.TEST_PASSWORD
devRouter.post('/verify-test-password', (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] ?? '' : forwarded ?? '';
  const ip = raw.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

  const record = attemptMap.get(ip) ?? { count: 0, lockedUntil: null };

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({ success: false, message: `已鎖定，請 ${remaining} 分鐘後再試` });
  }

  // 鎖定已過期，重置
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    record.count = 0;
    record.lockedUntil = null;
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: '請提供密碼' });
  }
  if (!config.TEST_PASSWORD) {
    return res.status(500).json({ success: false, message: '伺服器未設定 TEST_PASSWORD' });
  }

  if (password === config.TEST_PASSWORD) {
    attemptMap.delete(ip);
    return res.json({ success: true });
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
    attemptMap.set(ip, record);
    return res.status(429).json({ success: false, message: '錯誤次數過多，已鎖定 60 分鐘' });
  }

  attemptMap.set(ip, record);
  const remaining = MAX_ATTEMPTS - record.count;
  return res.status(401).json({ success: false, message: `密碼錯誤，還剩 ${remaining} 次機會` });
});

export { devRouter };
