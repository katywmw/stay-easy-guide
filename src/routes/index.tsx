import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Store, Sparkles, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "胡桃民宿 · 線上自助入住" },
      {
        name: "description",
        content: "為台灣民宿打造的行動優先線上 Check-in 原型，親切、明亮、簡單。",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Warm gradient sky */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, oklch(0.94 0.17 92) 0%, oklch(0.97 0.10 92) 40%, transparent 75%)",
        }}
      />
      {/* Floating blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-32 h-56 w-56 rounded-full opacity-70 blur-3xl"
        style={{ background: "oklch(0.90 0.18 78)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{ background: "oklch(0.92 0.14 145)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 bottom-32 h-40 w-40 rounded-full opacity-50 blur-3xl"
        style={{ background: "oklch(0.90 0.15 35)" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-[max(env(safe-area-inset-top),3rem)]">
        {/* Chip */}
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-[oklch(0.85_0.12_90)] bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-[oklch(0.65_0.16_70)]" strokeWidth={2.6} />
          線上自助入住系統 · Prototype
        </div>

        {/* Hero */}
        <div className="relative">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.50_0.08_60)]">
            <MapPin className="h-3.5 w-3.5" />
            台灣・宜蘭礁溪
          </div>
          <h1 className="text-[42px] font-black leading-[1.05] tracking-tight text-foreground">
            歡迎回家，
            <br />
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(100deg, oklch(0.60 0.16 70) 0%, oklch(0.72 0.19 60) 55%, oklch(0.65 0.17 40) 100%)",
              }}
            >
              胡桃民宿
            </span>
            <span className="ml-2 inline-block text-3xl">🏡</span>
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[oklch(0.42_0.05_55)]">
            一個為台灣民宿設計的行動優先線上 Check-in 原型。
            <br />
            選擇角色，開始體驗吧！
          </p>
        </div>

        {/* Illustrative card cluster */}
        <div className="relative mt-10 mb-8 h-40">
          <div
            className="absolute left-4 top-6 h-24 w-24 rotate-[-8deg] rounded-3xl shadow-[0_20px_40px_-15px_oklch(0.60_0.14_70_/_0.45)]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.95 0.10 145) 0%, oklch(0.82 0.14 145) 100%)",
            }}
          />
          <div
            className="absolute right-6 top-0 h-28 w-28 rotate-[6deg] rounded-3xl shadow-[0_20px_40px_-15px_oklch(0.60_0.14_70_/_0.5)]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.94 0.14 35) 0%, oklch(0.82 0.16 45) 100%)",
            }}
          />
          <div
            className="absolute left-1/2 top-10 h-32 w-40 -translate-x-1/2 rotate-[-2deg] rounded-3xl border-2 border-white/60 shadow-[0_25px_50px_-15px_oklch(0.65_0.18_75_/_0.55)]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.94 0.18 92) 0%, oklch(0.85 0.19 78) 100%)",
            }}
          >
            <div className="flex h-full flex-col justify-between p-4 text-[oklch(0.30_0.05_55)]">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Check-in
              </div>
              <div>
                <div className="text-lg font-black leading-none">Room 302</div>
                <div className="mt-1 text-[10px] font-semibold opacity-70">
                  2 位・2 晚
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/checkin/demo/home"
          className="group relative flex items-center justify-between overflow-hidden rounded-[28px] px-6 py-5 text-primary-foreground transition active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.90 0.19 95) 0%, oklch(0.82 0.20 78) 55%, oklch(0.72 0.18 62) 100%)",
            boxShadow:
              "0 18px 40px -12px oklch(0.72 0.18 70 / 0.65), inset 0 1px 0 0 oklch(1 0 0 / 0.5)",
          }}
        >
          <span
            aria-hidden
            className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl"
          />
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-70">
              旅客入口
            </div>
            <div className="mt-0.5 text-xl font-black">開始線上 Check-in</div>
          </div>
          <div className="relative grid h-12 w-12 place-items-center rounded-full bg-white/90 text-foreground shadow-lg transition group-active:translate-x-1">
            <ArrowRight className="h-5 w-5" strokeWidth={2.6} />
          </div>
        </Link>

        {/* Owner secondary */}
        <Link
          to="/owner/login"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[oklch(0.75_0.06_75)] bg-white/60 px-5 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition active:scale-[0.98]"
        >
          <Store className="h-4 w-4 text-[oklch(0.55_0.08_60)]" />
          我是民宿業者・進入審核後台
        </Link>

        <p className="mt-auto pt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          本頁為原型展示，不包含真實金流、證件儲存或訂房平台串接。
          <br />
          資料僅暫存於此裝置。
        </p>
      </div>
    </div>
  );
}
