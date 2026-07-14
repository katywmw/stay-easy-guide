import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wallet,
  LogOut,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { useEffect } from "react";
import { useOwnerAuth } from "@/lib/owner-auth";
import { demoSubmissions, ownerStats } from "@/lib/owner-demo";
import { platformLabels } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/owner/dashboard")({
  component: OwnerDashboard,
  head: () => ({ meta: [{ title: "業者 Dashboard · 胡桃民宿" }] }),
});

function OwnerDashboard() {
  const nav = useNavigate();
  const { loggedIn, logout } = useOwnerAuth();

  useEffect(() => {
    if (!loggedIn) nav({ to: "/owner/login" });
  }, [loggedIn, nav]);

  const recent = demoSubmissions.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">胡桃民宿 · 業者後台</p>
            <h1 className="truncate text-2xl font-black text-foreground sm:text-3xl">
              歡迎回來
            </h1>
          </div>
          <button
            onClick={() => {
              logout();
              nav({ to: "/owner/login" });
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <LogOut className="h-3.5 w-3.5" />
            登出
          </button>
        </header>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="今日入住"
            value={ownerStats.today}
            icon={CalendarDays}
            tone="primary"
          />
          <StatCard
            label="等待審核"
            value={ownerStats.awaitingReview}
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label="需補件"
            value={ownerStats.needMoreInfo}
            icon={AlertCircle}
            tone="destructive"
          />
          <StatCard
            label="已核准"
            value={ownerStats.approved}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="押金待確認"
            value={ownerStats.depositPending}
            icon={Wallet}
            tone="warning"
          />
        </div>

        {/* Recent */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
            <ClipboardList className="h-5 w-5" />
            近期入住申請
          </h2>
          <Link
            to="/owner/submissions"
            className="text-sm font-semibold text-[oklch(0.55_0.13_75)]"
          >
            查看全部 →
          </Link>
        </div>

        <ul className="mt-4 space-y-3">
          {recent.map((r) => {
            const st = checkinStatusPill(r.status);
            const dp = depositPill(r.deposit);
            return (
              <li key={r.id}>
                <Link
                  to="/owner/submissions/$id"
                  params={{ id: r.id }}
                  className="card-soft flex flex-col gap-3 p-4 transition hover:border-primary/40 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-bold text-foreground">
                        {r.name}
                      </p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {platformLabels[r.platform]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      入住 {r.checkIn} · {r.guests} 人
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill label={st.label} tone={st.tone} />
                      <StatusPill label={`押金 · ${dp.label}`} tone={dp.tone} />
                    </div>
                  </div>
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
  tone: "primary" | "warning" | "success" | "destructive";
}) {
  const toneClasses = {
    primary: "bg-primary-soft text-foreground",
    warning: "bg-warning-soft text-[oklch(0.45_0.13_55)]",
    success: "bg-success-soft text-success",
    destructive: "bg-destructive-soft text-destructive",
  }[tone];
  return (
    <div className="card-soft p-4">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${toneClasses}`}>
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
