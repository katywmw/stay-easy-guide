# Plan — Overview cleanup, password UX, room assignment, ID watermark, cross-device

## 1. Overview: one segmented control, not two

`src/routes/owner.dashboard.tsx` currently renders the shell's `PropertySwitcher` (via `OwnerShell`) AND a local "檢視範圍" segmented row with the same two properties + `全部館別`. Result: duplicate columns.

- Remove the local segmented row from `owner.dashboard.tsx`.
- Keep a single segmented control in the header area that combines both roles: `胡桃民宿 · 安平九號 · 全部館別`. Selecting a property also updates `currentPropertyId`; `全部館別` is a view-only override that widens data but leaves `currentPropertyId` untouched.
- On dashboard/submissions pages, hide `OwnerShell`'s `PropertySwitcher` and let the page own the combined control. Add an `OwnerShell` prop `hidePropertySwitcher?: boolean` to opt in; other settings pages keep the switcher (they always operate on a single property).

## 2. Sidebar: add 密碼 entry

`OwnerShell` sidebar `navItems` currently: 儀表板, 入住申請, 民宿設定. Add:

- `{ to: "/owner/settings/passwords", label: "密碼設定", icon: KeyRound }` inserted between 入住申請 and 民宿設定, matched by exact path so 民宿設定 highlight is unaffected.
- Keep the top-bar `密碼` shortcut on mobile only; drop it from the desktop header since sidebar now has it (avoids duplication).

## 3. Denser password list

`owner.settings.passwords.tsx` today renders one large card per room. Make it scale for 20+ rooms:

