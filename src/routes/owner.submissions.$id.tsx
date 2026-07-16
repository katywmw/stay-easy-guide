import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  IdCard,
  Receipt,
  ShieldCheck,
  StickyNote,
  AlertTriangle,
  Trash2,
  Send,
  DoorOpen,
  KeyRound,
} from "lucide-react";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { demoSubmissions } from "@/lib/owner-demo";
import { platformLabels } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";
import { usePropertyConfig } from "@/lib/property-config";
import {
  useSurchargeStore,
  surchargeTotal,
  type SurchargeLine,
} from "@/lib/surcharge-store";
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
    <OwnerShell title="找不到申請" subtitle="Submissions">
      <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">此申請不存在或已被移除。</p>
        <Link
          to="/owner/submissions"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          回列表
        </Link>
      </div>
    </OwnerShell>
  );
}

// Simulated: which rooms this booking covers
function roomsFor(submissionId: string, currentPropertyId: string, allRoomIds: string[]) {
  if (submissionId === "demo") return allRoomIds.slice(0, 2);
  if (submissionId === "s5") return allRoomIds.slice(0, Math.min(3, allRoomIds.length));
  return allRoomIds.slice(0, 1);
}

function SubmissionDetail() {
  const { submission } = Route.useLoaderData();
  const { rooms, currentPropertyId, extraFeeCatalog, payment } = usePropertyConfig();
  const propertyRooms = rooms.filter((r) => r.propertyId === currentPropertyId);
  const bookedRoomIds = roomsFor(submission.id, currentPropertyId, propertyRooms.map((r) => r.id));
  const bookedRooms = propertyRooms.filter((r) => bookedRoomIds.includes(r.id));

  const [releasedRooms, setReleasedRooms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(submission.status);
  const [checks, setChecks] = useState({
    booking: false,
    id: false,
    deposit: false,
    rules: false,
  });
  const allChecked = Object.values(checks).every(Boolean);
  const st = checkinStatusPill(status);
  const dp = depositPill(submission.deposit);

  const surcharge = useSurchargeStore();
  const invoices = surcharge.bySubmission(submission.id);

  const [surchargeLines, setSurchargeLines] = useState<SurchargeLine[]>([]);
  const [surchargeNote, setSurchargeNote] = useState("");
  const surchargeSum = surchargeLines.reduce((s, l) => s + l.unitAmount * l.quantity, 0);

  const addSurchargeLine = (feeId: string) => {
    const fee = extraFeeCatalog.find((f) => f.id === feeId);
    if (!fee) return;
    setSurchargeLines((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 8),
        name: fee.name,
        unit: fee.unit,
        quantity: 1,
        unitAmount: fee.defaultAmount,
      },
    ]);
  };

  const createSurcharge = () => {
    if (surchargeLines.length === 0) return toast.error("請至少加入一項費用");
    const inv = surcharge.create({
      submissionId: submission.id,
      guestName: submission.name,
      lines: surchargeLines,
      note: surchargeNote,
    });
    setSurchargeLines([]);
    setSurchargeNote("");
    toast.success(`已建立補款單 #${inv.id}，請通知旅客`);
  };

  return (
    <OwnerShell title={submission.name} subtitle={`申請 #${submission.id}`}>
      <Toaster position="top-center" richColors />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[oklch(0.92_0.02_80)] bg-card p-4">
        <StatusPill label={st.label} tone={st.tone} />
        <StatusPill label={`押金 · ${dp.label}`} tone={dp.tone} />
        <span className="ml-auto text-xs text-muted-foreground">
          送出：{submission.submittedAt}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OwnerCard title="訂房資料">
          <dl className="space-y-1.5 text-sm">
            <Row k="訂房平台" v={platformLabels[submission.platform as keyof typeof platformLabels]} />
            <Row k="訂房姓名" v={submission.name} />
            <Row k="手機" v={submission.phone} />
            <Row k="Email" v={submission.email} />
            <Row k="入住 / 退房" v={`${submission.checkIn} → ${submission.checkOut}`} />
            <Row k="房間數" v={`${bookedRooms.length} 間`} />
          </dl>
        </OwnerCard>

        <OwnerCard title="入住人資訊">
          <dl className="space-y-1.5 text-sm">
            <Row k="入住人數" v={`${submission.guests} 人`} />
            <Row k="預計抵達" v={submission.arrivalTime} />
            <Row k="攜帶寵物" v={submission.hasPet ? "是" : "否"} />
            <Row k="需要停車" v={submission.needParking ? "是" : "否"} />
            <Row k="備註" v={submission.notes || "—"} />
          </dl>
        </OwnerCard>
      </div>

      <OwnerCard title="訂購房間與密碼釋出" desc="可個別或一次釋出所有房間密碼">
        <div className="space-y-3">
          {bookedRooms.map((r) => {
            const released = releasedRooms.includes(r.id);
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-3"
              >
                <DoorOpen className="h-4 w-4 text-[oklch(0.55_0.08_60)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                    大門 {r.gatePassword || "—"} · 房門 {r.doorPassword || "—"} · 押金 NT$ {r.depositAmount.toLocaleString()}
                  </p>
                </div>
                {released ? (
                  <StatusPill label="密碼已釋出" tone="success" />
                ) : (
                  <button
                    onClick={() => {
                      setReleasedRooms((v) => [...v, r.id]);
                      toast.success(`已釋出「${r.name}」密碼`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    釋出密碼
                  </button>
                )}
              </div>
            );
          })}
          {bookedRooms.length > 1 && (
            <button
              onClick={() => {
                setReleasedRooms(bookedRooms.map((r) => r.id));
                toast.success("已釋出全部房間密碼");
              }}
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              一次釋出所有房間
            </button>
          )}
        </div>
      </OwnerCard>

      <div className="mt-4">
        <OwnerCard
          title="補款 / 額外費用"
          desc="從「額外費用項目」選取，建立獨立補款單。旅客會收到補款連結，付款完成後在此標記已收。"
        >
          {invoices.length > 0 && (
            <div className="mb-4 space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[oklch(0.94_0.02_82)] bg-primary-soft/20 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      補款單 #{inv.id} · NT$ {surchargeTotal(inv).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {inv.lines.map((l) => `${l.name} × ${l.quantity}`).join("、")}
                    </p>
                    <p className="mt-1">
                      <StatusPill
                        label={inv.status === "paid" ? "已收款" : inv.status === "cancelled" ? "已取消" : "待付款"}
                        tone={inv.status === "paid" ? "success" : inv.status === "cancelled" ? "muted" : "warning"}
                      />
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Link
                      to="/checkin/demo/surcharge/$id"
                      params={{ id: inv.id }}
                      target="_blank"
                      className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary"
                    >
                      預覽旅客頁
                    </Link>
                    {inv.status === "pending" && (
                      <button
                        onClick={() => {
                          surcharge.updateStatus(inv.id, "paid");
                          toast.success("已標記已收款");
                        }}
                        className="rounded-full bg-success px-3 py-1 text-[11px] font-bold text-success-foreground"
                      >
                        標記已收
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-dashed border-primary bg-primary-soft/20 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-foreground">新增品項：</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addSurchargeLine(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs outline-none focus:border-primary"
                defaultValue=""
              >
                <option value="" disabled>從清單選取…</option>
                {extraFeeCatalog.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}（{f.unit} NT$ {f.defaultAmount}）
                  </option>
                ))}
              </select>
              <Link
                to="/owner/settings/extra-fees"
                className="text-[11px] font-semibold text-[oklch(0.55_0.08_60)] underline"
              >
                管理項目
              </Link>
            </div>

            {surchargeLines.length > 0 && (
              <div className="mb-3 overflow-hidden rounded-lg border border-[oklch(0.94_0.02_82)]">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/60 text-left font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">項目</th>
                      <th className="px-3 py-2">單位</th>
                      <th className="px-3 py-2 w-20 text-right">數量</th>
                      <th className="px-3 py-2 w-24 text-right">單價</th>
                      <th className="px-3 py-2 w-24 text-right">小計</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[oklch(0.94_0.02_82)] bg-card">
                    {surchargeLines.map((l, i) => (
                      <tr key={l.id}>
                        <td className="px-3 py-2 font-semibold text-foreground">{l.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{l.unit}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            value={l.quantity}
                            onChange={(e) => {
                              const q = Number(e.target.value) || 1;
                              setSurchargeLines((prev) => prev.map((x, j) => j === i ? { ...x, quantity: q } : x));
                            }}
                            className="w-full rounded border border-input bg-card px-2 py-1 text-right text-xs outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={l.unitAmount}
                            onChange={(e) => {
                              const a = Number(e.target.value) || 0;
                              setSurchargeLines((prev) => prev.map((x, j) => j === i ? { ...x, unitAmount: a } : x));
                            }}
                            className="w-full rounded border border-input bg-card px-2 py-1 text-right text-xs outline-none"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-foreground [font-variant-numeric:tabular-nums]">
                          NT$ {(l.quantity * l.unitAmount).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() =>
                              setSurchargeLines((prev) => prev.filter((_, j) => j !== i))
                            }
                            className="grid h-6 w-6 place-items-center rounded text-destructive hover:bg-destructive-soft"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-secondary/60 font-bold text-foreground">
                      <td colSpan={4} className="px-3 py-2 text-right">合計</td>
                      <td className="px-3 py-2 text-right [font-variant-numeric:tabular-nums]">
                        NT$ {surchargeSum.toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <textarea
              value={surchargeNote}
              onChange={(e) => setSurchargeNote(e.target.value)}
              rows={2}
              placeholder="備註（旅客可見）"
              className="mb-3 w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <button
              onClick={createSurcharge}
              disabled={surchargeLines.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              建立補款單並通知旅客
            </button>
          </div>
        </OwnerCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <OwnerCard title="證件 / 付款證明">
          <div className="grid gap-3 sm:grid-cols-2">
            <PlaceholderCard title="證件" uploaded={submission.idUploaded} icon={<IdCard className="h-5 w-5" />} />
            <PlaceholderCard title="付款證明" uploaded={submission.proofUploaded} icon={<Receipt className="h-5 w-5" />} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <FlagRow label="FAQ 已閱讀" ok={submission.faqRead} />
            <FlagRow label="須知已同意" ok={submission.rulesAgreed} />
          </div>
        </OwnerCard>

        <OwnerCard title="內部備註 / Checklist">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="僅民宿內部可見。"
            className="mb-3 w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="space-y-2">
            {(["booking","id","deposit","rules"] as const).map((k) => (
              <CheckRow
                key={k}
                label={{
                  booking: "訂房資料已確認",
                  id: "證件資料已確認",
                  deposit: "押金已確認",
                  rules: "入住須知已確認",
                }[k]}
                checked={checks[k]}
                onChange={(v) => setChecks({ ...checks, [k]: v })}
              />
            ))}
          </div>
        </OwnerCard>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => {
            setStatus("need_more_info");
            toast.warning("已通知旅客補件");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          <AlertTriangle className="h-4 w-4 text-[oklch(0.55_0.13_75)]" />
          要求補件
        </button>
        <button
          disabled={!allChecked}
          onClick={() => {
            setStatus("approved");
            toast.success("已核准入住申請");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" />
          核准入住
        </button>
        <button
          onClick={() => {
            setStatus("completed");
            toast.success("已標記為完成");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2.5 text-sm font-bold text-success-foreground"
        >
          <CheckCircle2 className="h-4 w-4" />
          標記完成
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          付款帳戶：{payment.accountName}
        </span>
      </div>
    </OwnerShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0 break-words font-medium text-foreground">{v}</dd>
    </div>
  );
}

function FlagRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <span className="h-4 w-4 shrink-0 rounded-full border-2 border-destructive" />}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[oklch(0.75_0.14_85)]" />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

function PlaceholderCard({ title, uploaded, icon }: { title: string; uploaded: boolean; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
        {icon}
        {title}
      </div>
      <div className={`mt-2 grid h-24 place-items-center rounded-lg border-2 border-dashed ${uploaded ? "border-success bg-success-soft" : "border-border bg-card"}`}>
        {uploaded ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-success" />
            <p className="mt-0.5 text-[10px] font-semibold text-foreground">已上傳</p>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">尚未上傳</p>
        )}
      </div>
    </div>
  );
}

// Suppress unused import warning
void Plus;
