---
name: generate-swagger
description: >
  Use this skill when the user asks to generate, write, create, or update swagger
  documentation for an API endpoint. Trigger keywords: swagger, swagger doc,
  api doc, swagger comment, 產出 swagger, 寫 swagger, 更新 swagger, swagger 文件.
  Always invoke this skill before writing any swagger comment block.
argument-hint: <HTTP method> <path> [description]
allowed-tools: [Read, Grep]
---

# generate-swagger

根據提供的 API 資訊，為本專案產出正確、完整的 swagger 文件片段。

## 執行流程

1. **讀取 route 檔案**（若路由已存在）：使用 Grep 找到對應的 route handler，再用 Read 讀取該段程式碼，確認：
   - 使用了哪些 middlewares
   - request body / query / params 的結構
   - `res.json(...)` 的實際成功回應格式
   - `throw { statusCode, message }` 的所有錯誤情境

2. **依據以下規格產出 swagger 片段**，直接放在 `/* ... */` 區塊內，供使用者貼進 route handler。

---

## 本專案 Swagger 格式規範

使用 **OpenAPI 3.0** 風格（`content['application/json']` 包裹 schema），範本如下：

```js
/* #swagger.tags = ['TagName']
   #swagger.summary = '一行中文摘要'
   #swagger.description = '詳細說明，可用 <br> 換行'
   #swagger.security = [{ "bearerAuth": [] }]

   #swagger.requestBody = {
     required: true,
     content: {
       'application/json': {
         schema: {
           type: 'object',
           required: ['field1'],
           properties: {
             field1: { type: 'string', description: '說明', example: '範例值' }
           }
         }
       }
     }
   }

   #swagger.responses[200] = {
     description: '操作成功',
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             statusCode: { type: 'integer', example: 200 },
             status: { type: 'boolean', example: true },
             message: { type: 'string', example: '操作成功' },
             data: {
               type: 'object',
               properties: {
                 // 依實際回傳欄位填寫
               }
             }
           }
         }
       }
     }
   }

   #swagger.responses[400] = {
     description: '請求錯誤',
     content: {
       'application/json': {
         schema: {
           type: 'object',
           properties: {
             statusCode: { type: 'integer', example: 400 },
             status: { type: 'boolean', example: false },
             message: { type: 'string', example: '錯誤訊息' },
             data: { type: 'object', example: null }
           }
         }
       }
     }
   }
*/
```

### 規則

- **GET 請求**：不加 `#swagger.requestBody`；若有 query params，改用 `#swagger.parameters`
- **POST / PATCH 請求**：必須加 `#swagger.requestBody`
- **multipart/form-data**（檔案上傳）：`content` 改為 `'multipart/form-data'`，image 欄位使用 `type: 'string', format: 'binary'`
- 每個 property 都必須有 `example`，可選欄位加 `description`
- 語法必須是合法 JS 物件（注意**逗號**，最後一個 property 後不加逗號）

---

## errorHandler 標準格式

所有錯誤統一由 `src/utils/errorMessage.ts` 的 `errorHandler` 發送，固定結構：

```json
{
  "statusCode": 400,
  "status": false,
  "message": "錯誤訊息",
  "data": null
}
```

**重要**：錯誤 response 中**不包含** `ok` 欄位。

---

## 應包含哪些 Response — 判斷規則

| 條件 | 必須加入的 response |
|---|---|
| 使用 `authMiddleWare` | `401` — 未提供 Token / Token 格式錯誤 / 憑證過期 |
| 使用 `uploadSingleImage` | `400` — 未提供圖片 / 不支援格式（jpg、png、webp）/ 超過 5MB |
| 有欄位驗證或必填欄位缺少 | `400` |
| 查詢資源可能不存在（User / Clothes 等） | `404` |
| 有重複資料的業務邏輯（例如重複上傳同圖） | `409` |
| 呼叫外部 API（OpenWeather、Gemini 等）或 DB 操作 | `500` |
| 所有 API | `500` — 伺服器發生錯誤（兜底） |

---

## 現有 Tags

`Auth` / `User` / `Clothes` / `Process` / `Home`

新的功能模組請沿用已有 tag 或自行新增，與 route 的分類保持一致。

---

## 401 標準訊息（authMiddleWare）

```
未提供 Token 或格式錯誤 / 無效的 Token 格式 / 無效的憑證或憑證已過期，請重新登入
```

---

## 輸出格式

直接輸出可貼進 route handler 的 `/* ... */` 區塊，不需要額外說明。若有不確定的欄位（例如 data 的結構），在該位置以 `// TODO: 填寫實際回傳欄位` 標註，讓使用者自行補充。
