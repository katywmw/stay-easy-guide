import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Store } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-10">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            線上自助入住系統 · Prototype
          </div>
          <h1 className="text-3xl font-black leading-tight text-foreground">
            歡迎入住
            <br />
            <span className="text-[oklch(0.55_0.13_75)]">胡桃民宿</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            這是一個為台灣民宿設計的行動優先線上 Check-in 原型。
            請選擇要體驗的角色進入 Demo。
          </p>
        </div>

        <div className="my-8 space-y-3">
          <Link
            to="/checkin/demo/home"
            className="card-soft flex items-center gap-4 p-5 transition active:scale-[0.99]"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-foreground">
                我是旅客
              </div>
              <div className="text-xs text-muted-foreground">
                進入線上 Check-in 流程
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>

          <Link
            to="/owner/login"
            className="card-soft flex items-center gap-4 p-5 transition active:scale-[0.99]"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary text-foreground">
              <Store className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-foreground">
                我是業者
              </div>
              <div className="text-xs text-muted-foreground">
                查看與審核入住申請
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          本頁為原型展示，不包含真實金流、證件儲存或訂房平台串接。
          <br />
          資料僅暫存於此裝置。
        </p>
      </div>
    </div>
  );
}
