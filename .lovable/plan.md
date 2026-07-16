
# 業者端優化計畫

依你的九點回饋 + 補充回答落實。所有變更皆為前端 + 本地 store，資料仍在 `src/lib/property-config.ts` / `surcharge-store.ts`。

## 1. 視覺：降低白感、加強層次
- `src/styles.css`：把 `--background` 由近白改為暖米 (`oklch(0.985 0.012 82)`)，`--card` 略高於背景，新增 `--surface-1/2` 與 `--shadow-warm` token。
- `OwnerShell`：主內容加 `bg-background`（非 white），卡片改用 `bg-card` + 細 `border` + `shadow-warm`；區塊之間加分隔線與 group heading。
- 側邊欄底色加深一階（`oklch(0.96 0.02 82)`），active 項目左側 3px 主色條。

## 2. Dashboard 五顆統計卡（手機佔約 1/3）
- 手機：改為橫向 `snap-x` 一排 5 張迷你卡（h≈72px），只有 icon + 數字 + 兩字標籤；整區高度 ≈ 螢幕 30%。
- 手機下方直接接「近期入住申請」讓資訊優先呈現。
- 桌機：維持 5 欄大卡但降高度 20%，避免大留白。

## 3. 手動儲存 + 未儲存指示
- 新增 `src/hooks/useDirtyForm.ts`：`{ dirty, markDirty, save }`。
- 新增 `src/components/owner/SaveBar.tsx`：sticky 底部條，顯示「未儲存變更 · 儲存 / 捨棄」；乾淨時顯示上次儲存時間。
- 所有 `owner.settings.*` 頁改成：編輯只更新 local draft，按「儲存」才寫入 `usePropertyConfig`；離開頁面若 dirty 會 `confirm`。

## 4. 房型優先結構（依你的補充）
資料層調整 `property-config.ts`：
- 新增 `RoomTypeGroup { id, propertyId, name, description, bedType, depositAmount, guideNote, defaultDoorPasswordHint, keyPickupLocation? }`。
- `Room` 精簡為 `{ id, roomTypeId, roomNumber, doorPassword?, note? }`。
- 遷移現有 seed：把「101 松風雙人房 / 102 竹影四人房」升為兩個群組，其下各一房。

UI（`owner.settings.rooms.tsx` 全面重寫）：
- 上方：房型群組列表（卡片式，可展開）。動作：新增群組、複製群組（含所有欄位、房間清空）。
- 展開後：群組共用欄位（名稱、床型、押金、入住指引/取鑰匙位置）+ 房間清單（房號、密碼、備註）。
- 篩選列：`全部 / 雙人床 / 單人床 / …` 依現有群組動態列出；可多選；下方顯示扁平的房間表可批次編輯密碼與房號。
- 「複製此房 → 只改房號與密碼」按鈕。

## 5. 鑰匙 vs 密碼（房型群組層）
- 群組欄位新增 `accessMode: "password" | "key"`。
- `password` 模式：房間顯示「房門密碼」欄。
- `key` 模式：房間僅顯示「房號」；群組顯示「取鑰匙位置 / 指引」單一欄，套用該群組所有房間。
- 旅客端入住指引依所選房間的群組決定顯示密碼 or 取鑰匙資訊。

## 6. 多館別 UX 與跨館複製
- `OwnerShell` header 的館別切換由下拉改為明顯的分段控制：`[胡桃民宿] [安平九號] + ⋯` (icon + name)，active 有底色。
- 頁面 heading 一律顯示「你正在編輯：{館名}」（黃色 pill）。
- 每個設定頁（rules / payment / guide / house-rules / extra-fees / faq / passwords）加「從其他館別複製…」按鈕 → dialog 選擇來源館別 → 覆寫本館的該區資料（有 `confirm`）。
- 資料層每項改為 `by propertyId` 的 map，例：`houseRulesByProperty: Record<string,string>`。

## 7. 入住指引：可插入照片
- `guide` 從純字串欄位改為 `blocks: Array<{ type:"text"|"image"; content:string; alt?:string }>`（每欄位獨立 blocks 陣列）。
- 編輯器：每欄位下方「新增段落 / 新增圖片」按鈕；圖片透過 `<input type=file>` 讀為 dataURL 存 `usePropertyConfig`（未接 Cloud，先本地展示；日後可換 storage）。
- 旅客端 `checkin.demo.guide.tsx`：圖片點擊開全螢幕 lightbox（新元件 `src/components/checkin/ImageLightbox.tsx`）。

## 8. 設定側欄可用性（手機 + 桌機）
- 側邊 nav 現有 9 項太長 → 分兩組：`民宿基本`（館別、房型、須知、指引、FAQ）、`交易與釋出`（押金、付款、額外費用、密碼釋出）。
- 手機：側欄改為頂部 `Sheet`（漢堡開啟）；設定頁另加水平 `Tabs` 快速切換同組內頁。
- 每項加圖示 + 一行說明，avoid label truncation。

## 9. 對話：僅外部導流（簡版）
- 新增設定頁 `owner.settings.contact.tsx`：欄位含 `contactChannels: Array<{ type:"line"|"whatsapp"|"phone"|"email"|"messenger"|"custom", label, value, enabled }>` 與 `contactNote`。
- 旅客端：`GuestHome` 底部與 `checkin.demo.submitted` 加「聯絡屋主」區塊，列出啟用的 channel（icon + 一鍵 tel:/mailto:/line:// deep link）。
- 每館獨立設定；預留 `chatEnabled: false` 旗標，之後要加站內聊天再開。

## 技術要點（給開發者）
- **檔案新增**：`src/hooks/useDirtyForm.ts`、`src/components/owner/SaveBar.tsx`、`src/components/owner/PropertySwitcher.tsx`、`src/components/owner/CopyFromPropertyButton.tsx`、`src/components/checkin/ImageLightbox.tsx`、`src/routes/owner.settings.contact.tsx`。
- **檔案改寫**：`src/lib/property-config.ts`（RoomTypeGroup、blocks、by-property maps、contact channels、migration），`src/routes/owner.settings.rooms.tsx`（房型優先 UI + 篩選 + 複製），`owner.settings.guide.tsx`（blocks + 圖片），`owner.settings.house-rules.tsx` / `payments.tsx` / `deposit.tsx` / `extra-fees.tsx` / `faq.tsx` / `passwords.tsx`（改用 by-property + SaveBar），`owner.settings.tsx`（分組導覽 + mobile sheet），`owner.dashboard.tsx`（手機統計條 snap），`owner.settings.property.tsx`（PropertySwitcher）。
- **資料遷移**：`property-config.ts` 內加 `migrate()`：偵測舊 `rooms[].name/type/beds` 結構自動建立群組並移轉。
- **旅客端小改**：`checkin.demo.booking.tsx` 改依 `RoomTypeGroup` 分組顯示可選項；`checkin.demo.guide.tsx` 支援 blocks + lightbox；`GuestHome` / `submitted` 增聯絡屋主。
- 全部維持在前端 store（zustand persist），本輪不動 Lovable Cloud。

## 驗收
- 手機視窗：五顆卡橫向、佔約 30% 高，近期申請立即可見。
- 房型頁：可新增群組、複製群組、依房型 tag 篩選、批次改密碼。
- 每個設定頁：改動後底部出現「未儲存 · 儲存 / 捨棄」；儲存後顯示時間戳。
- 切換館別：header 高亮 + 頁面 pill 顯示；每頁可「從其他館別複製」。
- 入住指引：可插圖，旅客端點擊放大。
- 旅客端 submitted / home：可看到啟用的聯絡管道連結。
