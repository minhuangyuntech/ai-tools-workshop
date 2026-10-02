# AI 應用實作

以繁體中文呈現的 3 小時 AI 實作課程。以 Vite 建置真正的多頁靜態網站，部署至 GitHub Pages。

## 開發與建置

使用 Node.js 24 LTS：

```sh
npm ci
npm run dev
npm run build
npm run check
npm run preview
```

開啟開發伺服器顯示的 `/ai-tools-workshop/` 網址。請使用 HTTP 本機伺服器，不要直接雙擊 HTML。

## 結構

- `src/content.json`：課程正文與提示詞。
- `scripts/build-pages.mjs`：各單元、總覽、入口的頁面範本。
- `src/main.js`：課程碼、筆記、進度、測驗、提示詞組合、下載搜尋及圖片比較。
- `src/styles.css`：新版樣式；`src/legacy.css` 保留教材元件樣式。
- `public/materials/`：課程整理的素材。
- `public/workshop-files/`：`D:\ai\ai-course` 中的原始練習檔案。
- `public/assets/`：網站插圖。

## GitHub Pages

此專案的 Vite base 固定為 `/ai-tools-workshop/`，支援每個 HTML 子頁直接開啟及重新整理。

Repo 的 Settings → Pages → Build and deployment → Source 選擇 **GitHub Actions**。
推送 `main` 後，工作流程會建置、驗證，再發布 `dist`。

## 課程入口

這是經確認採用的簡易前端課程碼入口，**不是真正的身分驗證或檔案存取控制**。公開 repo、HTML、JavaScript 及下載檔案可被直接讀取。請勿存放機密、個資或需要付費保護的教材。

課程碼設定只含隨機鹽值及 SHA-256 摘要；有效入口狀態存在 sessionStorage，8 小時到期。練習進度、筆記及測驗存在 localStorage，沒有上傳後端。

首次設定：`node scripts/set-course-code.mjs`。明文管理紀錄寫在 repo 上層，不會部署。
換碼時設定環境變數 `COURSE_CODE`，再執行該程式、建置及推送。請勿在公開 issue 或 commit 訊息貼上課程碼。

## 驗證

`npm run check` 檢查所有頁面、內部連結、下載檔案、元素 ID 及 GitHub Pages 子路徑。若本機存在 `../ai-course`，另以 SHA-256 核對每個原始檔案完整性。

網站不串接任何付費 AI API；所有 AI 生成實作由學生在各平台自行操作。
