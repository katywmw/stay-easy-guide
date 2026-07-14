import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Store, KeyRound, ShieldCheck } from "lucide-react";
import { useOwnerAuth } from "@/lib/owner-auth";

export const Route = createFileRoute("/owner/login")({
  component: OwnerLogin,
  head: () => ({ meta: [{ title: "業者登入 · 胡桃民宿" }] }),
});

function OwnerLogin() {
  const nav = useNavigate();
  const login = useOwnerAuth((s) => s.login);

  const handleDemo = () => {
    login();
    nav({ to: "/owner/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-10">
        <div className="pt-8">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.75_0.14_85_/_0.7)]">
            <Store className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <h1 className="mt-6 text-3xl font-black text-foreground">
            業者登入
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理旅客的線上入住申請、審核資料與押金狀態。
          </p>
        </div>

        <div className="my-8 space-y-4">
          <div className="card-soft p-4">
            <label className="text-xs font-semibold text-muted-foreground">
              民宿帳號
            </label>
            <input
              disabled
              placeholder="demo@walnut-stay.tw"
              className="mt-1 w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm text-muted-foreground"
            />
            <label className="mt-3 block text-xs font-semibold text-muted-foreground">
              密碼
            </label>
            <input
              disabled
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm text-muted-foreground"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Prototype 階段暫不啟用實際登入，請使用下方 Demo 按鈕。
            </p>
          </div>

          <button
            onClick={handleDemo}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.75_0.14_85_/_0.6)] transition active:scale-[0.98]"
          >
            <KeyRound className="h-5 w-5" />
            以 Demo 業者身份進入
          </button>
        </div>

        <div className="rounded-2xl bg-secondary p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.13_75)]" />
            <p className="text-xs leading-relaxed text-foreground/80">
              正式版將採用強度足夠的密碼、二階段驗證，並限制業者僅能存取自己民宿的資料。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
