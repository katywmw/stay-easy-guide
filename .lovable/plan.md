## Scope

Nine changes across guest flow, approval page, password page, FAQ seeding, pet-fee sync, status banners, and adding a live guest↔owner sync channel for demo testing.

---

### 1. Remove FAQ from guest flow

- `src/routes/checkin.demo.deposit.tsx`, `checkin.demo.id-upload.tsx`: remove the `<FaqAccordion …>` blocks.
- Reroute the flow: skip the standalone `/checkin/demo/faq` step. Change deposit → `house-rules` directly. Keep the file for now but no page links to it. Adjust `StepBar` labels (drop "常見問題", keep 6 steps → 5).
- Keep the FAQ store/editor (still used by owner settings; may be re-exposed elsewhere later).

### 2. Approval page: drop the 4-item checklist

`src/routes/owner.submissions.$id.tsx`

- Delete the `checks` state and `CheckRow` block (訂房/證件/押金/入住須知 已確認).
- Rename card from "內部備註 / Checklist" to just **"內部備註"** and keep only the textarea.
- 核准入住 button: remove `disabled={!allChecked}` — always enabled unless already `approved`. Drop the "請先勾選 checklist" helper text.

### 3. Status banner color system + fix 林大成 approve button

Approved submissions (like `s3` 林大成) still show a disabled 核准入住 button because it also required `allChecked`. After change (2), the button becomes enabled again — but if `status === "approved"` we should show a **positive completed state** instead of an active button.

- Add a helper `bannerTone(status, deposit, released)`:
  - **yellow (warning)**: `submitted` — 等待審核
  - **red (destructive)**: `need_more_info` OR deposit `unpaid` with outstanding surcharge
  - **green (success)**: `approved` AND password released (any `releasedRooms.length > 0` or `record` exists)
  - **blue (primary/info)**: `draft` — 尚未送出
- Apply the tone to the top status-pill row (`已核准`, `押金 · 已確認`, etc.) and to submissions-list row badges.
- Add a new "blue" tone to `StatusPill` (`src/components/checkin/StatusPill.tsx`): `bg-[oklch(0.94_0.04_240)] text-[oklch(0.38_0.15_250)]` + dot.
- When `status === "approved"`, replace the 核准入住 button with a green completed pill `已核准並釋出密碼 · {time}` and hide the disabled button.
- For approved submissions where the passwords were never released in this session (e.g. seed data), auto-seed `releasedRooms` from the current assignment on mount so the "已寄出的入住資訊" box appears correctly for 林大成.

### 4. Password page: front-door mode flexibility + key-mode media

`src/lib/property-config.ts` and `src/routes/owner.settings.passwords.tsx`

- Restore per-group `gatePasswordMode` selector at the top of each group card with 3 options: **整館共用預設 / 此房型獨立設定 / 每房獨立 / 使用鑰匙**. When 使用鑰匙 selected, treat it as `accessMode = "key"` for the gate and hide the password field.
- Add `keyPickupMedia?: string[]` (already exists in the type). Add an uploader block inside the group card when the group's front-door is key mode OR the group's `accessMode === "key"`. Reuse `fileToMediaDataUrl` from `src/lib/media-upload.ts`.
- Remove the key-pickup media uploader from `owner.settings.rooms.tsx` and from `owner.settings.guide.tsx` (item: "which currently 進門方式 and 取鑰匙照片 / 影片 is placed at another section") — the passwords page becomes the single source for password/key material.
- Guest-side `checkin.demo.guide.tsx` continues reading from `keyPickupMedia` on the assigned room's group.

### 5. Password page: mask password only, keep room number

Currently `Input` renders both label and value; when `showAll=false`, `value={maskValue(rd.doorPassword)}` masks only the value — good. But the room title `雙人床套房 · 101` should always remain visible. **The current code already keeps the title visible**; the only masked field is the input value. Confirmed reading the code — the title `<p>{title}</p>` renders unconditionally. However the property-wide gate password input's *label* includes the property name — that's fine. Change to make explicit:

- Ensure both group name (`{group.name}`) and per-room title (`房號 101 / Happy 101`) stay visible unconditionally.
- Only the password value characters are replaced with `••••••` when hidden. Verify by reading the render tree; no code change expected here beyond adding a "房號永遠可見" note in the card description.

### 6. FAQ: seed system defaults by default

`src/lib/property-config.ts`

- Change initial `faq: []` to `faq: faqItems.map(f => ({ ...f, id: uid() }))` (imported from `src/lib/checkin-content.ts`).
- Add a persist `migrate`/`onRehydrateStorage` step: if `state.faq.length === 0`, seed defaults on load.
- `owner.settings.faq.tsx`: keep the 匯入系統預設題庫 button but relabel to **"還原系統預設題庫"** (adds any missing default questions). Owners can freely edit or delete any entry, including defaults.
- `FaqAccordion` already prefers store over defaults — no change.

### 7. Pet fee: surface on guest info page + auto-sum at deposit

`src/routes/checkin.demo.guest-info.tsx`

