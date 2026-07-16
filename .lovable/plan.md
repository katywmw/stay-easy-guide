# Plan — Guest booking simplification, FAQ sync, password/approval overhaul

## 1. Guest booking: drop 入住館別 & 入住房間 selection

`src/routes/checkin.demo.booking.tsx`

- Remove the `入住館別` `<select>` block (lines ~84–103) and the `入住房間` selector block (lines ~105–213).
- Auto-assign `propertyId` on mount: if `s.propertyId` is empty, default to `properties[0].id` (guest-facing side only needs a property context for downstream copy; owner assigns actual rooms).
- Clear `selectedRoomIds` from the guest flow: the guest no longer picks rooms — the owner assigns rooms via the approval page (already introduced in prior turn). Drop `selectedRoomIds.length > 0` from `canNext`.
- Guest just fills 訂房平台 → 訂房姓名 → 手機 → Email → 入住/退房 → 訂單編號. StepBar remains.
- Downstream screens that referenced `selectedRoomIds` (submitted page, review) already read from the room-assignments store — verify they gracefully render "由民宿安排中" when unassigned.

## 2. FAQ editor: expose default seed for edit/delete

Guest 常見問題 currently reads from `faqItems` in `src/lib/checkin-content.ts` (hardcoded system default), while `owner.settings.faq.tsx` reads/writes `faq` from `usePropertyConfig` (empty by default). They are disconnected.

- Change `FaqAccordion` (`src/components/checkin/FaqAccordion.tsx`) to read the merged list from `usePropertyConfig().faq`; fall back to the default seed only when the store is empty (backwards-compat).
- Seed `property-config` store's `faq` on first load with the built-in `faqItems` (migrate on rehydrate: if `faq.length === 0`, populate from defaults, tag each entry with a `source: "system" | "custom"` field so we can reset later if desired).
- FAQ editor page renders all entries (system + custom) with edit + delete controls. Add a "還原系統預設題庫" button that repopulates missing defaults.
- Filter by category dropdown stays.

## 3. Password page: remove "此房型共用" mode, keep only 整館預設

`src/routes/owner.settings.passwords.tsx` + `property-config` room-group mode.

- Drop the `共用 / 各房獨立` toggle at the room-group level. All front-door password logic collapses to a single "整館大門密碼" section shown at the very top of the page.
- Each room row shows only 房門密碼 (+備註). Room groups list becomes a compact accordion of 房門密碼 rows.
- Migration: any group currently in `shared` mode is coerced to `per-property` on load; the shared value is discarded (or, if non-empty, promoted to the property default when empty).
- Update `checkin.demo.*` screens that read `group.frontDoorPassword` to fall back to property-level default.

## 4. Hide toggle behavior on password rows

In the password list, the eye/hide toggle currently masks the whole password including the room number label. Change so 房號/別名 stays visible and only the password value is masked (`••••••`) when hidden. Applies to per-row and 全部隱藏 bulk toggle.

## 5. 取鑰匙 房型: photos/videos per room-type

For any room group whose `accessMode === "key"`:

- Add a `keyPickupMedia: MediaItem[]` field to `RoomGroup` in `property-config` (image/video URLs; reuse `fileToMediaDataUrl`).
- Room settings page (`owner.settings.rooms.tsx`) adds a media uploader block visible only when the group is 取鑰匙 mode, with drag reorder + delete (mirrors existing guide media uploader).
- Guest 入住指引 page renders the group's key-pickup media when the guest's assigned room belongs to a key-mode group.

## 6. Approval page: multi-select same-category rooms, live sync, auto-save

`src/routes/owner.submissions.$id.tsx` + `src/lib/room-assignments.ts`.

