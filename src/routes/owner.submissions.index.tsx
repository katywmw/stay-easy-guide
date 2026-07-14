import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Filter } from "lucide-react";
import { useOwnerAuth } from "@/lib/owner-auth";
import { demoSubmissions } from "@/lib/owner-demo";
import { platformLabels, type BookingPlatform, type CheckinStatus } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/owner/submissions/")({
  component: SubmissionsList,
  head: () => ({ meta: [{ title: "入住申請列表 · 胡桃民宿" }] }),
});

const statusOptions: { v: CheckinStatus | "all"; label: string }[] = [
  { v: "all", label: "全部" },
  { v: "submitted", label: "等待審核" },
  { v: "need_more_info", label: "需補件" },
  { v: "approved", label: "已核准" },
  { v: "completed", label: "已完成" },
];

function SubmissionsList() {
  const nav = useNavigate();
  const loggedIn = useOwnerAuth((s) => s.loggedIn);
  useEffect(() => {
    if (!loggedIn) nav({ to: "/owner/login" });
  }, [loggedIn, nav]);

  const [status, setStatus] = useState<CheckinStatus | "all">("all");
  const [platform, setPlatform] = useState<BookingPlatform | "all">("all");
  const [date, setDate] = useState("");

  const list = useMemo(() => {
    return demoSubmissions.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (platform !== "all" && r.platform !== platform) return false;
      if (date && r.checkIn !== date) return false;
      return true;
    });
  }, [status, platform, date]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <header className="mb-5 flex items-center gap-3">
          <Link
            to="/owner/dashboard"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">胡桃民宿</p>
            <h1 className="truncate text-xl font-black text-foreground">入住申請列表</h1>
          </div>
        </header>

        {/* Filters */}
        <div className="card-soft p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            篩選器
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-semibold text-foreground">狀態</p>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setStatus(o.v)}
                    className={
                      status === o.v
                        ? "rounded-full border-2 border-primary bg-primary-soft px-3 py-1 text-xs font-semibold text-foreground"
                        : "rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-foreground">訂房平台</p>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as BookingPlatform | "all")}
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="all">全部平台</option>
                {(Object.keys(platformLabels) as BookingPlatform[]).map((k) => (
                  <option key={k} value={k}>
                    {platformLabels[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-foreground">入住日期</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          共 {list.length} 筆申請
        </p>

        <ul className="mt-3 space-y-3">
          {list.map((r) => {
            const st = checkinStatusPill(r.status);
            const dp = depositPill(r.deposit);
            return (
              <li key={r.id}>
                <Link
                  to="/owner/submissions/$id"
                  params={{ id: r.id }}
                  className="card-soft flex items-center gap-3 p-4 transition hover:border-primary/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-bold text-foreground">
                        {r.name}
                      </p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {platformLabels[r.platform]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      入住 {r.checkIn} → 退房 {r.checkOut} · {r.guests} 人
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusPill label={st.label} tone={st.tone} />
                      <StatusPill label={`押金 · ${dp.label}`} tone={dp.tone} />
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="card-soft p-8 text-center text-sm text-muted-foreground">
              目前沒有符合條件的申請。
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