- When `askPet` is enabled AND `settings.petFeeEnabled` AND `petFeePerNight > 0`, render an inline notice under the pet chip group: **"若攜帶寵物，需加收寵物清潔費 NT$ {petFeePerNight} / 晚（每隻），將於押金頁自動加總。"**
- Deposit page already sums pet fee — no change (working as intended); just verify the label reads "寵物清潔費".

### 8. Guest ↔ owner live sync for demo testing

Currently the guest wizard writes to `useCheckinStore` (a single-user localStorage store) and the owner sees only hardcoded `demoSubmissions`. There is no bridge. Add one:

- New store `src/lib/live-submissions.ts` (zustand + persist, key `walnut-live-submissions`): array of `LiveSubmission` records mirroring `OwnerSubmission` shape + a `source: "live"` flag. Actions: `push(record)`, `update(id, patch)`, `remove(id)`.
- On `checkin.demo.review.tsx` submit, in addition to `useCheckinStore().submit()`, call `liveSubmissions.push({...formData, id: "live-" + Date.now()})`.
- `owner.submissions.index.tsx` and `owner.submissions.$id.tsx` loaders/lists concatenate `demoSubmissions` with `liveSubmissions.all()`. The detail loader looks up by id in the merged list.
- Because zustand-persist writes to `localStorage`, both `/checkin/demo/*` and `/owner/*` tabs in the same browser see the same data — that's the sync channel for prototype testing.
- Two-way sync back to guest:
  - Owner actions already write to `useSubmissionUpdates` (reissue, notify snapshot). Guest submitted page already reads it. Keep that.
  - For live submissions, guest reads its own status from `liveSubmissions.byId(currentId)` after owner mutates `status` (via approve, need_more_info).
  - `owner.submissions.$id.tsx` approve/notifyGuest handlers also call `liveSubmissions.update(id, {status: "approved"})` when the id is a live one.

**Test credentials & flow — added to `src/routes/index.tsx` (or a small "測試指南" section on the guest home)**:

- No real login exists — this is a prototype. Same browser is the sync channel.
- **Guest test path**: open `/checkin/demo/start` in Tab A, fill the wizard with any name/phone/email, submit. Suggested demo values:
  - 姓名 `測試旅客`, 手機 `0900-000-000`, Email `test@demo.tw`, 訂單編號 `TEST-001`.
- **Owner test path**: open `/owner/login` in Tab B, click the 「Demo 登入」 button (existing), then go to `/owner/submissions` — the just-submitted live record appears at the top of the list with a `LIVE` chip.
- **Two-way test scenarios**:
  1. Owner clicks 核准入住 → Tab A `/checkin/demo/submitted` shows green 已核准 banner + password reveal.
  2. Owner clicks 通知旅客 with 補件 request → Tab A shows red 補件 banner with CTA.
  3. Owner edits a room password on password page → Tab A shows updated password after re-reading.
- Add a small `測試沙盒` collapsible on both `/` and `/owner/dashboard` explaining the sync mechanism + a "清除示範資料" button that resets `walnut-live-submissions`, `walnut-checkin-demo`, and `walnut-submission-updates` localStorage keys.

---

## Files touched

- edit: `src/routes/checkin.demo.deposit.tsx` (remove FaqAccordion, route to house-rules)
- edit: `src/routes/checkin.demo.id-upload.tsx` (remove FaqAccordion)
- edit: `src/routes/checkin.demo.booking.tsx` (StepBar 5 steps)
- edit: `src/routes/checkin.demo.guest-info.tsx` (pet fee notice)
- edit: `src/routes/checkin.demo.review.tsx` (push to live store on submit)
- edit: `src/routes/checkin.demo.submitted.tsx` (read live status)
- edit: `src/routes/owner.submissions.$id.tsx` (drop checklist, banner tones, seed released for approved, gate-mode aware, live sync writes)
- edit: `src/routes/owner.submissions.index.tsx` (merge live + banner tones)
- edit: `src/routes/owner.settings.passwords.tsx` (gate mode selector, key-pickup media uploader, description note)
- edit: `src/routes/owner.settings.rooms.tsx` (remove key-pickup media uploader — moved to passwords)
- edit: `src/routes/owner.settings.guide.tsx` (remove key-pickup media if present there)
- edit: `src/routes/owner.settings.faq.tsx` (relabel button)
- edit: `src/components/checkin/StatusPill.tsx` (add "info" blue tone)
- edit: `src/lib/property-config.ts` (seed faq defaults, migrate)
- edit: `src/routes/index.tsx` and/or `owner.dashboard.tsx` (測試沙盒 section)
- new: `src/lib/live-submissions.ts` (zustand persist store for sync)

## Technical notes

- No backend — all sync goes through `localStorage` in the same browser.
- No new npm deps.
- Existing `useSubmissionUpdates` already handles snapshot/notify; live-submissions store only handles the guest→owner "new submission" and owner→guest "status change" edges.
- Persist migration guards against stale users: if `faq: []` on load, hydrate with defaults.