- Room assignment card: allow selecting multiple rooms in the SAME room-type (e.g. 2× 標準雙人). Remove any "one per group" guard; keep only the overlap-with-other-submissions guard.
- 訂購房間與密碼釋出 list auto-derives from `useRoomAssignments` — already the case; add an effect that re-computes released-rooms diff when assignment changes so drift banner updates.
- Replace manual `SaveBar` on this page with **auto-save**: on every mutation, debounce 400ms then persist. Header status pill shows `儲存中…` (spinner) → `已儲存 · HH:MM` (check). No 儲存 button. Same behavior for the inline password popovers on this page.

## 7. Approval page: consolidate 補款 / 額外費用 / 要求補件, delete redundant buttons

- Move the 補款/額外費用 card to sit directly below the 證件 (ID) section.
- Rename the card to **"補款 / 額外費用 / 要求補件"**.
- Inside the card, add a **要求補件** sub-section:
  - Reason chips: `身分證未通過`, `身分證照片不清楚`, `補款憑證不足`, `其他` (with a pencil → freeform text).
  - Optional message textarea (pre-filled with a template based on the selected reason chip).
- Button label change: `建立補款單並通知旅客` → **`通知旅客`**. Behavior: creates the surcharge/reissue request AND pushes a guest notification (versioned via existing `submission-updates` history) so the guest sees "民宿要求補件：___" in their submitted page with a CTA to update the missing item (e.g. re-upload ID, pay surcharge).
- **Remove** the bottom-of-page `要求補件` button (redundant — the card handles it).
- **Remove** the `標記完成` button (approval implicitly finalizes).
- **Remove** the standalone `釋出密碼` button (密碼 releases automatically on `核准入住`). Keep the room-level inline pencil for edits; the "release" event is fired by 核准入住.

## 8. Owners can see guests updated their info

Extend `src/lib/submission-updates.ts`:

- Add a `guestUpdates` history slice per `submissionId`: entries `{ at, field: "id_photo" | "surcharge_paid" | "other", note? }` written when the guest re-submits after a 要求補件.
- Submission detail page adds a **"旅客更新紀錄"** timeline card under 補款/補件, showing latest guest actions with timestamps and a "查看更新" quick link that scrolls to the changed section (ID photo, payment proof, etc.).
- Submissions list badge: rows with unread guest updates show a dot on the row; opening the detail marks them read.
- Guest side: after receiving a 補件請求, the submitted page shows an actionable card ("民宿要求補件：___ · 前往補件") that, on completion, calls a `markGuestUpdate(submissionId, field)` helper.

## Technical notes

- No backend/schema changes — all stores are zustand+persist.
- `property-config` gets a persist migration for FAQ seed and room-group password mode collapse.
- Auto-save uses a simple `useEffect` + `setTimeout` debouncer per store slice; status derived from `saving` boolean.
- Media uploads reuse `fileToMediaDataUrl` (compression already in place).
- No new npm deps.

## Files touched

- edit: `src/routes/checkin.demo.booking.tsx` (drop property+room selectors)
- edit: `src/components/checkin/FaqAccordion.tsx` (read from store)
- edit: `src/lib/property-config.ts` (FAQ seed migration; drop shared-mode; add `keyPickupMedia`)
- edit: `src/routes/owner.settings.faq.tsx` (show system defaults; add restore button)
- edit: `src/routes/owner.settings.passwords.tsx` (remove 共用 toggle; keep only property-level 大門密碼; fix hide toggle to mask password only)
- edit: `src/routes/owner.settings.rooms.tsx` (key-pickup media uploader for 取鑰匙 groups)
- edit: `src/routes/checkin.demo.guide.tsx` (render key-pickup media)
- edit: `src/routes/owner.submissions.$id.tsx` (multi-select same category, auto-save, restructured 補款/補件 card, remove redundant buttons, guest-updates timeline)
- edit: `src/lib/submission-updates.ts` (guestUpdates slice, read/unread)
- edit: `src/lib/room-assignments.ts` (allow duplicates within a group)
- edit: `src/routes/checkin.demo.submitted.tsx` (補件 CTA + markGuestUpdate)
- edit: `src/routes/owner.submissions.index.tsx` (unread-update dot)
