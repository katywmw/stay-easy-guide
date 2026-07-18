import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Sunrise,
  Sunset,
  KeyRound,
  Building2,
  Calendar as CalendarIcon,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  OwnerShell,
  OwnerCard,
  StatMini,
  StatPill,
} from "@/components/owner/OwnerShell";
import { demoSubmissions } from "@/lib/owner-demo";
import { platformLabels } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";
import { usePropertyConfig } from "@/lib/property-config";
import { propertyColors } from "@/lib/property-colors";

export const Route = createFileRoute("/owner/dashboard")({
  component: OwnerDashboard,
  head: () => ({ meta: [{ title: "業者 Dashboard · 胡桃民宿" }] }),
});

type ViewScope = "current" | "all";

function OwnerDashboard() {
  const { properties, currentPropertyId } = usePropertyConfig();
  const [scope, setScope] = useState<ViewScope>("current");

  const filtered = useMemo(() => {
    if (scope === "all") return demoSubmissions;
    return demoSubmissions.filter((s) => s.propertyId === currentPropertyId);
  }, [scope, currentPropertyId]);

  const stats = useMemo(() => {
    const today = filtered.filter((s) => s.status === "approved" || s.status === "completed").length;
    const awaitingReview = filtered.filter((s) => s.status === "submitted").length;
    const needMoreInfo = filtered.filter((s) => s.status === "need_more_info").length;
    const approved = filtered.filter((s) => s.status === "approved").length;
    const depositPending = filtered.filter((s) => s.deposit === "pending" || s.deposit === "unpaid").length;
    return { today, awaitingReview, needMoreInfo, approved, depositPending };
  }, [filtered]);

  const recent = filtered.slice(0, 5);
  const todayIns = filtered.slice(0, 3);
  const currentProp = properties.find((p) => p.id === currentPropertyId);

  return (
    <OwnerShell
      title="儀表板"
      subtitle="Overview"
      headerExtra={
        <button
          onClick={() => setScope(scope === "all" ? "current" : "all")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
            scope === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border bg-card text-muted-foreground hover:bg-secondary"
          }`}
          title="顯示全部館別"
        >
          <Building2 className="h-3 w-3" />
          {scope === "all" ? "檢視全部館別" : "檢視全部"}
        </button>
      }
    >



      <CalendarPanel submissions={filtered} properties={properties} />

      {/* Stats — mobile: compact horizontal snap row */}
      <div className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:hidden -mx-4 px-4">
        <StatPill label="今日入住" value={stats.today} icon={CalendarDays} tone="primary" />
        <StatPill label="等待審核" value={stats.awaitingReview} icon={Clock} tone="warning" />
        <StatPill label="需補件" value={stats.needMoreInfo} icon={AlertCircle} tone="destructive" />
        <StatPill label="已核准" value={stats.approved} icon={CheckCircle2} tone="success" />
        <StatPill label="押金待確認" value={stats.depositPending} icon={Wallet} tone="warning" />
      </div>
      <div className="mt-3 hidden grid-cols-3 gap-3 sm:grid xl:grid-cols-5">
        <StatMini label="今日入住" value={stats.today} icon={CalendarDays} tone="primary" />
        <StatMini label="等待審核" value={stats.awaitingReview} icon={Clock} tone="warning" />
        <StatMini label="需補件" value={stats.needMoreInfo} icon={AlertCircle} tone="destructive" />
        <StatMini label="已核准" value={stats.approved} icon={CheckCircle2} tone="success" />
        <StatMini label="押金待確認" value={stats.depositPending} icon={Wallet} tone="warning" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <OwnerCard
          title={scope === "all" ? "近期入住申請（全部館別）" : `近期入住申請 · ${currentProp?.name ?? ""}`}
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
              const propName = properties.find((p) => p.id === r.propertyId)?.name ?? "";
              const c = propertyColors(r.propertyId);
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
                      <p className="break-words text-sm font-bold text-foreground">
                        {r.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${c.chipBg} ${c.chipFg}`}
                          title={propName}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                          {propName}
                        </span>
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
            {recent.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                此範圍暫無申請
              </li>
            )}
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
                {todayIns.slice(0, 3).map((r) => {
                  const c = propertyColors(r.propertyId);
                  return (
                    <li
                      key={r.id}
                      className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs"
                    >
                      <span className="text-[11px] font-black text-foreground [font-variant-numeric:tabular-nums]">
                        {r.arrivalTime}
                      </span>
                      <span className="truncate font-semibold text-foreground">{r.name}</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${c.chipBg} ${c.chipFg}`}>
                        {c.short}
                      </span>
                      <span className="ml-auto text-muted-foreground">{r.guests} 人</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </OwnerCard>
      </div>

      <div className="mt-4">
        <OwnerCard title="快速操作" desc="常用的管理入口">
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickLink to="/owner/settings/passwords" icon={KeyRound} label="密碼設定（每日常用）" />
            <QuickLink to="/owner/submissions" icon={ClipboardList} label="入住申請列表" />
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

// ---------------- Calendar Panel ----------------
const pad2 = (n: number) => String(n).padStart(2, "0");
const dayKey = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const parseKey = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

function CalendarPanel({
  submissions,
  properties,
}: {
  submissions: typeof demoSubmissions;
  properties: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = first.getDay();

  type DayEntry = {
    id: string;
    name: string;
    propertyId: string;
    checkIn: string;
    checkOut: string;
    status: string;
  };

  const byDay = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    for (const s of submissions) {
      const inD = parseKey(s.checkIn);
      const outD = parseKey(s.checkOut);
      const d = new Date(inD);
      while (d < outD) {
        const key = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({
          id: s.id,
          name: s.name,
          propertyId: s.propertyId,
          checkIn: s.checkIn,
          checkOut: s.checkOut,
          status: s.status,
        });
        d.setDate(d.getDate() + 1);
      }
    }
    return map;
  }, [submissions]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());
  const monthLabel = `${year} 年 ${month + 1} 月`;

  const selectedList = selectedDay ? (byDay.get(selectedDay) ?? []) : [];

  const statusLabel = (s: string) =>
    ({
      submitted: "待審核",
      need_more_info: "需補件",
      approved: "已核准",
      completed: "已完成",
      rejected: "已拒絕",
    })[s] ?? s;

  return (
    <OwnerCard
      title="入住行事曆"
      desc="點選日期可查看當日入住旅客"
      actions={
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          {open ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {open ? "收合" : "展開"}
        </button>
      }
    >
      {!open ? (
        <p className="text-xs text-muted-foreground">
          <CalendarIcon className="mr-1 inline h-3.5 w-3.5" />
          點「展開」以檢視 {monthLabel} 入住分布。
        </p>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => {
                setCursor(new Date(year, month - 1, 1));
                setSelectedDay(null);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card hover:bg-secondary"
              aria-label="上一月"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold text-foreground [font-variant-numeric:tabular-nums]">
              {monthLabel}
            </p>
            <button
              onClick={() => {
                setCursor(new Date(year, month + 1, 1));
                setSelectedDay(null);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card hover:bg-secondary"
              aria-label="下一月"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-muted-foreground sm:gap-1">
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} className="aspect-square" />;
              const key = dayKey(year, month, d);
              const list = byDay.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;
              const hasGuests = list.length > 0;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  disabled={!hasGuests}
                  className={`relative flex aspect-square flex-col items-center justify-start rounded-md border p-0.5 text-[10px] transition sm:rounded-lg sm:p-1 ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow"
                      : isToday
                        ? "border-primary bg-primary-soft/40"
                        : hasGuests
                          ? "border-[oklch(0.94_0.02_82)] bg-card hover:bg-secondary"
                          : "border-transparent bg-transparent text-muted-foreground/60"
                  }`}
                >
                  <span className="text-[11px] font-bold [font-variant-numeric:tabular-nums] sm:text-xs">
                    {d}
                  </span>
                  {hasGuests && (
                    <>
                      <div className="mt-auto flex flex-wrap items-center justify-center gap-0.5">
                        {list.slice(0, 3).map((g, idx) => {
                          const c = propertyColors(g.propertyId);
                          return (
                            <span
                              key={idx}
                              className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : c.dot}`}
                            />
                          );
                        })}
                      </div>
                      <span
                        className={`absolute right-0.5 top-0.5 rounded-full px-1 text-[9px] font-bold leading-tight [font-variant-numeric:tabular-nums] ${
                          isSelected
                            ? "bg-primary-foreground text-primary"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {list.length}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="font-semibold">圖例：</span>
            {properties.map((p) => {
              const c = propertyColors(p.id);
              return (
                <span key={p.id} className="inline-flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                  {p.name}
                </span>
              );
            })}
          </div>

          {selectedDay && (
            <div className="mt-3 rounded-xl border border-[oklch(0.94_0.02_82)] bg-secondary/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">
                  {selectedDay.replaceAll("-", "/")} · {selectedList.length} 組入住
                </p>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-secondary"
                >
                  關閉
                </button>
              </div>
              {selectedList.length === 0 ? (
                <p className="text-xs text-muted-foreground">當日無入住紀錄。</p>
              ) : (
                <ul className="space-y-1.5">
                  {selectedList.map((g) => {
                    const c = propertyColors(g.propertyId);
                    const propName =
                      properties.find((p) => p.id === g.propertyId)?.name ?? "";
                    return (
                      <li key={g.id}>
                        <Link
                          to="/owner/submissions/$id"
                          params={{ id: g.id }}
                          className="flex items-center gap-2 rounded-lg border border-[oklch(0.94_0.02_82)] bg-card p-2 hover:bg-secondary"
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">
                              {g.name}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {propName} · {g.checkIn.slice(5)} → {g.checkOut.slice(5)} · {statusLabel(g.status)}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </OwnerCard>
  );
}
