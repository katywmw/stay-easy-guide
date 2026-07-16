import { Link } from "@tanstack/react-router";
import { Star, MapPin, ShieldCheck, Wifi, Car, Coffee, Wind, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-minsu.jpg";
import { usePropertyConfig } from "@/lib/property-config";
import { channelIcon, channelHref } from "@/routes/owner.settings.contact";

const AMENITIES = [
  { icon: Wifi, label: "無線網路" },
  { icon: Car, label: "免費停車" },
  { icon: Coffee, label: "手沖咖啡" },
  { icon: Wind, label: "冷暖空調" },
];

export function GuestHome() {
  const { contactChannels } = usePropertyConfig();
  const active = contactChannels.filter((c) => c.enabled && c.value.trim());

  return (
    <div className="min-h-screen w-full bg-[oklch(0.985_0.04_95)] flex items-start justify-center py-6 px-3 sm:py-10">
      <div className="w-full max-w-md flex flex-col overflow-hidden rounded-[2.5rem] border border-[oklch(0.94_0.13_95)] bg-white shadow-[0_20px_60px_-20px_oklch(0.24_0.04_55_/_0.15)]">
        {/* Hero */}
        <div className="relative h-72 w-full">
          <img
            src={heroImg}
            alt="胡桃民宿入口"
            width={1200}
            height={900}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.24_0.04_55)]/75 via-[oklch(0.24_0.04_55)]/10 to-transparent" />
          <div className="absolute bottom-7 left-7 right-7 text-white">
            <div className="mb-1 flex items-center gap-1.5">
              <div className="flex text-[oklch(0.87_0.19_92)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span
                className="text-xs font-bold"
                style={{ fontFamily: "Quicksand, sans-serif" }}
              >
                4.9
              </span>
              <span className="text-[10px] text-white/70">・128 則評價</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight drop-shadow-sm">
              胡桃民宿 · 日和居
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/85">
              <MapPin className="h-3.5 w-3.5" />
              南投 · 魚池鄉 · 老宅改建溫馨之旅
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col px-6 pt-8 pb-6">
          {/* CTA */}
          <div className="mb-8 flex flex-col items-center rounded-[2rem] border-2 border-dashed border-[oklch(0.87_0.19_92)] bg-[oklch(0.94_0.13_95)]/40 p-6">
            <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[oklch(0.55_0.13_72)]">
              Welcome Home
            </span>
            <p className="mb-4 text-center text-sm text-foreground/70">
              歡迎回家，請點擊以下按鈕辦理入住
            </p>
            <Link
              to="/checkin/demo/start"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.87_0.19_92)] px-6 py-5 text-xl font-black text-[oklch(0.24_0.04_55)] shadow-[0_10px_30px_-8px_oklch(0.87_0.19_92_/_0.7)] transition active:scale-[0.98]"
            >
              開始線上入住
              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.6}
              />
            </Link>
            <p className="mt-3 text-[10px] font-medium tracking-widest text-foreground/40">
              預計 3 分鐘完成
            </p>
          </div>

          {/* Times */}
          <div className="mb-6 flex items-center rounded-2xl bg-[oklch(0.985_0.04_95)] p-5">
            <div className="flex-1 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                入住時間
              </p>
              <p
                className="text-2xl font-black text-foreground"
                style={{ fontFamily: "Quicksand, sans-serif" }}
              >
                15:00
              </p>
            </div>
            <div className="h-10 w-px bg-foreground/10" />
            <div className="flex-1 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                退房時間
              </p>
              <p
                className="text-2xl font-black text-foreground"
                style={{ fontFamily: "Quicksand, sans-serif" }}
              >
                11:00
              </p>
            </div>
          </div>

          {/* Safety */}
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-[oklch(0.82_0.10_145)]/40 bg-[oklch(0.82_0.10_145)]/15 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.55_0.11_145)]" strokeWidth={2.4} />
            <div>
              <p className="text-xs font-bold text-[oklch(0.35_0.08_145)]">
                安心入住提醒
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-foreground/75">
                本民宿採用智能門鎖，入住手續完成並經業者審核後，門鎖密碼將透過 LINE 或簡訊發送。
              </p>
            </div>
          </div>

          {/* Contact — dynamic channels */}
          {active.length > 0 && (
            <div className="mb-10">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                聯絡屋主
              </p>
              <div className="grid grid-cols-2 gap-3">
                {active.map((c) => {
                  const Icon = channelIcon(c.type);
                  return (
                    <a
                      key={c.id}
                      href={channelHref(c)}
                      target={c.type === "email" || c.type === "phone" || c.type === "sms" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-white py-3 text-xs font-bold text-foreground shadow-sm transition active:scale-[0.98]"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.4} />
                      <span className="truncate">{c.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amenities at bottom */}
          <div className="border-t border-foreground/5 pt-8">
            <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/40">
              房內設備 · Amenities
            </p>
            <div className="grid grid-cols-4 gap-3">
              {AMENITIES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[oklch(0.985_0.04_95)]">
                    <Icon className="h-4 w-4 text-[oklch(0.55_0.15_72)]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-bold text-foreground/60">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer reminder */}
        <div className="bg-[oklch(0.24_0.04_55)] px-6 py-4 text-center">
          <p className="text-[11px] font-medium leading-tight text-[oklch(0.94_0.13_95)]/90">
            溫馨提示：室內全面禁菸，感謝您的配合與愛護
          </p>
        </div>
      </div>
    </div>
  );
}
