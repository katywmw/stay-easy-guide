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

        {/* Quick grid — bento with distinct visuals */}
        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-base font-black text-foreground">快速功能</h2>
          <span className="text-[11px] font-semibold text-muted-foreground">Quick access</span>
        </div>

        <div className="mt-3 grid grid-cols-6 gap-3">
          {/* 線上入住 — big feature */}
          <Link
            to="/checkin/demo/start"
            className="group relative col-span-6 overflow-hidden rounded-3xl p-5 text-foreground transition active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(120deg, oklch(0.92 0.20 92) 0%, oklch(0.84 0.22 78) 55%, oklch(0.74 0.20 62) 100%)",
              boxShadow: "0 18px 40px -18px oklch(0.72 0.20 70 / 0.7)",
            }}
          >
            <div
              aria-hidden
              className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/35 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute right-4 bottom-3 text-6xl leading-none opacity-90 drop-shadow-sm"
            >
              📝
            </div>
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Step 1
              </div>
              <div className="mt-1 text-xl font-black">線上入住</div>
              <p className="mt-1 max-w-[60%] text-xs leading-relaxed opacity-80">
                填寫資料，讓入住更順暢
              </p>
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-foreground">
                開始填寫
                <ArrowRight className="h-3 w-3" strokeWidth={2.8} />
              </span>
            </div>
          </Link>

          {/* 押金 — coins */}
          <Link
            to="/checkin/demo/deposit"
            className="relative col-span-3 overflow-hidden rounded-3xl border border-[oklch(0.85_0.10_145)] p-4 transition active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.97 0.06 145) 0%, oklch(0.90 0.12 145) 100%)",
            }}
          >
            <div className="flex items-center gap-1">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.90_0.16_140)] text-sm font-black text-[oklch(0.30_0.08_150)] shadow-sm ring-2 ring-white">
                $
              </span>
              <span className="-ml-3 grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.85_0.18_140)] text-sm font-black text-white shadow-sm ring-2 ring-white">
                $
              </span>
              <span className="-ml-3 grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.78_0.19_140)] text-sm font-black text-white shadow-sm ring-2 ring-white">
                $
              </span>
            </div>
            <div className="mt-3 text-sm font-black text-foreground">押金資訊</div>
            <div className="mt-0.5 text-[11px] text-[oklch(0.40_0.08_140)]">付款方式與退還</div>
          </Link>

          {/* FAQ — speech bubble */}
          <Link
            to="/checkin/demo/faq"
            className="relative col-span-3 overflow-hidden rounded-3xl border border-[oklch(0.85_0.10_35)] p-4 transition active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.97 0.06 35) 0%, oklch(0.92 0.11 40) 100%)",
            }}
          >
            <div className="relative h-10 w-14">
              <div className="absolute left-0 top-0 grid h-9 w-11 place-items-center rounded-2xl rounded-bl-sm bg-white text-sm font-black text-[oklch(0.55_0.16_35)] shadow-sm">
                ?
              </div>
              <div className="absolute right-0 bottom-0 grid h-6 w-7 place-items-center rounded-xl rounded-tr-sm bg-[oklch(0.70_0.18_35)] text-[10px] font-black text-white shadow-sm">
                !
              </div>
            </div>
            <div className="mt-2 text-sm font-black text-foreground">常見問題</div>
            <div className="mt-0.5 text-[11px] text-[oklch(0.45_0.10_35)]">入住 Q&amp;A</div>
          </Link>

          {/* 入住須知 — scroll paper */}
          <Link
            to="/checkin/demo/house-rules"
            className="relative col-span-3 overflow-hidden rounded-3xl border border-[oklch(0.88_0.04_75)] bg-white p-4 transition active:scale-[0.98]"
          >
            <div className="relative">
              <div className="h-14 w-11 rounded-lg bg-[oklch(0.96_0.04_75)] shadow-sm">
                <div className="mx-2 mt-2 h-1 rounded-full bg-[oklch(0.80_0.08_60)]" />
                <div className="mx-2 mt-1.5 h-1 w-6 rounded-full bg-[oklch(0.85_0.06_60)]" />
                <div className="mx-2 mt-1.5 h-1 rounded-full bg-[oklch(0.85_0.06_60)]" />
                <div className="mx-2 mt-1.5 h-1 w-5 rounded-full bg-[oklch(0.85_0.06_60)]" />
              </div>
              <div className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-black text-primary-foreground shadow ring-2 ring-white">
                ✓
              </div>
            </div>
            <div className="mt-2 text-sm font-black text-foreground">入住須知</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">請閱讀並同意</div>
          </Link>

          {/* 入住指引 — key */}
          <Link
            to="/checkin/demo/guide"
            className="relative col-span-3 overflow-hidden rounded-3xl border border-[oklch(0.55_0.06_55)] p-4 text-white transition active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(155deg, oklch(0.42 0.06 55) 0%, oklch(0.30 0.05 55) 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute -right-4 -bottom-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
            />
            <div className="relative flex items-center gap-2">
              <KeyRound className="h-8 w-8 text-primary" strokeWidth={2.2} />
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                Locked
              </span>
            </div>
            <div className="mt-3 text-sm font-black">入住指引</div>
            <div className="mt-0.5 text-[11px] opacity-70">審核通過後開放</div>
          </Link>
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
