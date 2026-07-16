import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import {
  ChipGroup,
  PrimaryButton,
  TextField,
} from "@/components/checkin/Fields";
import {
  platformLabels,
  useCheckinStore,
  type BookingPlatform,
} from "@/lib/checkin-store";
import { usePropertyConfig } from "@/lib/property-config";
import { Check, Key, Lock } from "lucide-react";

export const Route = createFileRoute("/checkin/demo/booking")({
  component: BookingPage,
  head: () => ({ meta: [{ title: "訂房資料 · 胡桃民宿" }] }),
});

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function BookingPage() {
  const nav = useNavigate();
  const s = useCheckinStore();
  const { properties, rooms, roomGroups } = usePropertyConfig();

  const today = todayISO();
  const minCheckout = s.checkInDate ? addDaysISO(s.checkInDate, 1) : today;

  const activePropertyId = s.propertyId || properties[0]?.id || "";
  const availableGroups = roomGroups.filter((g) => g.propertyId === activePropertyId);
  const availableRooms = rooms.filter((r) => r.propertyId === activePropertyId);

  const toggleRoom = (id: string) => {
    const next = s.selectedRoomIds.includes(id)
      ? s.selectedRoomIds.filter((x) => x !== id)
      : [...s.selectedRoomIds, id];
    s.update({ selectedRoomIds: next });
  };

  const handleCheckIn = (v: string) => {
    const patch: Partial<typeof s> = { checkInDate: v };
    if (s.checkOutDate && v && s.checkOutDate <= v) {
      patch.checkOutDate = "";
    }
    s.update(patch);
  };

  const canNext =
    s.platform &&
    s.bookingName &&
    s.phone &&
    s.checkInDate &&
    s.checkOutDate &&
    s.checkOutDate > s.checkInDate &&
    s.selectedRoomIds.length > 0;

  return (
    <PhoneShell
      title="訂房資料"
      subtitle="步驟 1 / 6"
      backTo="/checkin/demo/start"
    >
      <StepBar current={1} />

      <div className="card-soft mt-4 p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          標示 <span className="font-bold text-destructive">*</span> 為必填欄位
        </p>

        {properties.length > 1 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              入住館別
            </label>
            <select
              value={activePropertyId}
              onChange={(e) =>
                s.update({ propertyId: e.target.value, selectedRoomIds: [] })
              }
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            入住房間 <span className="ml-1 text-destructive">*</span>
            {s.selectedRoomIds.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                已選 {s.selectedRoomIds.length} 間
              </span>
            )}
          </label>
          <div className="space-y-4">
            {availableGroups.map((g) => {
              const groupRooms = availableRooms.filter((r) => r.groupId === g.id);
              if (groupRooms.length === 0) return null;
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black text-foreground">{g.name}</p>
                    {g.bedType && (
                      <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold">
                        {g.bedType}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {g.accessMode === "password" ? (
                        <Lock className="h-2.5 w-2.5" />
                      ) : (
                        <Key className="h-2.5 w-2.5" />
                      )}
                      {g.accessMode === "password" ? "密碼進門" : "鑰匙"}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                      押金 NT$ {g.depositAmount.toLocaleString()}／間
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupRooms.map((r) => {
                      const active = s.selectedRoomIds.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => toggleRoom(r.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                            active
                              ? "border-primary bg-primary-soft"
                              : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${
                              active ? "border-primary bg-primary" : "border-border bg-card"
                            }`}
                          >
                            {active && <Check className="h-3 w-3 text-primary-foreground" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">
                              {r.roomNumber ? `房號 ${r.roomNumber}` : r.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {g.description || g.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* Ungrouped rooms (legacy) */}
            {availableRooms.filter((r) => !r.groupId).map((r) => {
              const active = s.selectedRoomIds.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRoom(r.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${
                      active ? "border-primary bg-primary" : "border-border bg-card"
                    }`}
                  >
                    {active && <Check className="h-3 w-3 text-primary-foreground" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {r.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                      押金 NT$ {r.depositAmount.toLocaleString()}
                    </p>
                  </div>
                </button>
              );
            })}
            {availableRooms.length === 0 && (
              <p className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-center text-xs text-muted-foreground">
                此館別尚未建立房間，請聯繫民宿。
              </p>
            )}
          </div>
        </div>

        <ChipGroup<BookingPlatform>
          label="訂房平台"
          value={s.platform}
          onChange={(v) => s.update({ platform: v })}
          options={(Object.keys(platformLabels) as BookingPlatform[]).map(
            (k) => ({ value: k, label: platformLabels[k] }),
          )}
        />

        <TextField
          label="訂房姓名"
          required
          placeholder="請輸入訂房人姓名"
          value={s.bookingName}
          hint="請填寫與訂房平台相同的訂房姓名，方便民宿核對資料。"
          onChange={(e) => s.update({ bookingName: e.target.value })}
        />

        <TextField
          label="手機號碼"
          required
          type="tel"
          placeholder="09XX-XXX-XXX"
          value={s.phone}
          onChange={(e) => s.update({ phone: e.target.value })}
        />

        <TextField
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={s.email}
          onChange={(e) => s.update({ email: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="入住日期"
            required
            type="date"
            min={today}
            value={s.checkInDate}
            onChange={(e) => handleCheckIn(e.target.value)}
          />
          <TextField
            label="退房日期"
            required
            type="date"
            min={minCheckout}
            value={s.checkOutDate}
            onChange={(e) => s.update({ checkOutDate: e.target.value })}
          />
        </div>

        {s.checkInDate && s.checkOutDate && s.checkOutDate <= s.checkInDate && (
          <p className="-mt-2 mb-3 text-xs font-semibold text-destructive">
            退房日期需晚於入住日期。
          </p>
        )}

        <TextField
          label="訂單編號（可選）"
          placeholder="訂房平台提供的訂單編號"
          value={s.orderId}
          onChange={(e) => s.update({ orderId: e.target.value })}
        />
      </div>

      <div className="mt-6">
        <PrimaryButton
          disabled={!canNext}
          onClick={() => nav({ to: "/checkin/demo/guest-info" })}
        >
          下一步：填寫入住人資訊
        </PrimaryButton>
      </div>
    </PhoneShell>
  );
}

export function StepBar({ current }: { current: number }) {
  const total = 6;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < current ? "bg-primary" : "bg-secondary"
          }`}
        />
      ))}
    </div>
  );
}
