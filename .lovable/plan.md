# Implementation Plan — Owner Settings Refinements

Addresses six focused feedback points on the owner end. All work is frontend + local store; no backend changes.

---

## 1. Room list — inline edit (name + password + note)

**File:** `src/routes/owner.settings.rooms.tsx`, `src/lib/property-config.ts`

- Add `displayName?: string` to `Room` type (e.g. "Happy 101"). Fallback display is `roomNumber`.
- In each room row (currently a table row), add a pencil icon button next to the existing Copy / Trash icons.
- Clicking the pencil expands that single row into an inline edit panel with four fields in one card:
  - 房號 (roomNumber)
  - 房間別名 (displayName) — new
  - 房門密碼 (doorPassword, only when group is `password` mode)
  - 備註 (note)
- Panel has "完成" (collapse) button; changes stay in local draft until section-level save (see item 6).
- Room title in collapsed row shows `displayName || roomNumber` with the raw room number as a small secondary label.

---

## 2. 入住須知編輯器 — replace Markdown hint with a real toolbar

**File:** `src/routes/owner.settings.house-rules.tsx`, new `src/components/owner/RichTextEditor.tsx`

- Remove the "支援 Markdown 標題（# / ##）與清單" copy.
- Introduce a lightweight contentEditable-based editor with a sticky toolbar:
  - Text size: H1 / H2 / Body (via `document.execCommand('formatBlock')`)
  - Bold, Italic, Underline
  - Bulleted list, Numbered list
  - Insert link (prompt for URL)
  - Clear formatting
- Store as HTML string in `houseRules` (keep field name). Sanitize on render with a small allowlist (`b, i, u, a[href], h1, h2, ul, ol, li, p, br`).
- Guest side (`checkin.demo.house-rules.tsx`) renders sanitized HTML instead of Markdown.
- Migration: existing Markdown content is preserved as plain text (line-broken `<p>`s); user can re-format via toolbar.

Note: this is a minimal in-house editor to avoid adding a heavy dependency. If richer behavior is later requested we can swap to Tiptap.

---

## 3. 入住指引模板 — reorder, lightbox, video

**Files:** `src/routes/owner.settings.guide.tsx`, `src/components/checkin/ImageLightbox.tsx`, `src/routes/checkin.demo.guide.tsx`, `src/lib/property-config.ts`

- Change `guidePhotos[k]: string[]` → `guideMedia[k]: Array<{ id: string; kind: "image" | "video"; url: string }>`. Migrate on load: existing strings → `{kind:"image"}`.
- File picker accepts `image/*,video/*`. Videos stored as data URLs (same pattern as images); show a small "影片" badge on the thumbnail.
- Reorder: native HTML5 drag-and-drop on the thumbnail strip (draggable tiles, drop reorders within the same field group). Also add left/right arrow buttons for accessibility and mobile.
- Enlarge on click: extend `ImageLightbox` to `MediaLightbox` — renders `<img>` for image, `<video controls autoPlay>` for video. Guest guide page opens the same lightbox on tap.
- No cross-field drag (kept scoped to each guide section).

---

## 4. 房型 / 房間密碼 — clearer per-room card + shared/per-room gate password mode

**Files:** `src/routes/owner.settings.passwords.tsx`, `src/lib/property-config.ts`

- Redesign the passwords page from a flat list into a grouped view mirroring the rooms page:
  - Grouped by RoomTypeGroup (雙人床套房 / 單人床 / 整棟…).
  - Each room is its own bordered card (not a table row) showing 房號 / 別名, 房門密碼 field, 大門密碼 field (only when in "per-room" mode), 備註 field.
- Add `gatePasswordMode: "sharedGroup" | "sharedProperty" | "perRoom"` on `RoomTypeGroup`:
  - **sharedProperty** (default) — single 大門密碼 stored on Property config; edited once at the top of the page.
  - **sharedGroup** — one 大門密碼 per room-type group; edited in the group header.
  - **perRoom** — each room card has its own 大門密碼 field.
- Radio switcher lives in each group's header with a short explainer: "適合早退房 / 提早入住 / 多晚不同密碼時使用「每房不同」。"
- Guest guide + submission views resolve gate password by mode.

---

## 5. 密碼釋出規則 — reword and re-anchor to approval

**File:** `src/routes/owner.settings.passwords.tsx` (rules section) + property-config

- Reword the three options:
  - 手動釋出 → "審核通過後，我按下按鈕才寄出密碼"
  - 定時釋出 → "審核通過後，於指定時間自動寄出密碼"（附時間選擇，如 15:00）
  - 條件式釋出 → "審核通過並完成付款後自動寄出"
- Add a leading helper line above the options: "所有規則都必須先完成審核；審核未通過前，密碼不會釋出。"
- Update guest-facing status copy consistently (e.g. "已審核，將於 15:00 收到密碼").

---

## 6. Per-section Save buttons on password-related pages

**Files:** `src/routes/owner.settings.passwords.tsx`, `src/routes/owner.settings.rooms.tsx`, `src/hooks/useDirtyForm.ts`

- Move away from a single page-level SaveBar for these two pages. Instead:
  - Each RoomTypeGroup card owns its own dirty state and its own "儲存" button in the group header (right side, next to the existing copy/delete icons).
  - Button is disabled until that group has unsaved changes; shows "已儲存" briefly after save.
  - Editing gate-password-mode / group-level fields marks that group dirty; editing a room within the group marks the same group dirty.
- Global SaveBar is removed from these two pages (kept on other settings pages).
- `useDirtyForm` extended with an optional `key` so multiple independent dirty scopes can coexist on a page.

---

## Technical notes (for reference)

- No new npm dependencies. RichTextEditor uses `contentEditable` + `execCommand`; sanitizer is a small allowlist string-based helper in `src/lib/sanitize-html.ts`.
- Storage: existing zustand persisted config (`walnut-property-config-v2`) is migrated in-place with a version bump to `v3` (guide media + gate password mode + room displayName).
- Runtime `QuotaExceededError` seen in the preview is caused by large data-URL photos in localStorage; the migration will additionally cap stored media per field to a reasonable count (e.g. 12) and downscale images >1600px on upload before persisting.
- No changes to routes list, auth, or business logic outside these files.

## Files touched

- edit: `src/lib/property-config.ts`
- edit: `src/hooks/useDirtyForm.ts`
- edit: `src/routes/owner.settings.rooms.tsx`
- edit: `src/routes/owner.settings.passwords.tsx`
- edit: `src/routes/owner.settings.house-rules.tsx`
- edit: `src/routes/owner.settings.guide.tsx`
- edit: `src/routes/checkin.demo.guide.tsx`
- edit: `src/routes/checkin.demo.house-rules.tsx`
- edit: `src/components/checkin/ImageLightbox.tsx` (→ MediaLightbox)
- new: `src/components/owner/RichTextEditor.tsx`
- new: `src/lib/sanitize-html.ts`
