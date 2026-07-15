import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin, Star, Wifi, Car, Coffee, Wind,
  Phone, MessageCircle, Shield, Clock, ArrowRight, QrCode, Heart,
} from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { useCheckinStore } from "@/lib/checkin-store";
import { checkinStatusPill, StatusPill } from "@/components/checkin/StatusPill";
import heroImg from "@/assets/hero-minsu.jpg";

export const Route = createFileRoute("/checkin/demo/home")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "胡桃民宿 · 線上自助入住" },
      { name: "description", content: "歡迎入住胡桃民宿，請於抵達前完成線上入住資料。" },
    ],
  }),
});

const AMENITIES = [
  { icon: Wifi, label: "免費 WiFi" },
  { icon: Car, label: "免費停車" },
  { icon: Coffee, label: "手沖早餐" },
  { icon: Wind, label: "冷暖空調" },
];

function HomePage() {
  const status = useCheckinStore((s) => s.status);
  const checkIn = useCheckinStore((s) => s.checkInDate);
  const pill = checkinStatusPill(status);

  return (
    <PhoneShell showBack={false} bare>
      {/* Top warm gradient nav */}
      <div
        className="sticky top-0 z-30 -mx-4 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)]"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.88 0.20 90) 0%, oklch(0.80 0.19 72) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <button
            aria-label="menu"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/25 text-white backdrop-blur"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <h1 className="text-base font-black tracking-wide text-white drop-shadow-sm">胡桃民宿</h1>
          <button
            aria-label="favorite"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/25 text-white backdrop-blur"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative -mx-4 h-52 overflow-hidden">
        <img
          src={heroImg}
          alt="胡桃民宿外觀"
          width={1200}
          height={800}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 shadow">
          <Star className="h-4 w-4 fill-[oklch(0.82_0.18_82)] text-[oklch(0.82_0.18_82)]" />
          <span className="text-sm font-bold text-foreground">4.9</span>
          <span className="text-[11px] text-muted-foreground">(128)</span>
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2 py-1 text-[11px] font-medium text-white">
          南投 · 魚池鄉
        </div>
      </div>

      {/* Property info */}
      <div className="-mx-4 border-b border-border bg-card px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-foreground">山景和風 · 胡桃民宿</h2>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-[oklch(0.70_0.16_65)]" />
              <span>台灣 · 南投縣魚池鄉日月潭旁</span>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-[oklch(0.45_0.13_70)]">
            包棟民宿
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          靜謐山林中的木造小屋，享有絕美湖景與山色，提供溫馨舒適的自助入住體驗。
        </p>
      </div>

      {/* Check-in status hero card */}
      <div className="-mx-4 px-4 pt-4">
        <div
          className="relative overflow-hidden rounded-3xl p-4 text-white shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.86 0.22 92) 0%, oklch(0.78 0.20 72) 60%, oklch(0.68 0.18 55) 100%)",
            boxShadow: "0 18px 40px -18px oklch(0.72 0.20 70 / 0.7)",
          }}
        >
          <div
            aria-hidden
            className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/30 blur-2xl"
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/25 backdrop-blur">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-85">
                  Online Check-in
                </p>
                <p className="text-base font-black">線上自助入住</p>
              </div>
              <span className="ml-auto">
                <StatusPill label={pill.label} tone={pill.tone} />
              </span>
            </div>

            <div className="mt-3 rounded-2xl bg-white/95 p-3 text-foreground">
              <p className="text-[11px] font-semibold text-muted-foreground">訂單編號</p>
              <p className="mt-0.5 font-mono text-base font-black tracking-widest">MSU-2026-0715</p>
              {checkIn && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  入住日：<span className="font-bold text-foreground">{checkIn}</span>
                </p>
              )}
            </div>

            <Link
              to="/checkin/demo/start"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[oklch(0.45_0.13_70)] shadow-md transition active:scale-[0.98]"
            >
              {status === "draft" ? "開始線上入住" : "繼續入住流程"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
            </Link>
            <p className="mt-2 text-center text-[11px] text-white/85">
              或掃描房東提供的 QR Code 直接進入
            </p>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <section className="-mx-4 px-4 pt-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-black text-foreground">設施服務</h3>
          <span className="text-[11px] text-muted-foreground">Amenities</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {AMENITIES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="card-soft flex flex-col items-center gap-1.5 p-2.5"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft">
                <Icon className="h-4.5 w-4.5 text-[oklch(0.55_0.15_72)]" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Check-in / out times */}
      <section className="-mx-4 px-4 pt-4">
        <div className="card-soft flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft">
            <Clock className="h-5 w-5 text-[oklch(0.55_0.15_72)]" strokeWidth={2.2} />
          </div>
          <div className="flex flex-1 items-center justify-around text-center">
            <div>
              <div className="text-xl font-black text-[oklch(0.55_0.15_72)]">15:00</div>
              <div className="text-[11px] text-muted-foreground">入住 Check-in</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-xl font-black text-foreground/70">11:00</div>
              <div className="text-[11px] text-muted-foreground">退房 Check-out</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links row */}
      <section className="-mx-4 grid grid-cols-3 gap-2 px-4 pt-4">
        <Link
          to="/checkin/demo/deposit"
          className="card-soft flex flex-col items-start gap-1 p-3 active:scale-[0.98]"
        >
          <span className="text-lg">💳</span>
          <span className="text-xs font-bold text-foreground">押金資訊</span>
          <span className="text-[10px] text-muted-foreground">付款與退還</span>
        </Link>
        <Link
          to="/checkin/demo/house-rules"
          className="card-soft flex flex-col items-start gap-1 p-3 active:scale-[0.98]"
        >
          <span className="text-lg">📜</span>
          <span className="text-xs font-bold text-foreground">入住須知</span>
          <span className="text-[10px] text-muted-foreground">請閱讀同意</span>
        </Link>
        <Link
          to="/checkin/demo/guide"
          className="relative overflow-hidden rounded-3xl border border-[oklch(0.55_0.06_55)] p-3 text-white active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(155deg, oklch(0.42 0.06 55) 0%, oklch(0.28 0.05 55) 100%)",
          }}
        >
          <span className="text-lg">🔑</span>
          <div className="text-xs font-black">入住指引</div>
          <div className="text-[10px] opacity-70">審核後開放</div>
        </Link>
      </section>

      {/* Safety notice */}
      <section className="-mx-4 px-4 pt-4">
        <div className="flex items-start gap-2 rounded-2xl border border-[oklch(0.88_0.05_230)] bg-[oklch(0.97_0.03_230)] p-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.14_240)]" />
          <div>
            <p className="text-xs font-bold text-[oklch(0.42_0.14_240)]">安全保障</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[oklch(0.42_0.12_240)]/80">
              所有旅客資料與證件均採加密方式儲存，符合個人資料保護法。門鎖密碼於審核通過後才會開放。
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="-mx-4 px-4 pb-2 pt-4">
        <h3 className="text-sm font-black text-foreground">聯絡我們</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href="tel:+886900000000"
            className="flex items-center justify-center gap-2 rounded-2xl border border-primary/60 bg-primary-soft/40 py-3 text-sm font-bold text-[oklch(0.45_0.13_70)] active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" />
            電話聯絡
          </a>
          <a
            href="#"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[oklch(0.85_0.12_145)] bg-[oklch(0.96_0.06_145)] py-3 text-sm font-bold text-[oklch(0.38_0.12_150)] active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            LINE 聯絡
          </a>
        </div>
      </section>

      {/* Reminder */}
      <div className="-mx-4 mt-4 px-4">
        <div className="rounded-2xl border border-[oklch(0.88_0.06_85)] bg-warning-soft p-4">
          <p className="text-xs font-semibold text-[oklch(0.45_0.13_55)]">溫馨提醒</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80">
            入住指引與門鎖密碼將於民宿審核通過後開放，請留意 LINE 或 Email 訊息。
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}
