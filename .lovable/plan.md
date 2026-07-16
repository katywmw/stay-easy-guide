# Plan — Overview clarity, unified password page, guest info-updated notice

## 1. Overview: show which property each row belongs to + "所有館別" toggle

**Files:** `src/routes/owner.dashboard.tsx`, `src/lib/owner-demo.ts`, `src/routes/owner.submissions.index.tsx`

- Add `propertyId: "walnut" | "anping9"` to every `OwnerSubmission` in `owner-demo.ts` (seed a realistic mix across both properties).
- Introduce a shared color mapping in one place, e.g. `src/lib/property-colors.ts`:
  - `walnut` → bright yellow chip (bg `oklch(0.92 0.14 92)` / fg dark)
  - `anping9` → muted grey chip (bg `oklch(0.92 0.01 250)` / fg muted)
  - Fallback for future properties: neutral secondary.
- Dashboard header adds a segmented control: `胡桃民宿 · 安平九號 · 全部館別`.
  - When a single property is active it matches the existing `currentPropertyId` (switching here also updates the global switcher).
  - "全部館別" is a local view-only mode (doesn't change `currentPropertyId`, just widens the query for stats + recent list).
- Stats bubbles (`今日入住 / 等待審核 / 需補件 / 已核准 / 押金待確認`) become derived from filtered submissions instead of the static `ownerStats` constant, so numbers update with the filter.
- Recent submission rows: render a small `PropertyChip` (yellow / grey) next to the guest name; add the property short label ("胡桃" / "安平") in the meta row.
- Same chip added to `owner.submissions.index.tsx` list rows so the全部館別 view there also disambiguates. The existing per-property filter behavior is preserved.

## 2. Unify all password management into one page

**Files:** `src/routes/owner.settings.passwords.tsx`, `src/routes/owner.settings.rooms.tsx`, `src/routes/owner.settings.index.tsx`

- `房型與房間` page keeps房型-level fields (name, bedType, description, deposit, access mode, guide note) and the **房間清單** but removes password fields from both the group card and the room row:
  - Remove `大門密碼（同房型共用）` and `取鑰匙位置與方式` from the group form.
  - Remove `房門密碼` from the inline `RoomRow` edit panel; keep房號 / 別名 / 備註 there.
  - A subtle helper "密碼相關設定請至「密碼設定」頁" with an inline link replaces the removed fields.
- `密碼設定` page (`passwords.tsx`) becomes the single source of truth:
  - Top: `大門密碼（整館預設）` card — **add a proper Save button** with its own dirty-tracked draft (currently the input writes to store immediately with no confirmation).
  - Middle: per房型 cards (already grouped) that expose gate-password mode, group-shared gate password, key-pickup location, plus each房間's 房門密碼 / 房號 / 別名 / 備註 (read-only 房號/別名 label above the password field, editable displayName inline).
  - Bottom: 密碼釋出規則 (unchanged this iteration).
- `owner.settings.index.tsx` (settings hub) reworded: rooms card becomes "房型結構與房間清單"; passwords card becomes "所有密碼（大門 + 房門）" and gets a prominent visual weight (larger card / pinned to top of the grid) so owners find it fast when passwords change daily.

## 3. Save button for 大門密碼（整館預設）

Handled in item 2. Implementation detail:
- Wrap the property gate password field in a local `useState` draft plus a "儲存" button (matching the per-group card pattern). Call `updateProperty(property.id, { gatePassword: draft })` only on save; toast `已儲存整館大門密碼`. Disabled when draft equals stored value.

## 4. Make passwords fast to reach and edit

- Owner shell (`OwnerShell`) top bar: add a persistent `密碼` shortcut button (Key icon) next to the property switcher, linking to `/owner/settings/passwords`. Visible on both mobile and desktop.
- Settings sidebar: reorder so `密碼設定` sits at the top of the "營運設定" group and gets a subtle "常用" tag.
- Dashboard 快速操作 card: replace the current `房型設定` quick link with `密碼設定` (rooms still reachable via the sidebar).
- Passwords page structure already scrolls per房型; add a sticky in-page mini-nav on desktop (房型名稱 chips) that jumps to that group card. Mobile keeps the current linear scroll.

## 5. "Password / Room info updated" notifier flow

**Files:** `src/lib/owner-demo.ts`, `src/routes/owner.submissions.$id.tsx`, `src/routes/owner.submissions.index.tsx`, new small helper in `src/lib/checkin-store.ts` or a new `src/lib/submission-updates.ts`.

Scope: demo/frontend only — this is a mock flow (no backend), stored in the same client store pattern used for surcharges.

- New client store `useSubmissionUpdates` (zustand + persist) keyed by `submissionId`:
  ```
  {
    lastNotifiedAt: string;
    lastVersion: number;
    channel: "line" | "sms" | "email";
    payloadSummary: string; // e.g. "房號 101 → Happy 101 / 房門密碼 5821 → 5299"
    guestAcknowledgedAt: string | null;
  }
  ```
- Submission detail (approved status) grows a new section `已寄出的入住資訊`:
  - Shows current snapshot (room number, display name, door password, gate password) rendered from `usePropertyConfig`.
  - When the current snapshot differs from the last-notified snapshot, show an amber banner "資訊已變更，尚未通知旅客" with two buttons: `重新寄送更新給旅客` and `僅記錄，不通知`.
  - `重新寄送更新` → increments `lastVersion`, sets `lastNotifiedAt`, records the diff summary, triggers a toast. Reset `guestAcknowledgedAt` to null.
  - After sending, banner turns green "已於 HH:mm 寄出更新（第 N 版）· 尚未確認"; a `模擬旅客已讀` button (demo only) sets `guestAcknowledgedAt`, which flips it to "旅客已收到更新 · HH:mm".
- Submissions list (`owner.submissions.index.tsx`): rows for approved submissions with a pending diff get a small amber dot + label `資訊已更新未通知`, so owners see this at a glance.
- Guest side: on the demo booking status view (`checkin.demo.submitted.tsx`), if `lastVersion > 0`, prepend a highlighted notice card "入住資訊已更新，請以下方最新資訊為準（更新時間 HH:mm）" and stamp each affected field with a small "已更新" tag. The old value stays hidden — new information fully replaces the old, per the request. Acknowledgement is auto-recorded when the guest visits this page after the send.

## Technical notes

- No new npm dependencies.
- All new state is client-side (zustand + `persist`) and mirrors existing patterns; no schema migrations.
- Property color chip lives in one module so it can be reused in dashboard, submissions list, submission detail, and any future places.
- No changes to auth, routes registry, or business logic outside the files listed.

## Files touched

- edit: `src/routes/owner.dashboard.tsx`
- edit: `src/routes/owner.submissions.index.tsx`
- edit: `src/routes/owner.submissions.$id.tsx`
- edit: `src/routes/owner.settings.passwords.tsx`
- edit: `src/routes/owner.settings.rooms.tsx`
- edit: `src/routes/owner.settings.index.tsx`
- edit: `src/components/owner/OwnerShell.tsx`
- edit: `src/lib/owner-demo.ts`
- edit: `src/routes/checkin.demo.submitted.tsx`
- new: `src/lib/property-colors.ts`
- new: `src/lib/submission-updates.ts`
