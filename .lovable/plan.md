# 訂房流程細節優化 + 業者可控欄位 + 動態押金

## 1. 修正「黃色按鈕沒有文字」的 Bug（根因）

`src/components/checkin/Fields.tsx` 中的 `PrimaryButton` 與 `GhostButton` 目前把 `children` 解構出來後，卻用自閉合的 `<button {...props} />` 渲染，導致所有步驟按鈕上的文字（例如「下一步：填寫入住人資訊」）全部被丟掉，只剩一條黃色 bar。

修法：改為 `<button {...props}>{children}</button>`，並在文字右側加入黑色箭頭圖示（`ArrowRight`，來自 lucide-react），做為「下一步」視覺提示。所有步驟頁面的按鈕文案已存在，修完 bug 後即可自動顯示。

## 2. 訂房資料頁 `checkin.demo.booking.tsx`

- **必填標記**：於「訂房姓名」「手機號碼」「入住日期」「退房日期」的 label 尾端加上紅色 `*`；卡片頂端加一行小提示「標示 * 為必填欄位」。
- **移除即時回饋文字**：刪掉入住/退房日期下方「已選：YYYY/MM/DD」那兩段 `<p>`（原生 date input 已顯示所選日期）。
- **保留**：日期驗證邏輯（`min={today}`、`min={checkIn + 1}`、自動清空無效退房日）。

## 3. Fields.tsx 支援必填標記

`TextField` 新增 `required?: boolean` prop（沿用 HTML `required` 也可以），在 label 尾端顯示紅色 `*`。同理套用於未來需要的欄位。

## 4. 業者後台：訂單欄位開關 + 額外收費設定

在 `src/lib/owner-auth.ts`（或新檔 `src/lib/property-settings.ts`）新增以 zustand persist 儲存的業者設定：

```ts
interface PropertySettings {
  askParking: boolean;              // 是否詢問旅客「需要停車資訊」
  askPet: boolean;                  // 是否詢問「攜帶寵物」（已存在，保持顯示）
  petFeeEnabled: boolean;           // 是否加收寵物費
  petFeePerNight: number;           // 每晚每隻寵物費用，例如 500
  depositAmount: number;            // 押金金額，預設 1000
  linePayQrDataUrl: string | null;  // 業者上傳的 LINE Pay 收款 QR（base64 dataURL）
}
```

於 `owner.dashboard.tsx` 底部新增「入住表單設定」卡片：
- 開關：需要停車資訊 (askParking)
- 開關：攜帶寵物 (askPet) + 若開啟則顯示「加收寵物費」開關與金額輸入
- 押金金額輸入
- LINE Pay 收款 QR：`<input type="file" accept="image/*">`，選擇後轉 dataURL 存入 store；旁邊顯示縮圖與「移除」

## 5. 入住人資訊 `checkin.demo.guest-info.tsx`

- 讀取 `PropertySettings`：
  - `askParking === false` → 不渲染「是否需要停車資訊」ChipGroup，`canNext` 條件也去掉該欄。
  - `askPet === false` → 不渲染寵物欄。
- 保留特殊需求備註等其餘欄位。

## 6. 押金頁 `checkin.demo.deposit.tsx`

- 讀取 `PropertySettings` 計算費用：
  ```
  deposit = depositAmount
  petFee  = petFeeEnabled && hasPet === "yes" && petFeePerNight > 0
            ? petFeePerNight * nights * petCount 
            : 0
  total   = deposit + petFee
  ```
  夜數用 `checkOutDate - checkInDate`；寵物數量此版本以 1 隻計（可日後擴充）。
- 金額卡片改為條列：
  ```
  押金        NT$ 1,000
  寵物費       NT$   500
  ─────────────────
  合計        NT$ 1,500
  ```
  只有金額 > 0 的列才顯示；沒有寵物費時只顯示押金。
- **LINE Pay 分支**：若業者已上傳 `linePayQrDataUrl` → 顯示該 QR 圖並提示「請以 LINE Pay 掃描付款」；未上傳 → 顯示「業者尚未提供 LINE Pay 收款 QR，請改用其他方式或聯繫民宿」。

## 7. Store 擴充 `checkin-store.ts`

新增 `petCount?: number`（預設 1），寫入 zustand。押金頁需要它以計算寵物費（若之後要支援多隻寵物）。此版本可先固定 1，欄位保留但 UI 不必先開放。

## 檔案異動清單

- 修改：`src/components/checkin/Fields.tsx`（修 children bug、必填 `*`、匯出黑色箭頭按鈕）
- 修改：`src/routes/checkin.demo.booking.tsx`（必填標記、必填提示、移除「已選：」）
- 修改：`src/routes/checkin.demo.guest-info.tsx`（按業者設定條件渲染停車/寵物）
- 修改：`src/routes/checkin.demo.deposit.tsx`（費用明細、動態總額、LINE Pay QR）
- 修改：`src/routes/owner.dashboard.tsx`（表單設定卡片：開關、金額、QR 上傳）
- 新增：`src/lib/property-settings.ts`（zustand persist store）
- 修改：`src/lib/checkin-store.ts`（如需要 `petCount`）

## 技術備註

- LINE Pay QR 使用 `FileReader.readAsDataURL` 存 base64，避免依賴後端；正式版可換成上傳到 Lovable Cloud storage。
- 業者設定與旅客 store 都用 `zustand/persist` 存 localStorage，Demo 情境下業者端調整後旅客端重新整理即可看到。
- 所有紅色 `*` 用 `text-destructive` token，不寫死顏色。