- Group by 房型 as collapsible accordions (default: current property's first group open; others collapsed). Header row of each group shows: 房型名稱 · 房間數 · 大門密碼模式 · 未儲存徽章.
- Inside each group, render a compact table (desktop) / stacked card (mobile) with columns: 房號/別名 · 房門密碼 (masked with 顯示 toggle) · 房型共用大門密碼 (when mode = shared) · 備註 · 儲存.
- Sticky in-page mini-nav (房型 chips) on desktop jumps to accordion sections.
- Top-of-page controls: 全部展開 / 全部收合, 全部顯示密碼 / 全部隱藏, search box that filters by 房號/別名/密碼.
- Preserve per-group Save behavior; add a per-row "只儲存這間" quick save.

## 4. Cross-device / PWA polish

Not a native app — but make the web app feel right on desktop and every mobile browser:

- Audit tap targets to min 40x40 on all owner + guest pages; enlarge the pill controls that are currently ~28px tall on mobile.
- Add `viewport-fit=cover` + safe-area padding (`env(safe-area-inset-*)`) to `__root.tsx` head + main layouts so iOS notch/home-indicator don't clip sticky headers/footers.
- Add PWA manifest (`public/manifest.webmanifest`) + icons + `apple-touch-icon` + theme-color so users can "Add to Home Screen" on iOS/Android and get an app-like launcher. No service worker in this pass (avoid stale-cache traps).
- Verify horizontal-scroll offenders: password table wraps to cards <640px; dashboard segmented control already snap-scrolls, keep it.
- Test matrix documented in plan.md: Chrome/Safari/Firefox desktop, iOS Safari, Android Chrome, Samsung Internet.

## 5. ID watermark on guest uploads

`checkin.demo.id-upload.tsx` accepts photos. Add a watermark applied client-side right after compression, before persisting:

- Extend `src/lib/media-upload.ts` with `watermarkImage(blob, text)` that draws the original image to a canvas, overlays a repeating diagonal watermark ("僅供入住核對使用 · For verification only · {今日日期}") at ~30% opacity, and returns a new Blob. Font size scales with image width.
- ID-upload flow calls compress → watermark → store. Original un-watermarked file is discarded (owner only ever sees the watermarked version).
- Owner submission detail preview shows the same watermarked image; a small caption "已加浮水印" explains why.
- Copy the guest-facing notice on the upload screen: "為保護您的證件，上傳後將自動加上『僅供核對』浮水印。"

## 6. Full guest name in list rows

Dashboard + submissions list currently truncate long names because the row uses `flex flex-wrap` + `truncate`. Rework the row layout per the responsive-layout rule:

- Container: `grid grid-cols-[auto_minmax(0,1fr)_auto]` — avatar, name/meta column, chevron.
- Name/property chip line: name gets `truncate` but the parent gets `min-w-0`; property chip goes to a second line on narrow widths (using `flex flex-wrap`) so it never eats horizontal budget from the name.
- On rows narrower than ~360px, chevron is hidden (already done); date/#id line stays as its own row.
- Apply same layout to `owner.submissions.index.tsx`.

## 7. Approval page: edit password inline + always show 已寄出的入住資訊 after 首次寄出

`owner.submissions.$id.tsx`:

- Source of truth stays `密碼設定` page (`property-config` store). Add an inline pencil button next to each room's "釋出密碼" that opens a small popover to edit 房門密碼 and 大門密碼 for that room. Saving writes through `updateRoom` / `updateProperty` — this is the same store, so all consumers stay consistent.
- Because the write touches the store, the drift detector in the existing `已寄出的入住資訊` card automatically flags "資訊已變更，尚未通知旅客" and offers "重新寄送更新" — no extra plumbing.
- Add a "改用 密碼設定 頁編輯" link on the popover for owners who prefer bulk edits.
- Track record: each `updates.notify` call already bumps `lastVersion` and stores diffSummary. Surface a compact history list at the bottom of the box ("版本歷程"): v1 → v2 diffs with timestamps. Extend `submission-updates.ts` to keep a `history: { version, at, diffSummary, channel }[]` array in addition to the current latest snapshot.

## 8. 已寄出的入住資訊 appears only after first release

Per item 9 of the request. Today the box always renders. Change to:

- Track `releasedRooms` (already local state). Persist it in a new lightweight store slice keyed by `submissionId` so it survives navigation (add to `submission-updates.ts` or a small companion store).
- Only render the `已寄出的入住資訊` card once `releasedRooms.length > 0` OR a `record` exists.
- The "首次寄出入住資訊" button auto-fires the first time all booked rooms have been released, or is presented as the last step of the release flow.

## 9. Submission detail header cleanup

Same file: the header currently shows `PropertySwitcher` and the `密碼` shortcut inherited from `OwnerShell`. On a submission page:

- Hide `PropertySwitcher` (via the new `hidePropertySwitcher` prop) and the header `密碼` shortcut. Replace them with a **PropertyBadge** showing the submission's property + a `#申請編號` chip. This makes it unambiguous which property the booking belongs to and prevents accidental context switches while reviewing.
- Do the same on `owner.submissions.$id` for mobile (mobile top area of `OwnerShell` also renders the switcher — gate by prop).

## 10. Manual room assignment

Right now `roomsFor()` deterministically picks the first N rooms — owners never chose. Replace with an explicit assignment flow:

- Extend submission data: add `assignedRoomIds: string[]` and `requestedRoomCount: number` (default 1) to `OwnerSubmission` in `owner-demo.ts`. Seed existing demo submissions with realistic values.
- New store `useRoomAssignments` (zustand + persist) keyed by `submissionId` so demo edits stick. Falls back to `submission.assignedRoomIds` when empty.
- In `owner.submissions.$id.tsx`, add a new card **"分配房間"** placed ABOVE "訂購房間與密碼釋出":
  - Shows `requestedRoomCount` and current assignment count with a mismatch warning.
  - List each房型 group with its available rooms (checkbox multi-select). Disable rooms already assigned to overlapping submissions (compute overlap client-side across `demoSubmissions` + assignments store).
  - Buttons: 儲存分配 · 清除. Save writes to store; toast.
- "訂購房間與密碼釋出" derives its list from the assignments store instead of `roomsFor()`. When no room assigned yet, show an empty state with a "先分配房間" CTA that scrolls to the assignment card, and hide the release buttons.
- Guest-side (`checkin.demo.submitted.tsx`) reads the same store so guests see the actually-assigned room, not a mock.
- Submissions list gets a small badge "未分配房間" for approved-but-unassigned rows.

## Technical notes

- No new npm dependencies. Canvas watermark uses browser canvas; PWA manifest is plain JSON.
- All new state lives in zustand+persist stores, matching existing patterns; no schema/backend changes.
- New `hidePropertySwitcher` prop on `OwnerShell` — default false to keep other pages unchanged.
- Route paths, auth, and existing store shapes stay compatible; extensions are additive.

## Files touched

- edit: `src/components/owner/OwnerShell.tsx` (sidebar item, hidePropertySwitcher prop, mobile shortcut only)
- edit: `src/routes/owner.dashboard.tsx` (remove duplicate segmented row, combined control, full-name row layout)
- edit: `src/routes/owner.submissions.index.tsx` (row layout, 未分配房間 badge, combined control)
- edit: `src/routes/owner.submissions.$id.tsx` (PropertyBadge header, inline password edit, gated 已寄出 box, room assignment card, version history)
- edit: `src/routes/owner.settings.passwords.tsx` (accordion + compact table + search + bulk toggles + mini nav)
- edit: `src/routes/checkin.demo.id-upload.tsx` (call watermark, add notice)
- edit: `src/routes/checkin.demo.submitted.tsx` (read assignment store)
- edit: `src/lib/media-upload.ts` (add `watermarkImage`)
- edit: `src/lib/owner-demo.ts` (`assignedRoomIds`, `requestedRoomCount`)
- edit: `src/lib/submission-updates.ts` (history array, released-rooms slice)
- edit: `src/routes/__root.tsx` (viewport-fit, manifest link, apple-touch-icon, theme-color)
- new: `src/lib/room-assignments.ts` (zustand store)
- new: `public/manifest.webmanifest` + icons
