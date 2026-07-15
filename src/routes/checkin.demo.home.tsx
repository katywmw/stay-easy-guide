import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Wallet,
  HelpCircle,
  ScrollText,
  KeyRound,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { useCheckinStore } from "@/lib/checkin-store";
import { checkinStatusPill, StatusPill } from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/checkin/demo/home")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "胡桃民宿 · 線上自助入住" },
      { name: "description", content: "歡迎入住胡桃民宿，請於抵達前完成線上入住資料。" },
    ],
  }),
});

function HomePage() {
  const status = useCheckinStore((s) => s.status);
  const checkIn = useCheckinStore((s) => s.checkInDate);
  const pill = checkinStatusPill(status);

function HomePage() {
  const status = useCheckinStore((s) => s.status);
  const checkIn = useCheckinStore((s) => s.checkInDate);
  const pill = checkinStatusPill(status);

  return (
    <PhoneShell showBack={false} bare>
      <div className="px-4 pt-[max(env(safe-area-inset-top),1.25rem)]">
        {/* Greeting */}
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_6px_18px_-6px_oklch(0.75_0.14_85_/_0.7)]">
            <Sparkles className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">歡迎入住</p>
            <h1 className="truncate text-lg font-black text-foreground">胡桃民宿</h1>
          </div>
        </div>

        {/* Hero card */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-foreground"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.90 0.11 88) 0%, oklch(0.83 0.14 85) 60%, oklch(0.78 0.13 75) 100%)",
          }}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/25 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold opacity-80">Check-in 狀態</p>
            <div className="mt-1 flex items-center gap-2">
              <StatusPill label={pill.label} tone={pill.tone} />
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              歡迎入住，請於抵達前完成線上入住資料，讓您的入住流程更順利。
            </p>
            <Link
              to="/checkin/demo/start"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground/90 px-5 py-2.5 text-sm font-bold text-background"
            >
              {status === "draft" ? "開始線上入住" : "繼續入住流程"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Booking meta */}
        {checkIn && (
          <div className="card-soft mt-4 flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">入住日</p>
              <p className="mt-0.5 text-base font-bold text-foreground">{checkIn}</p>
            </div>
            <Link to="/checkin/demo/review" className="text-sm font-semibold text-[oklch(0.55_0.13_75)]">
              查看資料 →
            </Link>
          </div>
        )}

        {/* Quick grid */}
        <h2 className="mb-3 mt-6 text-sm font-bold text-foreground">快速功能</h2>
        <div className="grid grid-cols-2 gap-3">
          {quick.map(({ to, label, icon: Icon, tint }) => (
            <Link
              key={to}
              to={to}
              className="card-soft flex flex-col gap-3 p-4 transition active:scale-[0.98]"
            >
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tint}`}>
                <Icon className="h-5 w-5 text-foreground" strokeWidth={2.2} />
              </div>
              <div className="text-sm font-bold text-foreground">{label}</div>
            </Link>
          ))}
        </div>

        {/* Reminder */}
        <div className="mt-5 rounded-2xl border border-[oklch(0.88_0.06_85)] bg-warning-soft p-4">
          <p className="text-xs font-semibold text-[oklch(0.45_0.13_55)]">溫馨提醒</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80">
            入住指引與門鎖密碼將於民宿審核通過後開放，請留意 LINE 或 Email 訊息。
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}
