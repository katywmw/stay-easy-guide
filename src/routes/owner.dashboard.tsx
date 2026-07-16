import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wallet,
  LogOut,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useOwnerAuth } from "@/lib/owner-auth";
import { usePropertySettings } from "@/lib/property-settings";
import { demoSubmissions, ownerStats } from "@/lib/owner-demo";
import { platformLabels } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/owner/dashboard")({
  component: OwnerDashboard,
  head: () => ({ meta: [{ title: "業者 Dashboard · 胡桃民宿" }] }),
});

function OwnerDashboard() {
  const nav = useNavigate();
  const { loggedIn, logout } = useOwnerAuth();

  useEffect(() => {
    if (!loggedIn) nav({ to: "/owner/login" });
  }, [loggedIn, nav]);

  const recent = demoSubmissions.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">胡桃民宿 · 業者後台</p>
            <h1 className="truncate text-2xl font-black text-foreground sm:text-3xl">
              歡迎回來
            </h1>
          </div>
          <button
            onClick={() => {
              logout();
              nav({ to: "/owner/login" });
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <LogOut className="h-3.5 w-3.5" />
            登出
          </button>
        </header>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="今日入住"
            value={ownerStats.today}
            icon={CalendarDays}
            tone="primary"
          />
          <StatCard
            label="等待審核"
            value={ownerStats.awaitingReview}
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label="需補件"
            value={ownerStats.needMoreInfo}
            icon={AlertCircle}
            tone="destructive"
          />
          <StatCard
            label="已核准"
            value={ownerStats.approved}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="押金待確認"
            value={ownerStats.depositPending}
            icon={Wallet}
            tone="warning"
          />
        </div>

        {/* Recent */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
            <ClipboardList className="h-5 w-5" />
            近期入住申請
          </h2>
          <Link
            to="/owner/submissions"
            className="text-sm font-semibold text-[oklch(0.55_0.13_75)]"
          >
            查看全部 →
          </Link>
        </div>

        <ul className="mt-4 space-y-3">
          {recent.map((r) => {
            const st = checkinStatusPill(r.status);
            const dp = depositPill(r.deposit);
            return (
              <li key={r.id}>
                <Link
                  to="/owner/submissions/$id"
                  params={{ id: r.id }}
                  className="card-soft flex flex-col gap-3 p-4 transition hover:border-primary/40 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-bold text-foreground">
                        {r.name}
                      </p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {platformLabels[r.platform]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      入住 {r.checkIn} · {r.guests} 人
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill label={st.label} tone={st.tone} />
                      <StatusPill label={`押金 · ${dp.label}`} tone={dp.tone} />
                    </div>
                  </div>
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
                </Link>
              </li>
            );
          })}
        </ul>

        <PropertySettingsCard />
      </div>
    </div>
  );
}

function PropertySettingsCard() {
  const s = usePropertySettings();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      s.update({ linePayQrDataUrl: String(reader.result) });
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <section className="card-soft mt-8 p-5">
      <h2 className="text-lg font-black text-foreground">入住表單設定</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        調整旅客線上入住時看到的欄位與收費。
      </p>

      <div className="mt-4 space-y-4">
        <ToggleRow
          label="詢問「是否需要停車資訊」"
          desc="開啟後旅客會在入住人資訊步驟看到此欄位。"
          checked={s.askParking}
          onChange={(v) => s.update({ askParking: v })}
        />

        <ToggleRow
          label="詢問「是否攜帶寵物」"
          desc="開啟後旅客會在入住人資訊步驟看到此欄位。"
          checked={s.askPet}
          onChange={(v) => s.update({ askPet: v })}
        />

        {s.askPet && (
          <div className="rounded-2xl bg-secondary p-4">
            <ToggleRow
              label="加收寵物費"
              desc="旅客勾選攜帶寵物時，於押金頁自動加總。"
              checked={s.petFeeEnabled}
              onChange={(v) => s.update({ petFeeEnabled: v })}
            />
            {s.petFeeEnabled && (
              <label className="mt-3 block">
                <span className="text-sm font-semibold text-foreground">
                  每晚寵物費（NT$）
                </span>
                <input
                  type="number"
                  min={0}
                  value={s.petFeePerNight}
                  onChange={(e) =>
                    s.update({ petFeePerNight: Number(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </label>
            )}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-semibold text-foreground">押金金額（NT$）</span>
          <input
            type="number"
            min={0}
            value={s.depositAmount}
            onChange={(e) =>
              s.update({ depositAmount: Number(e.target.value) || 0 })
            }
            className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-foreground">LINE Pay 收款 QR</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            上傳後旅客選擇 LINE Pay 付款時會看到此 QR Code。
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
          <div className="mt-3 flex items-start gap-3">
            {s.linePayQrDataUrl ? (
              <img
                src={s.linePayQrDataUrl}
                alt="LINE Pay QR"
                className="h-24 w-24 rounded-lg border border-border bg-card object-contain p-1"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-lg border border-dashed border-border bg-card text-xs text-muted-foreground">
                尚未上傳
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                {s.linePayQrDataUrl ? "更換 QR" : "上傳 QR"}
              </button>
              {s.linePayQrDataUrl && (
                <button
                  type="button"
                  onClick={() => s.update({ linePayQrDataUrl: null })}
                  className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
                >
                  移除
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
  tone: "primary" | "warning" | "success" | "destructive";
}) {
  const toneClasses = {
    primary: "bg-primary-soft text-foreground",
    warning: "bg-warning-soft text-[oklch(0.45_0.13_55)]",
    success: "bg-success-soft text-success",
    destructive: "bg-destructive-soft text-destructive",
  }[tone];
  return (
    <div className="card-soft p-4">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${toneClasses}`}>
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
