import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Filter, Search, X, Building2 } from "lucide-react";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { demoSubmissions } from "@/lib/owner-demo";
import { platformLabels, type BookingPlatform, type CheckinStatus } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";
import { usePropertyConfig } from "@/lib/property-config";
import { propertyColors } from "@/lib/property-colors";

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
  const { properties, currentPropertyId } = usePropertyConfig();
  const [scope, setScope] = useState<string>(currentPropertyId); // property id or "all"
  const [status, setStatus] = useState<CheckinStatus | "all">("all");
  const [platform, setPlatform] = useState<BookingPlatform | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [keyword, setKeyword] = useState("");

  const list = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return demoSubmissions.filter((r) => {
      if (scope !== "all" && r.propertyId !== scope) return false;
      if (status !== "all" && r.status !== status) return false;
      if (platform !== "all" && r.platform !== platform) return false;
      if (dateFrom && r.checkIn < dateFrom) return false;
      if (dateTo && r.checkIn > dateTo) return false;
      if (kw) {
        const hay = `${r.name} ${r.phone} ${r.email} ${r.id}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [scope, status, platform, dateFrom, dateTo, keyword]);

  const anyFilter = status !== "all" || platform !== "all" || dateFrom || dateTo || keyword;


  return (
    <OwnerShell title="入住申請" subtitle="Submissions">
      <OwnerCard
        title="搜尋與篩選"
        actions={
          anyFilter && (
            <button
              onClick={() => {
                setStatus("all");
                setPlatform("all");
                setDateFrom("");
                setDateTo("");
                setKeyword("");
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5" />
              清除全部
            </button>
          )
        }
      >
        <div className="grid gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜尋姓名 / 電話 / Email / 訂單編號"
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Filter className="h-3 w-3" />狀態
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setStatus(o.v)}
                    className={
                      status === o.v
                        ? "rounded-full border-2 border-primary bg-primary-soft px-3 py-1 text-xs font-semibold text-foreground"
                        : "rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-secondary"
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                訂房平台
              </p>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as BookingPlatform | "all")}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
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
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                入住日期範圍
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-2 py-2 text-xs outline-none focus:border-primary"
                />
                <span className="text-muted-foreground">→</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-2 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </OwnerCard>

      <p className="mt-4 text-xs text-muted-foreground">
        共 <span className="font-bold text-foreground [font-variant-numeric:tabular-nums]">{list.length}</span> 筆申請
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
                className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-[oklch(0.92_0.02_80)] bg-card p-4 shadow-[0_1px_0_rgba(139,115,85,0.04),0_8px_24px_-16px_rgba(139,115,85,0.18)] transition hover:border-primary/40"
              >
                <span className={`absolute left-0 top-0 h-full w-1 ${toneBar(st.tone)}`} />
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-sm font-black text-foreground">
                  {r.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-bold text-foreground">
                      {r.name}
                    </p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {platformLabels[r.platform]}
                    </span>
                    <span className="text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                      #{r.id}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground [font-variant-numeric:tabular-nums]">
                    {r.checkIn} → {r.checkOut} · {r.guests} 人 · {r.phone}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
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
          <li className="rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
            目前沒有符合條件的申請。
          </li>
        )}
      </ul>
    </OwnerShell>
  );
}

function toneBar(tone: string) {
  switch (tone) {
    case "warning":
      return "bg-warning";
    case "success":
      return "bg-success";
    case "destructive":
      return "bg-destructive";
    case "primary":
      return "bg-primary";
    default:
      return "bg-[oklch(0.55_0.08_60)]";
  }
}
