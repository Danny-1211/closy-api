# 👕 Closy API | 智慧衣櫃與穿搭推薦系統

使用 Node.js、Express、Gemini 與 TypeScript 打造的智慧衣櫃 API 服務。系統提供使用者管理個人衣物、依據天氣狀況與個人偏好產生穿搭建議，並提供行事曆規劃與整合，為前端應用提供完整的後端支援。

## 🧩 專案介紹 | Overview

本專案為一個智慧衣櫃管理（Closy）的後端 API 應用。
使用者可以上傳與管理衣物圖片（整合 Cloudinary），系統會根據當前天氣 與 Gemini AI 進行智慧運算，產生適合的穿搭組合。

## 📂 專案架構 | Project Structure

```text
closy-api/
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
```
## 🚀 啟動專案 | Quick Start

### 📦 安裝環境 (Requirement)

請確認電腦已安裝以下版本：

- **Node.js**: `v22.20.0`
- **pnpm**: `10.32.1`

### ⚙️ 啟動 (Setup & Dev)
```
# 1. 安裝專案依賴套件
pnpm install

# 2. 建立環境變數檔
# 請複製 .env.example 建立 .env 檔案，並填入您的資料庫、Cloudinary、Gemini 等 API 金鑰
cp .env.example .env

# 3. 啟動開發伺服器
npm run dev
```
