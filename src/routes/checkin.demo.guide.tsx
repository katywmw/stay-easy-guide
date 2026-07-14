import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, MapPin, Route as RouteIcon, DoorOpen, Wifi, Info, KeyRound } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { useCheckinStore } from "@/lib/checkin-store";
import { checkinStatusPill, StatusPill } from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/checkin/demo/guide")({
  component: GuidePage,
  head: () => ({ meta: [{ title: "入住指引 · 胡桃民宿" }] }),
});

const items = [
  { icon: MapPin, title: "民宿地址", hint: "審核通過後開放" },
  { icon: RouteIcon, title: "入住路線", hint: "含 Google Maps 連結" },
  { icon: DoorOpen, title: "房型 / 房號", hint: "審核通過後開放" },
  { icon: KeyRound, title: "門鎖密碼", hint: "審核通過後開放" },
  { icon: Wifi, title: "Wi-Fi 資訊", hint: "SSID 與密碼" },
  { icon: Info, title: "注意事項", hint: "垃圾、退房、緊急聯絡" },
];

function GuidePage() {
  const status = useCheckinStore((s) => s.status);
  const locked = status !== "approved" && status !== "completed";
  const pill = checkinStatusPill(status);

  return (
    <PhoneShell title="入住指引" backTo="/checkin/demo/home">
      {locked ? (
        <>
          <div
            className="mt-2 overflow-hidden rounded-3xl p-6 text-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.94 0.03 85) 0%, oklch(0.90 0.05 80) 100%)",
            }}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-card shadow-[var(--shadow-card)]">
              <Lock className="h-7 w-7 text-[oklch(0.55_0.10_60)]" strokeWidth={2.2} />
            </div>
            <h2 className="mt-3 text-lg font-black text-foreground">尚未開放</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/70">
              入住指引將於民宿審核通過後開放。
            </p>
            <div className="mt-3 flex justify-center">
              <StatusPill label={pill.label} tone={pill.tone} />
            </div>
          </div>

          <ul className="mt-4 space-y-2.5">
            {items.map((it) => (
              <li
                key={it.title}
                className="card-soft flex items-center gap-3 p-4 opacity-70"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
                  <it.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{it.title}</p>
                  <p className="text-xs text-muted-foreground">{it.hint}</p>
                </div>
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ul>

          {status === "draft" && (
            <Link
              to="/checkin/demo/start"
              className="mt-6 block w-full rounded-2xl bg-primary px-6 py-4 text-center text-base font-bold text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.75_0.14_85_/_0.6)]"
            >
              前往線上入住
            </Link>
          )}
        </>
      ) : (
        <>
          <div className="rounded-3xl bg-success-soft p-5">
            <StatusPill label="已核准" tone="success" />
            <h2 className="mt-2 text-lg font-black text-foreground">
              歡迎入住胡桃民宿
            </h2>
            <p className="mt-1 text-xs text-foreground/70">
              以下為您本次入住的完整指引資訊。
            </p>
          </div>

          <ul className="mt-4 space-y-2.5">
            <GuideRow icon={MapPin} title="民宿地址" value="台灣宜蘭縣礁溪鄉溫泉路 88 號（Demo）" />
            <GuideRow icon={RouteIcon} title="入住路線" value="礁溪火車站步行 10 分鐘，或搭計程車約 3 分鐘" />
            <GuideRow icon={DoorOpen} title="房型 / 房號" value="山景雙人房 · 202 室" />
            <GuideRow
              icon={KeyRound}
              title="門鎖密碼"
              value="Prototype 不顯示真實密碼"
              muted
            />
            <GuideRow icon={Wifi} title="Wi-Fi" value="Walnut-Guest / 密碼於現場提供" />
            <GuideRow icon={Info} title="注意事項" value="退房請放置鑰匙於桌上並關閉冷氣" />
          </ul>
        </>
      )}
    </PhoneShell>
  );
}

function GuideRow({
  icon: Icon,
  title,
  value,
  muted = false,
}: {
  icon: typeof MapPin;
  title: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <li className="card-soft flex items-start gap-3 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p
          className={
            muted
              ? "mt-0.5 text-sm font-semibold text-muted-foreground"
              : "mt-0.5 text-sm font-bold text-foreground"
          }
        >
          {value}
        </p>
      </div>
    </li>
  );
}
