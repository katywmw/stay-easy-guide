import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  IdCard,
  Receipt,
  ShieldCheck,
  StickyNote,
  AlertTriangle,
} from "lucide-react";
import { useOwnerAuth } from "@/lib/owner-auth";
import { demoSubmissions } from "@/lib/owner-demo";
import { platformLabels } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/submissions/$id")({
  loader: ({ params }) => {
    const s = demoSubmissions.find((x) => x.id === params.id);
    if (!s) throw notFound();
    return { submission: s };
  },
  component: SubmissionDetail,
  notFoundComponent: NotFound,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.submission.name} · 入住申請 · 胡桃民宿`
          : "找不到申請",
      },
    ],
  }),
});

function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-black text-foreground">找不到申請</h1>
      <p className="mt-2 text-sm text-muted-foreground">此申請不存在或已被移除。</p>
      <Link
        to="/owner/submissions"
        className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
      >
        回列表
      </Link>
    </div>
  );
}

function SubmissionDetail() {
  const nav = useNavigate();
  const loggedIn = useOwnerAuth((s) => s.loggedIn);
  useEffect(() => {
    if (!loggedIn) nav({ to: "/owner/login" });
  }, [loggedIn, nav]);

  const { submission } = Route.useLoaderData();

  const [checks, setChecks] = useState({
    booking: false,
    id: false,
    deposit: false,
    rules: false,
  });
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(submission.status);
  const allChecked = Object.values(checks).every(Boolean);

  const st = checkinStatusPill(status);
  const dp = depositPill(submission.deposit);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <header className="mb-4 flex items-center gap-3">
          <Link
            to="/owner/submissions"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">入住申請</p>
            <h1 className="truncate text-xl font-black text-foreground">
              {submission.name}
            </h1>
          </div>
        </header>

        <div className="card-soft flex flex-wrap items-center gap-2 p-4">
          <StatusPill label={st.label} tone={st.tone} />
          <StatusPill label={`押金 · ${dp.label}`} tone={dp.tone} />
          <span className="ml-auto text-xs text-muted-foreground">
            送出：{submission.submittedAt}
          </span>
        </div>

        {/* Booking */}
        <Panel title="訂房資料" icon={<Receipt className="h-4 w-4" />}>
          <Row k="訂房平台" v={platformLabels[submission.platform as keyof typeof platformLabels]} />
          <Row k="訂房姓名" v={submission.name} />
          <Row k="手機" v={submission.phone} />
          <Row k="Email" v={submission.email} />
          <Row k="入住 / 退房" v={`${submission.checkIn} → ${submission.checkOut}`} />
        </Panel>

        {/* Guest info */}
        <Panel title="入住人資訊" icon={<StickyNote className="h-4 w-4" />}>
          <Row k="入住人數" v={`${submission.guests} 人`} />
          <Row k="預計抵達" v={submission.arrivalTime} />
          <Row k="攜帶寵物" v={submission.hasPet ? "是" : "否"} />
          <Row k="需要停車" v={submission.needParking ? "是" : "否"} />
          <Row k="備註" v={submission.notes || "—"} />
        </Panel>

        {/* Documents */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <PlaceholderCard
            title="證件 Placeholder"
            hint="正式版將以 signed URL 顯示模糊縮圖"
            uploaded={submission.idUploaded}
            icon={<IdCard className="h-5 w-5" />}
          />
          <PlaceholderCard
            title="付款證明 Placeholder"
            hint="正式版將以 signed URL 顯示"
            uploaded={submission.proofUploaded}
            icon={<Receipt className="h-5 w-5" />}
          />
        </div>

        <div className="card-soft mt-4 space-y-1.5 p-4">
          <div className="text-sm font-bold text-foreground">閱讀 / 同意狀態</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <FlagRow label="常見問題已閱讀" ok={submission.faqRead} />
            <FlagRow label="入住須知已同意" ok={submission.rulesAgreed} />
          </div>
        </div>

        {/* Internal note */}
        <div className="card-soft mt-4 p-4">
          <label className="text-sm font-bold text-foreground">內部備註</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="僅民宿內部可見，例如：客人希望安排景觀房。"
            className="mt-2 w-full resize-none rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Checklist */}
        <div className="card-soft mt-4 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
            <ShieldCheck className="h-4 w-4" />
            審核 Checklist
          </div>
          <div className="space-y-2">
            <CheckRow
              label="訂房資料已確認"
              checked={checks.booking}
              onChange={(v) => setChecks({ ...checks, booking: v })}
            />
            <CheckRow
              label="證件資料已確認"
              checked={checks.id}
              onChange={(v) => setChecks({ ...checks, id: v })}
            />
            <CheckRow
              label="押金已確認"
              checked={checks.deposit}
              onChange={(v) => setChecks({ ...checks, deposit: v })}
            />
            <CheckRow
              label="入住須知已確認"
              checked={checks.rules}
              onChange={(v) => setChecks({ ...checks, rules: v })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => {
              setStatus("need_more_info");
              toast.warning("已通知旅客補件");
            }}
            className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            <AlertTriangle className="mr-1.5 inline h-4 w-4 text-[oklch(0.55_0.13_75)]" />
            要求補件
          </button>
          <button
            disabled={!allChecked}
            onClick={() => {
              setStatus("approved");
              toast.success("已核准入住申請");
            }}
            className="rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.75_0.14_85_/_0.6)] disabled:opacity-50"
          >
            <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
            核准入住
          </button>
          <button
            onClick={() => {
              setStatus("completed");
              toast.success("已標記為完成");
            }}
            className="rounded-2xl bg-success px-4 py-3.5 text-sm font-bold text-success-foreground"
          >
            標記完成
          </button>
        </div>

        {status === "approved" && (
          <div className="mt-4 rounded-2xl bg-success-soft p-4">
            <p className="text-sm font-bold text-success">已核准</p>
            <p className="mt-1 text-xs text-foreground/75">
              正式版中，核准後將會開放旅客查看入住指引。
            </p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-border bg-secondary/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-bold text-foreground">Developer Note · 正式版安全需求</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>證件與付款證明需使用 private storage，不可使用公開圖片網址</li>
            <li>業者預覽圖片需使用 signed URL</li>
            <li>所有敏感資料表需啟用 Row Level Security</li>
            <li>客人入住連結需使用高強度隨機 token</li>
            <li>審核通過前，後端也不可回傳門鎖密碼</li>
            <li>需建立資料保存與刪除政策，並加入操作紀錄 audit logs</li>
            <li>使用真實客人證件前，需請專業工程師做安全檢查</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card-soft mt-4 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
        {icon}
        {title}
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0 break-words font-medium text-foreground">{v}</dd>
    </div>
  );
}

function FlagRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border-2 border-destructive" />
      )}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[oklch(0.55_0.13_75)]"
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

function PlaceholderCard({
  title,
  hint,
  uploaded,
  icon,
}: {
  title: string;
  hint: string;
  uploaded: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        {icon}
        {title}
      </div>
      <div
        className={`mt-3 grid h-32 place-items-center rounded-xl border-2 border-dashed ${
          uploaded
            ? "border-success bg-success-soft"
            : "border-border bg-secondary/50"
        }`}
      >
        {uploaded ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <p className="mt-1 text-xs font-semibold text-foreground">
              已上傳（Demo）
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">尚未上傳</p>
        )}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
