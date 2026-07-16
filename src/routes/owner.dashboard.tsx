import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ChevronRight,
  ClipboardList,
  Sunrise,
  Sunset,
} from "lucide-react";
import { OwnerShell, OwnerCard, StatMini } from "@/components/owner/OwnerShell";
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
  const recent = demoSubmissions.slice(0, 5);
  const todayIns = demoSubmissions.slice(0, 3);

  return (
    <OwnerShell title="儀表板" subtitle="Overview">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatMini label="今日入住" value={ownerStats.today} icon={CalendarDays} tone="primary" />
        <StatMini label="等待審核" value={ownerStats.awaitingReview} icon={Clock} tone="warning" />
        <StatMini label="需補件" value={ownerStats.needMoreInfo} icon={AlertCircle} tone="destructive" />
        <StatMini label="已核准" value={ownerStats.approved} icon={CheckCircle2} tone="success" />
        <StatMini label="押金待確認" value={ownerStats.depositPending} icon={Wallet} tone="warning" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <OwnerCard
          title="近期入住申請"
          desc="最新送出的線上入住表單"
          actions={
            <Link
              to="/owner/submissions"
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              查看全部
            </Link>
          }
        >
          <ul className="divide-y divide-[oklch(0.94_0.02_82)]">
            {recent.map((r) => {
              const st = checkinStatusPill(r.status);
              const dp = depositPill(r.deposit);
              return (
                <li key={r.id}>
                  <Link
                    to="/owner/submissions/$id"
                    params={{ id: r.id }}
                    className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-secondary/60"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-sm font-black text-foreground">
                      {r.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-foreground">
                          {r.name}
                        </p>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {platformLabels[r.platform]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                        {r.checkIn} → {r.checkOut} · {r.guests} 人 · #{r.id}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusPill label={st.label} tone={st.tone} />
                        <StatusPill label={`押金 · ${dp.label}`} tone={dp.tone} />
                      </div>
                    </div>
                    <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </OwnerCard>

        <OwnerCard title="今日行程" desc="Check-in / Check-out">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Sunrise className="h-3.5 w-3.5 text-[oklch(0.65_0.14_65)]" />
                今日入住 · {todayIns.length} 組
              </div>
              <ul className="mt-2 space-y-2">
                {todayIns.slice(0, 3).map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs"
                  >
                    <span className="text-[11px] font-black text-foreground [font-variant-numeric:tabular-nums]">
                      {r.arrivalTime}
                    </span>
                    <span className="truncate font-semibold text-foreground">{r.name}</span>
                    <span className="ml-auto text-muted-foreground">{r.guests} 人</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Sunset className="h-3.5 w-3.5 text-[oklch(0.55_0.13_60)]" />
                今日退房 · 2 組
              </div>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs">
                  <span className="text-[11px] font-black text-foreground [font-variant-numeric:tabular-nums]">11:00</span>
                  <span className="truncate font-semibold text-foreground">張慧君</span>
                  <span className="ml-auto text-muted-foreground">2 人</span>
                </li>
              </ul>
            </div>
          </div>
        </OwnerCard>
      </div>

      <div className="mt-6">
        <OwnerCard
          title="快速操作"
          desc="常用的管理入口"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickLink to="/owner/submissions" icon={ClipboardList} label="入住申請列表" />
            <QuickLink to="/owner/settings/rooms" icon={CalendarDays} label="房間設定" />
            <QuickLink to="/owner/settings/payments" icon={Wallet} label="付款方式" />
          </div>
        </OwnerCard>
      </div>
    </OwnerShell>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof ClipboardList;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg border border-[oklch(0.92_0.02_80)] bg-secondary/40 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary hover:shadow-sm"
    >
      <Icon className="h-4 w-4 text-[oklch(0.55_0.08_60)]" />
      {label}
      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
