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

export const Route = createFileRoute("/checkin/demo/booking")({
  component: BookingPage,
  head: () => ({ meta: [{ title: "訂房資料 · 胡桃民宿" }] }),
});

function BookingPage() {
  const nav = useNavigate();
  const s = useCheckinStore();

  const canNext =
    s.platform && s.bookingName && s.phone && s.checkInDate && s.checkOutDate;

  return (
    <PhoneShell
      title="訂房資料"
      subtitle="步驟 1 / 6"
      backTo="/checkin/demo/start"
    >
      <StepBar current={1} />

      <div className="card-soft mt-4 p-4">
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
          placeholder="請輸入訂房人姓名"
          value={s.bookingName}
          hint="請填寫與訂房平台相同的訂房姓名，方便民宿核對資料。"
          onChange={(e) => s.update({ bookingName: e.target.value })}
        />

        <TextField
          label="手機號碼"
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
            type="date"
            value={s.checkInDate}
            onChange={(e) => s.update({ checkInDate: e.target.value })}
          />
          <TextField
            label="退房日期"
            type="date"
            value={s.checkOutDate}
            onChange={(e) => s.update({ checkOutDate: e.target.value })}
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
          下一步：入住人資訊
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
