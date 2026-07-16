# 首頁重新設計 + 訪客/業者入口分流 + 入住流程修正

## 1. 分流訪客與業者入口

目前 `/` 同時放旅客 CTA 與「我是業者」按鈕，體驗混亂。改為：

- **`/`（訪客入口）**：直接就是「歡迎回家 · 胡桃民宿」的旅客首頁，等同現在的 `/checkin/demo/home` 內容 —— 一進站就開始線上入住流程，不再看到業者按鈕。
- **`/owner`（業者入口）**：業者專屬入口。若未登入 → 導向 `/owner/login`；若已登入 → 導向 `/owner/dashboard`。業者只需記憶 `/owner` 一個網址，不會看到旅客介面。
- 舊的 `/checkin/demo/home` 保留為別名 route，指向同一個 component，讓已發出的連結不失效。
- 旅客介面裡完全移除任何「業者入口」按鈕；業者登入頁保留一個小型「回旅客首頁」連結以備測試。

## 2. 旅客首頁全新設計（採用選定的「暖陳日和民宿」方向）

依先前選定 prototype 重寫，鎖定配色：
- 主色 `#FFD93D`（檸香日光黃）
- 淺黃 `#FFEC8A`
- 奶油背景 `#FFFBE8`
- 深胡桃棕 `#3A2A1F`
- 成功綠 `#A8D5A0`
- 字體：Quicksand（英數）+ Noto Sans TC（中文），於 `__root.tsx` 用 `<link>` 載入

頁面結構（由上而下）：
1. **沉浸式 Hero 圖**（h-72，底部深棕漸層）：疊上 ★★★★★ 4.9、「胡桃民宿 · 日和居」、「南投 · 魚池鄉」。**移除原本的頂部 sticky nav（QrCode/Heart）與訂單編號輸入框**。
2. **主要 CTA 卡**：黃色虛線框，副標「歡迎回家，請點擊以下按鈕辦理入住」+ 大按鈕「開始線上入住」→ `/checkin/demo/start`。
3. **入住/退房時間卡**：15:00 | 11:00（**移除下方押金按鈕**）。
4. **綠色安全提示卡**：智能門鎖說明。
5. **聯絡按鈕列**：電話 + LINE。
6. **房內設備 Amenities**（移到最底）：WiFi / 停車 / 咖啡 / 空調。
7. **底部深棕禁菸提醒條**。

同時重新生成 `src/assets/hero-minsu.jpg`（暖木造日式民宿入口、金黃陽光、綠色植栽、木招牌）。

## 3. 訂房日期步驟修正 `checkin.demo.booking.tsx`

- **入住日 `min = today`**，退房日 `min = 入住日 + 1 天`，選擇入住日後若舊的退房日早於入住日則自動清空。
- **選擇日期即顯示**：`<input type="date">` 的 `onChange` 直接寫入 store，並在欄位下方顯示「已選：2026/07/15」即時回饋，不需要按其他確認鈕。
- **下一步按鈕補文案**：確保按鈕明確標示「下一步：填寫入住人資訊」。同時檢查其他步驟（入住人、證件、押金、須知、送出）按鈕文案齊全。

## 4. 常見問題 FAQ 改為 collapse 嵌入

- 為 `src/lib/checkin-content.ts` 的 FAQ 項目加上 `category: "id" | "deposit" | "general"`。
- `checkin.demo.id-upload.tsx` 底部新增「常見問題（證件相關）」collapse 清單。
- `checkin.demo.deposit.tsx` 底部新增「常見問題（押金相關）」collapse 清單。
- 保留 `/checkin/demo/faq` 完整頁面於流程內。

## 5. 樣式 token 對齊 `src/styles.css`

同步更新 token 讓全 app 一致：
- `--background` → 奶油 `#FFFBE8`
- `--primary` → 檸香日光黃 `#FFD93D`
- `--primary-soft` → `#FFEC8A`
- `--foreground` → 胡桃棕 `#3A2A1F`
- `--success` → 柔和綠 `#A8D5A0`
- 加入 `--font-display: "Quicksand"`、`--font-sans: "Noto Sans TC"`

## 檔案異動清單

- 重寫：`src/routes/index.tsx`（改為旅客首頁本體，不再是選角色頁）
- 重寫：`src/routes/checkin.demo.home.tsx`（採用新設計，或 re-export index component 內容）
- 新增：`src/routes/owner.index.tsx`（`/owner` 依登入狀態導向 login 或 dashboard）
- 修改：`src/routes/owner.login.tsx`（保留小型「回旅客首頁」測試連結）
- 修改：`src/routes/checkin.demo.booking.tsx`（日期驗證 + 按鈕文案）
- 修改：`src/routes/checkin.demo.id-upload.tsx`（新增 FAQ collapse）
- 修改：`src/routes/checkin.demo.deposit.tsx`（新增 FAQ collapse）
- 修改：`src/lib/checkin-content.ts`（FAQ category 分類）
- 修改：`src/styles.css`（配色 token）
- 修改：`src/routes/__root.tsx`（載入 Quicksand + Noto Sans TC）
- 重新生成：`src/assets/hero-minsu.jpg`
