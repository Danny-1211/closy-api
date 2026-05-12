---
name: generate-readme
description: Generate a README.md following the Closy project standard structure
---

讀取 `package.json` 取得專案名稱、版本、dependencies、devDependencies 與 scripts，並讀取現有的專案目錄結構，然後依照以下固定格式與規範生成 README.md。

## 固定架構與規範

### 1. 標題區
```
# <emoji> <專案名稱> | <中文副標題>

<一段中文描述>，說明使用了哪些核心技術以及系統功能。
```

### 2. Badges（技術標籤）
緊接在描述段落後，列出所有主要套件的 shields.io badge，格式如下：
```
![<顯示名稱>](https://img.shields.io/badge/<Label>-<Message>-<Color>?logo=<logo>&logoColor=white)
```

**Badge 規則：**
- 從 `dependencies` 中擷取所有主要套件（排除 `@types/*`）
- 版本號取主版本（例如 `^5.2.1` → `5.x`，`v22.20.0` 保留完整）
- 使用語義化顏色（Node.js: `339933`、TypeScript: `3178C6`、Express: `000000`、MongoDB: `47A248`、JWT: `000000`、Swagger: `85EA2D` + `logoColor=black`、pnpm: `F69220` 等）
- Badge 之間無空行，全部連排

### 3. 分隔線
每個主要 section 之間加 `---`

### 4. 專案介紹 Section
```markdown
## 🧩 專案介紹 | Overview

<2~3 句中文描述，說明專案定位、核心功能與整合的第三方服務>
```

### 5. 專案架構 Section
```markdown
## 📂 專案架構 | Project Structure

\`\`\`
<project-root>/
├── public/              # 靜態資源
├── src/                 # 原始碼目錄
│   ├── config/          # 系統與環境設定
│   ├── constants/       # 靜態常數設定
│   ├── integrations/    # 第三方服務整合
│   ├── middlewares/     # 請求中介軟體
│   ├── models/          # 資料庫模型
│   ├── routes/          # API 路由設定
│   ├── services/        # 核心商業邏輯與服務
│   ├── types/           # TypeScript 型別定義
│   ├── utils/           # 共用工具函式
│   └── app.ts           # 應用程式主入口
├── .env.example         # 環境變數範例檔
├── package.json         # 專案資訊與相關套件
├── pnpm-lock.yaml       # pnpm 套件鎖定檔
├── swagger-output.json  # Swagger 自動產生的 API 文件
└── tsconfig.json        # TypeScript 設定檔
\`\`\`
```
實際目錄依專案內容調整，但保持上述中文註解風格。

### 6. 啟動專案 Section
```markdown
## 🚀 啟動專案 | Quick Start

### 📦 安裝環境 (Requirement)

請確認電腦已安裝以下版本：

- **Node.js**: <版本，從 engines 或 .nvmrc 取得，預設 v22.20.0>
- **pnpm**: <版本，從 packageManager 欄位取得>

### ⚙️ 啟動 (Setup & Dev)

\`\`\`bash
# 1. 安裝專案依賴套件
pnpm install

# 2. 建立環境變數檔
# 請複製 .env.example 建立 .env 檔案，並填入您的資料庫、API 金鑰等設定
cp .env.example .env

# 3. 啟動開發伺服器
npm run dev
\`\`\`
```

## 輸出規則
- 全部寫入專案根目錄的 `README.md`
- 中英文並陳的 section 標題格式固定為：`## <emoji> <中文> | <English>`
- 不加任何額外說明、不輸出 markdown fence 以外的程式碼區塊
- 寫完後告知使用者 README.md 已產生，並條列本次寫入的 badge 清單
