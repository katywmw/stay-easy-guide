
# 業者後台重構：專業儀表板 + 設定中心 + 多房訂單

依照剛才選擇：**單筆訂單 + 多房、單一業者帳號 + 多館切換、額外費用走獨立補款通知、視覺維持暖陳日和但加強層次**。

---

## 一、儀表板改造 (`owner.dashboard.tsx`)

**目前問題**：頂端「歡迎回來」佔太多空間、Stat cards 太扁、視覺太薄。

- 頂端 header 縮小為一行：左側「胡桃民宿 · 業者後台 / 歡迎回來 陳先生」細字，右側加入「館別切換 dropdown」＋ 「⚙ 設定」＋「登出」icon button，整體高度 <56px。
- Stats：改成 5 欄橫向卡片，加入左側細色條 (border-l-4)、tone 對應色的柔和背景、金額字加大 (text-3xl) 並用 tabular-nums；卡片加 hover:shadow 讓資訊感更重。
- 新增「今日行程」小區塊：今日入住 X 組 / 今日退房 Y 組，用 timeline 樣式。
- 「近期入住申請」提升為主角：卡片變大、加左側色條顯示狀態 tone、加入「訂單編號」「房間」「金額」欄，右側顯示「押金 pill」「金額 pill」。
- **移除**：「入住表單設定」卡片（改成獨立 `/owner/settings/*` 頁）。

## 二、搜尋 / 篩選強化 (`owner.submissions.index.tsx`)

在既有篩選器頂端加：
- 關鍵字搜尋框（姓名 / 電話 / 訂單編號 debounce 200ms）
- 「館別」下拉（多館切換用）
- 日期改為「入住日 range」（from / to）
- 篩選結果數字放在右上，加「清除全部」

## 三、設定中心（全新路由樹）

新增 `src/routes/owner.settings.tsx` 作為 layout（左側 sub-nav），底下：

```
/owner/settings/property        3.1 民宿資料 + 3.2 多館別列表
/owner/settings/rooms           3.3 房間 / 單位
/owner/settings/house-rules     3.4 入住須知編輯器
/owner/settings/deposit         3.5 押金規則
/owner/settings/payments        3.6 付款方式（匯款 + LINE Pay QR）
/owner/settings/extra-fees      3.7 額外費用項目
/owner/settings/guide           3.8 入住指引模板
/owner/settings/passwords       3.9 密碼模板 + 3.10 釋出規則
/owner/settings/faq             3.11 FAQ 編輯器
```

各頁重點：

- **3.1 民宿資料**：名稱、地址、聯絡電話、Email、Check-in / Check-out 時間、Logo。
- **3.2 多館別**：`properties[]` 列表，可新增/編輯/刪除；每間館別獨立設定；儀表板頂端 dropdown 讀這裡。
- **3.3 房間 / 單位**：`rooms[]`，欄位：房名、房型（雅房 / 套房 / 整棟）、所屬館別、床數、預設入住指引；旅客訂房頁多一步「選擇房間（可多選）」。
- **3.4 入住須知**：純文字 + Markdown-lite（粗體、清單），儲存於 `houseRulesContent`；旅客端 `checkin.demo.house-rules.tsx` 讀取。
- **3.5 押金**：三種模式 — 無押金 (0)、固定押金、按房型；`depositAmount: 0` → 押金頁完全跳過、房間密碼直接進入常規釋出流程。
- **3.6 付款方式**：匯款帳號（銀行代碼 / 戶名 / 帳號）+ LINE Pay QR 上傳 + 付款說明文字。
- **3.7 額外費用項目**：業者定義 `extraFeeCatalog: { id, name, unit, defaultAmount }[]`（寵物費、加床、烤肉、訪客、早餐…）；作為「入住申請」補款時的下拉選項。
- **3.8 入住指引**：地址 / 停車 / 大門 / 房門 / 注意事項 / 緊急聯絡，各段落獨立可編輯。
- **3.9 密碼模板**：`passwordTemplates[]`（大門 / 房間 / 鑰匙盒），每個房間可掛不同組。
- **3.10 密碼釋出規則**：手動、定時（入住日 15:00）、條件式（押金已收 + 證件通過）。
- **3.11 FAQ 編輯器**：分類 + 條目 CRUD，取代目前 hard-coded FAQ。

儲存：全部沿用 `zustand/persist`，新增 `src/lib/property-config.ts` 集中管理所有設定型別。

## 四、多房訂單（單筆訂單 + 多房）

**旅客端**：
- `checkin.demo.booking.tsx` 加「入住房間」多選 checkbox（讀 `rooms[]`，依館別過濾）。
- Store `checkin-store.ts` 新增 `selectedRoomIds: string[]`。
- 押金頁：按選中房間數 × 每房押金加總（如 1 房 $1000 / 整棟 $6000 邏輯走「按房型」規則）。
- 「入住須知」「入住指引」聚合顯示所有選中房間的內容。
- 密碼寄出：一封信、多個房間密碼列表。

