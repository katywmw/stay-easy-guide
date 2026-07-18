# Implementation Plan

## Guest end

1. **`checkin.demo.home.tsx`** — update process step 4 text to `確認押金和尾款資訊 (如適用)`.
2. **`checkin.demo.booking.tsx`** — fix checkout date min to `checkInDate + 1` (already computed; verify `<input min>` correctly disables earlier dates by moving `min` to `checkInDate` string directly, plus block manual entry via validation). Phone: switch to a dedicated `PhoneField` that shows a country-code prefix (default `+886`, dropdown for common regions), validates E.164-ish TW numbers (`+886 9XX XXX XXX` or 10-digit `09XXXXXXXX`) with regex, blocks `canNext` when invalid, and shows inline "請輸入有效的手機號碼" error.
3. **`checkin.demo.guest-info.tsx`** — render owner-flagged extra-fee items (`confirmAtCheckin=true`) as Yes/No chip questions below "預計抵達時間". Store answers in `checkinStore.extraFeeAnswers: Record<feeId, "yes"|"no">`. Absorb existing `askPet` behavior into this system: pet becomes just another extra-fee item marked `confirmAtCheckin`.
4. **`checkin.demo.deposit.tsx`** — sum any `answered=yes` extra-fee item amounts into the total breakdown alongside deposit; render one line per item.

## Owner end

1. **`owner.dashboard.tsx`** — add a collapsible month-calendar panel above the recent-submissions list. Each day shows a count badge; hovering/tapping expands to a list of guest names color-coded by property (using `property-colors.ts`). Toggle button `顯示 / 隱藏 日曆檢視`; persists open state.
2. **`owner.submissions.$id.tsx`** — remove the four "已確認" checklist toggles/badges entirely (any remaining after prior pass). Room assignment: remove auto-seed of `releasedRooms` on approve; `核准入住` button becomes disabled when `assignedRoomIds` is empty with hint `請先分配房間`.
3. **`owner.settings.passwords.tsx`** — top selector with 3 modes: `整館共用大門密碼` / `各房獨立設定` / `使用鑰匙`. Store `gateMode` in property config.
   - Mode A: hide gate password inputs per room; keep single top gate field; per-room shows only room password.
   - Mode B: per-room shows both gate + room password inputs.
   - Mode C: reveals "進門方式" text + key photo/video uploader (moved from `owner.settings.guide.tsx` / wherever it currently lives).
   - Add per-room `useKey` checkbox: when checked, reveals a per-room key media uploader independent of global mode.
   - Remove "隱藏全部密碼" toggle.
   - When groups are collapsed, still render room-number chips beneath the group header.
4. **`owner.settings.faq.tsx`** — remove `匯入系統預設題庫` button; ensure defaults seed unconditionally on first mount (via `property-config` initializer already added).
5. **`owner.settings.extra-fees.tsx`** — add a `入住時確認` checkbox column next to `預設金額`. Persists `confirmAtCheckin: boolean` on each `ExtraFeeItem`. Seed a default 寵物費 row with the flag on.

## Cross-end sync

The sync already exists via `zustand persist` (localStorage) for `property-config`, `property-settings`, and `live-submissions`. Verified issue: guest and owner tabs read the same origin's localStorage, but zustand `persist` doesn't cross-tab rehydrate on change. Fix by adding a `storage` event listener in each store that calls `useStore.persist.rehydrate()` on matching key.

- **`src/lib/property-config.ts`, `property-settings.ts`, `live-submissions.ts`, `submission-updates.ts`, `room-assignments.ts`, `surcharge-store.ts`** — add a shared helper `attachCrossTabSync(useStore, storageKey)` and call it once per store at module scope.

## Technical details

- Extra-fee data shape:
  ```ts
  type ExtraFeeItem = {
    id: string; name: string; unit: string;
    defaultAmount: number;
    confirmAtCheckin?: boolean;
  }
  ```
- Guest store additions: `extraFeeAnswers: Record<string,"yes"|"no">`.
- Deposit page total = base deposit + Σ(item.defaultAmount × nightsOrOne) for each `answered==="yes"` item flagged `confirmAtCheckin`. Unit `每晚` → multiply nights; else once.
- Phone regex: `/^(\+886\s?9\d{2}\s?\d{3}\s?\d{3}|09\d{8})$/` after stripping spaces/dashes.
- Cross-tab sync helper:
  ```ts
  export function attachCrossTabSync(store: any, key: string) {
    if (typeof window === "undefined") return;
    window.addEventListener("storage", (e) => {
      if (e.key === key) store.persist?.rehydrate();
    });
  }
  ```
- Calendar view: use existing date-fns; render 6-week grid; count `liveSubmissions + demoSubmissions` where `checkInDate` falls within the day.

Proceeding to implement.