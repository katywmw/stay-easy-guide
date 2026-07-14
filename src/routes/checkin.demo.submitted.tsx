import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { StatusPill } from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/checkin/demo/submitted")({
  component: SubmittedPage,
  head: () => ({ meta: [{ title: "已送出 · 胡桃民宿" }] }),
});

const nextSteps = [
  "民宿會核對訂房資料",
  "民宿會確認證件資料",
  "民宿會確認押金狀態",
  "審核通過後，入住指引將會開放",
  "請留意 LINE 或 Email 訊息",
];

function SubmittedPage() {
  return (
    <PhoneShell showBack={false} bare>
      <div className="flex min-h-screen flex-col px-4 pb-8 pt-[max(env(safe-area-inset-top),1.5rem)]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Success icon */}
          <div
            className="relative grid h-28 w-28 place-items-center rounded-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.94 0.06 145) 0%, oklch(0.82 0.14 88) 100%)",
            }}
          >
            <div className="absolute inset-2 grid place-items-center rounded-full bg-card">
              <CheckCircle2 className="h-14 w-14 text-success" strokeWidth={2.2} />
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-black text-foreground">
            資料已送出
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            您的入住資料已送出，民宿將盡快確認。
          </p>

          <div className="mt-5 card-soft w-full max-w-sm p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">目前狀態</span>
              <StatusPill label="等待審核" tone="warning" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              民宿通常於 24 小時內完成審核
            </div>
          </div>
        </div>

        <div className="card-soft mt-6 p-5">
          <h2 className="text-sm font-bold text-foreground">接下來的流程</h2>
          <ol className="mt-3 space-y-2.5">
            {nextSteps.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-black text-foreground">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 rounded-2xl bg-warning-soft p-4">
          <div className="flex items-start gap-2">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.13_75)]" />
            <p className="text-xs leading-relaxed text-foreground/80">
              如有緊急事項，可直接透過 LINE 聯繫民宿。門鎖密碼將於審核通過後開放，請耐心等候。
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/checkin/demo/home"
            className="rounded-2xl border border-border bg-card px-4 py-3.5 text-center text-sm font-semibold text-foreground"
          >
            回到首頁
          </Link>
          <Link
            to="/checkin/demo/guide"
            className="rounded-2xl bg-primary px-4 py-3.5 text-center text-sm font-bold text-primary-foreground"
          >
            查看入住指引
          </Link>
        </div>
      </div>
    </PhoneShell>
  );
}