**業者端**：
- 申請詳情 (`owner.submissions.$id.tsx`) 明確顯示「房間 x N」，每間房獨立 pill 顯示密碼狀態；業者可個別點「釋出此房密碼」或「全部釋出」。
- 儀表板列表顯示「訂單 A · 3 房」而非拆成 3 筆。

## 五、獨立補款通知（額外費用）

在 `owner.submissions.$id.tsx` 新增「補款項目」區塊：
- 業者從 `extraFeeCatalog` 選項目、輸入金額 / 數量 / 備註 → 產生一筆 `SurchargeInvoice`（獨立於押金）。
- 旅客端新增路由 `/checkin/demo/surcharge/$id` 顯示品項明細 + 業者 LINE Pay QR + 匯款資訊。
- 儀表板 stat 新增「補款待收 N」。
- 押金頁流程完全不受影響（依你的選擇）。

## 六、視覺升級（維持暖陳日和 + 加強層次）

配色：`#FFF8E7`（背景）/ `#FFD93D`（主色點綴）/ `#2B2B2B`（主字）/ `#8B7355`（次階木色）。

- 業者後台加 `Sidebar`（shadcn sidebar，collapsible="icon"），左側 nav：儀表板 / 入住申請 / 補款 / 設定 / 帳號；主色條在 active item 左側 4px。
- 卡片：`card-soft` 加 `shadow-[0_1px_0_rgba(139,115,85,0.08),0_8px_24px_-12px_rgba(139,115,85,0.15)]`，`rounded-2xl` → `rounded-xl` 更幹練。
- 字體：headings 加 tracking-tight、資料類數字用 `font-variant-numeric: tabular-nums`。
- 加 section divider（細木色線）與 breadcrumb（設定頁）。
- Stat card icon 從實色圓角方塊改為「淺色底 + 主色 icon + 左細色條」。
- 旅客端維持既有暖色手感，不動。

## 七、檔案異動清單

**新增**
- `src/routes/owner.settings.tsx`（layout + sidebar）
- `src/routes/owner.settings.property.tsx`
- `src/routes/owner.settings.rooms.tsx`
- `src/routes/owner.settings.house-rules.tsx`
- `src/routes/owner.settings.deposit.tsx`
- `src/routes/owner.settings.payments.tsx`
- `src/routes/owner.settings.extra-fees.tsx`
- `src/routes/owner.settings.guide.tsx`
- `src/routes/owner.settings.passwords.tsx`
- `src/routes/owner.settings.faq.tsx`
- `src/routes/owner.settings.index.tsx`（redirect → property）
- `src/routes/checkin.demo.surcharge.$id.tsx`
- `src/components/owner/OwnerShell.tsx`（sidebar + header + 館別切換）
- `src/components/owner/SettingsCard.tsx`
- `src/lib/property-config.ts`（統一 config store：properties / rooms / passwords / feeCatalog / payment / rules）
- `src/lib/surcharge-store.ts`

**修改**
- `src/routes/owner.dashboard.tsx`（縮小 header、放大列表、加今日行程、拆掉表單設定卡）
- `src/routes/owner.submissions.index.tsx`（關鍵字 / 館別 / 日期 range）
- `src/routes/owner.submissions.$id.tsx`（多房顯示、補款區塊、密碼分房釋出）
- `src/lib/checkin-store.ts`（`selectedRoomIds`、`propertyId`）
- `src/routes/checkin.demo.booking.tsx`（多房選擇）
- `src/routes/checkin.demo.deposit.tsx`（0 押金跳過、按房型計算）
- `src/routes/checkin.demo.house-rules.tsx`, `checkin.demo.guide.tsx`, `checkin.demo.faq.tsx`（讀業者設定）
- `src/lib/property-settings.ts`（保留 backward compat，內部委派給 `property-config`）
- `src/styles.css`（新增木色 token、shadow token、tabular-nums utility）

## 技術備註

- 全部 config 走 `zustand/persist`，用單一 root store 減少 hydration 問題；預設帶 seed 資料讓 Demo 一開就有內容。
- 密碼釋出規則為前端邏輯（無 backend），Demo 用 setTimeout 模擬定時釋出。
- 多館切換用 `currentPropertyId` global state，所有 owner 頁面讀取此值過濾資料。
- 補款頁走與押金頁相同的 QR / 匯款 UI 元件，抽 `PaymentPanel` 共用。
- 3.4 / 3.8 / 3.11 富文本先用 `<textarea>` + 簡易 markdown render（避免引入 heavy editor）。

## 未在本輪處理

- 真實後端 / 資料庫（目前仍為 localStorage demo）
- Email / SMS 實際寄送
- 訪客登入 / 帳號系統
