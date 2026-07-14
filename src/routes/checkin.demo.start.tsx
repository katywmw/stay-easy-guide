import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenCheck,
  Users,
  IdCard,
  Wallet,
  HelpCircle,
  Send,
} from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";

export const Route = createFileRoute("/checkin/demo/start")({
  component: StartPage,
  head: () => ({ meta: [{ title: "開始線上入住 · 胡桃民宿" }] }),
});

const steps = [
  { icon: BookOpenCheck, title: "確認訂房資料", desc: "訂房平台、姓名、日期" },
  { icon: Users, title: "填寫入住人資訊", desc: "入住人數、抵達時間、備註" },
  { icon: IdCard, title: "上傳證件資料", desc: "供民宿核對入住身分" },
  { icon: Wallet, title: "確認押金資訊", desc: "付款方式與說明" },
  { icon: HelpCircle, title: "閱讀常見問題與入住須知", desc: "並勾選同意" },
  { icon: Send, title: "送出給民宿審核", desc: "民宿確認後開放入住指引" },
];

function StartPage() {
  return (
    <PhoneShell title="開始線上入住" backTo="/checkin/demo/home">
      <div className="mb-5">
        <h2 className="text-xl font-black text-foreground">線上入住流程</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          總共 6 個步驟，約需 5 分鐘完成。您可隨時暫停，資料會保留在此裝置。
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="card-soft flex items-start gap-3 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft">
              <span className="text-sm font-black text-foreground">{i + 1}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4 shrink-0 text-[oklch(0.55_0.13_75)]" strokeWidth={2.2} />
                <p className="truncate text-sm font-bold text-foreground">{s.title}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-2xl border border-[oklch(0.88_0.06_85)] bg-warning-soft p-4">
        <p className="text-xs leading-relaxed text-foreground/80">
          完成資料後，民宿會進行確認。<span className="font-bold">入住指引與門鎖密碼將於審核通過後開放。</span>
        </p>
      </div>

      <Link
        to="/checkin/demo/booking"
        className="mt-6 block w-full rounded-2xl bg-primary px-6 py-4 text-center text-base font-bold text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.75_0.14_85_/_0.6)] transition active:scale-[0.98]"
      >
        開始填寫
      </Link>
    </PhoneShell>
  );
}
