import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
import { PhoneField, splitPhone } from "@/components/checkin/PhoneField";
import { DateField } from "@/components/checkin/DateField";

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
  const { properties } = usePropertyConfig();

  const today = todayISO();
  const minCheckout = s.checkInDate ? addDaysISO(s.checkInDate, 1) : today;

  // Auto-assign a default property context (owner decides actual room later)
  useEffect(() => {
    if (!s.propertyId && properties[0]) {
      s.update({ propertyId: properties[0].id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckIn = (v: string) => {
    const patch: Partial<typeof s> = { checkInDate: v };
    if (s.checkOutDate && v && s.checkOutDate <= v) {
      patch.checkOutDate = "";
    }
    s.update(patch);
  };

  // Phone validation: parse local part, require 7-14 digits
  const { local: phoneLocal } = splitPhone(s.phone);
  const phoneDigits = phoneLocal.replace(/[^\d]/g, "");
  const phoneValid = phoneDigits.length >= 7 && phoneDigits.length <= 14;

  const canNext =
    !!s.platform &&
    !!s.bookingName &&
    phoneValid &&
    !!s.checkInDate &&
    !!s.checkOutDate &&
    s.checkOutDate > s.checkInDate;

  return (
    <PhoneShell
      title="訂房資料"
      subtitle="步驟 1 / 5"
      backTo="/checkin/demo/start"
    >
      <StepBar current={1} />

      <div className="card-soft mt-4 p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          標示 <span className="font-bold text-destructive">*</span> 為必填欄位。房型與房間將由民宿依訂房資料安排。
        </p>

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

        <PhoneField
          label="手機號碼"
          required
          value={s.phone}
          onChange={(v) => s.update({ phone: v })}
          hint="選擇國碼後輸入號碼即可（預設台灣 +886）。"
          error={
            s.phone && !phoneValid
              ? "請輸入有效的電話號碼。"
              : undefined
          }
        />

        <TextField
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={s.email}
          onChange={(e) => s.update({ email: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <DateField
            label="入住日期"
            required
            value={s.checkInDate}
            onChange={handleCheckIn}
            min={today}
          />
          <DateField
            label="退房日期"
            required
            value={s.checkOutDate}
            onChange={(v) => s.update({ checkOutDate: v })}
            min={minCheckout}
          />
        </div>

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

export function StepBar({ current, total = 5 }: { current: number; total?: number }) {
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
