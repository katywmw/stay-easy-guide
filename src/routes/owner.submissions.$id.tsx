import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  IdCard,
  Receipt,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Send,
  DoorOpen,
  RefreshCw,
  BellRing,
  Eye,
  Pencil,
  Building2,
  Home,
  X,
  Save as SaveIcon,
  Loader2,
  Clock,
} from "lucide-react";
import { useRoomAssignments } from "@/lib/room-assignments";
import { propertyColors } from "@/lib/property-colors";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { demoSubmissions } from "@/lib/owner-demo";
import { platformLabels } from "@/lib/checkin-store";
import {
  checkinStatusPill,
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";
import { usePropertyConfig, type Room, type RoomTypeGroup } from "@/lib/property-config";
import {
  useSurchargeStore,
  surchargeTotal,
  type SurchargeLine,
} from "@/lib/surcharge-store";
import { toast, Toaster } from "sonner";
import {
  useSubmissionUpdates,
  diffSnapshots,
  snapshotEqual,
  reissueFieldLabels,
  type SentRoomSnapshot,
  type ReissueField,
} from "@/lib/submission-updates";



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

// Default suggested rooms per booking (used to seed the assignment card)
function defaultRoomsFor(submissionId: string, allRoomIds: string[]) {
  if (submissionId === "demo") return allRoomIds.slice(0, 2);
  if (submissionId === "s5") return allRoomIds.slice(0, Math.min(3, allRoomIds.length));
  return allRoomIds.slice(0, 1);
}

function SubmissionDetail() {
  const { submission } = Route.useLoaderData();
  const { rooms, roomGroups, properties, extraFeeCatalog, payment, updateRoom, updateProperty } = usePropertyConfig();
  const submissionPropertyId = submission.propertyId;
  const submissionProperty = properties.find((p) => p.id === submissionPropertyId);
  const propertyRooms = rooms.filter((r) => r.propertyId === submissionPropertyId);
  const propertyGroups = roomGroups.filter((g) => g.propertyId === submissionPropertyId);
  const colors = propertyColors(submissionPropertyId);

  // Room assignment (manual, owner-controlled). Falls back to a suggested default.
  const assignments = useRoomAssignments();
  const storedAssignment = assignments.assignments[submission.id];
  const assignedRoomIds = storedAssignment ?? defaultRoomsFor(submission.id, propertyRooms.map((r) => r.id));
  const isAutoAssigned = !storedAssignment;
  const bookedRooms = propertyRooms.filter((r) => assignedRoomIds.includes(r.id));

  // Current snapshot of the room info owners would send to the guest
  const currentSnapshot: SentRoomSnapshot[] = useMemo(
    () =>
      bookedRooms.map((r) => ({
        roomId: r.id,
        roomNumber: r.roomNumber ?? "",
        displayName: r.displayName ?? "",
        doorPassword: r.doorPassword ?? "",
        gatePassword: r.gatePassword ?? submissionProperty?.gatePassword ?? "",
      })),
    [bookedRooms, submissionProperty?.gatePassword],
  );

  const updates = useSubmissionUpdates();
  const record = updates.updates[submission.id];
  const drift = record ? !snapshotEqual(record.snapshot, currentSnapshot) : false;


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

  // Reissue-request state (要求補件) — combined with surcharge notification
  const [reissueField, setReissueField] = useState<ReissueField | "">("");
  const [reissueReason, setReissueReason] = useState("");
  const [reissueMessage, setReissueMessage] = useState("");

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

  const notifyGuest = () => {
    const hasSurcharge = surchargeLines.length > 0;
    const hasReissue = !!reissueField;
    if (!hasSurcharge && !hasReissue) {
      return toast.error("請新增補款項目或選擇要求補件的類型");
    }
    if (hasSurcharge) {
      const inv = surcharge.create({
        submissionId: submission.id,
        guestName: submission.name,
        lines: surchargeLines,
        note: surchargeNote,
      });
      setSurchargeLines([]);
      setSurchargeNote("");
      toast.success(`已建立補款單 #${inv.id}`);
    }
    if (hasReissue) {
      updates.requestReissue({
        submissionId: submission.id,
        field: reissueField as ReissueField,
        reason: reissueReason,
        message: reissueMessage,
      });
      setStatus("need_more_info");
      setReissueField("");
      setReissueReason("");
      setReissueMessage("");
      toast.success("已通知旅客補件");
    }
  };

  // Approving auto-releases room passwords + first-time notify.
  const approveAndRelease = () => {
    setStatus("approved");
    setReleasedRooms(bookedRooms.map((r) => r.id));
    if (bookedRooms.length > 0 && !record) {
      updates.notify(submission.id, currentSnapshot, "首次寄出入住資訊");
    }
    toast.success("已核准並釋出密碼給旅客");
  };

  const hasReleased = releasedRooms.length > 0;
  const showSentBox = hasReleased || !!record;

  const guestUpdates = updates.guestUpdates[submission.id] ?? [];
  const reissueRequest = updates.reissue[submission.id];

  return (
    <OwnerShell
      title={submission.name}
      subtitle={`申請 #${submission.id}`}
      hidePropertySwitcher
      headerExtra={
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${colors.chipBg} ${colors.chipFg}`}
          title={submissionProperty?.name}
        >
          <Building2 className="h-3 w-3" />
          <span className="max-w-[10rem] truncate">{submissionProperty?.name ?? "—"}</span>
          <span className="opacity-60">·</span>
          <span className="[font-variant-numeric:tabular-nums]">#{submission.id}</span>
        </span>
      }
    >
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

      <RoomAssignmentCard
        submissionId={submission.id}
        propertyRooms={propertyRooms}
        groups={propertyGroups}
        assignedRoomIds={assignedRoomIds}
        isAutoAssigned={isAutoAssigned}
        onSave={(ids) => assignments.set(submission.id, ids)}
        onClear={() => assignments.clear(submission.id)}
        guestCount={submission.guests}
      />

      <div className="mt-4">
        <OwnerCard title="訂購房間與密碼釋出" desc="可個別編輯密碼或一次釋出所有房間">
          {bookedRooms.length === 0 ? (
            <p className="rounded-lg border border-dashed border-warning bg-warning-soft/40 p-4 text-center text-xs text-foreground">
              尚未分配房間，請於上方「分配房間」選擇後才能釋出密碼。
            </p>
          ) : (
            <div className="space-y-3">
              {bookedRooms.map((r) => {
                const released = releasedRooms.includes(r.id);
                const gate = r.gatePassword || submissionProperty?.gatePassword || "";
                return (
                  <div
                    key={r.id}
                    className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <DoorOpen className="h-4 w-4 text-[oklch(0.55_0.08_60)]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {r.displayName || r.roomNumber || r.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                          大門 {gate || "—"} · 房門 {r.doorPassword || "—"} · 押金 NT$ {r.depositAmount.toLocaleString()}
                        </p>
                      </div>
                      <InlinePasswordEditor
                        room={r}
                        propertyGate={submissionProperty?.gatePassword ?? ""}
                        onSaveRoom={(patch) => updateRoom(r.id, patch)}
                        onSaveProperty={(gp) =>
                          submissionProperty && updateProperty(submissionProperty.id, { gatePassword: gp })
                        }
                      />
                      {released ? (
                        <StatusPill label="密碼已釋出" tone="success" />
                      ) : (
                        <StatusPill label="待核准後自動釋出" tone="muted" />
                      )}
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-muted-foreground">
                密碼預設由「
                <Link to="/owner/settings/passwords" className="font-semibold text-foreground underline">
                  密碼設定
                </Link>
                」頁管理，此處的鉛筆按鈕可就地覆寫並自動同步。
              </p>
            </div>
          )}
        </OwnerCard>
      </div>


      {/* Info-updated notifier — appears only after passwords released or already sent */}
      {showSentBox && (
      <div className="mt-4">
        <OwnerCard
          title="已寄出的入住資訊"
          desc="若房號或密碼有更動，可重新通知旅客，並追蹤是否已收到最新資訊。"
          actions={
            record ? (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-foreground">
                第 {record.lastVersion} 版
              </span>
            ) : null
          }
        >
          {/* Drift banner */}
          {record && drift && (
            <div className="mb-3 flex flex-wrap items-start gap-3 rounded-lg border border-warning bg-warning-soft/70 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[oklch(0.55_0.13_75)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">資訊已變更，尚未通知旅客</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  變更內容：{diffSnapshots(record.snapshot, currentSnapshot)}
                </p>
              </div>
              <button
                onClick={() => {
                  const diff = diffSnapshots(record.snapshot, currentSnapshot);
                  updates.notify(submission.id, currentSnapshot, diff);
                  toast.success(`已寄出更新給旅客（第 ${record.lastVersion + 1} 版）`);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重新寄送更新
              </button>
            </div>
          )}

          {!record && (
            <div className="mb-3 rounded-lg border border-dashed border-border bg-secondary/30 p-3">
              <p className="text-xs text-muted-foreground">
                尚未寄出入住資訊。核准入住並釋出密碼後，點下方按鈕通知旅客。
              </p>
            </div>
          )}

          {/* Current snapshot */}
          <div className="mb-3 space-y-2">
            {currentSnapshot.map((r) => {
              const prevSnap = record?.snapshot.find((x) => x.roomId === r.roomId);
              const changed = prevSnap && (
                prevSnap.roomNumber !== r.roomNumber ||
                prevSnap.displayName !== r.displayName ||
                prevSnap.doorPassword !== r.doorPassword ||
                prevSnap.gatePassword !== r.gatePassword
              );
              const title = r.displayName || r.roomNumber || "未命名";
              return (
                <div key={r.roomId} className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-card p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{title}</p>
                    {r.displayName && r.roomNumber && (
                      <span className="text-[11px] text-muted-foreground">房號 {r.roomNumber}</span>
                    )}
                    {changed && (
                      <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-[oklch(0.45_0.13_55)]">已更新</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                    大門 {r.gatePassword || "—"} · 房門 {r.doorPassword || "—"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Status + actions */}
          <div className="flex flex-wrap items-center gap-2">
            {record ? (
              <>
                <StatusPill
                  label={
                    record.guestAcknowledgedAt
                      ? `旅客已收到更新 · ${new Date(record.guestAcknowledgedAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`
                      : `已於 ${new Date(record.lastNotifiedAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })} 寄出 · 尚未確認`
                  }
                  tone={record.guestAcknowledgedAt ? "success" : "warning"}
                />
                {!record.guestAcknowledgedAt && (
                  <button
                    onClick={() => {
                      updates.acknowledge(submission.id);
                      toast.success("已標記旅客已讀（模擬）");
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary"
                  >
                    <Eye className="h-3 w-3" />
                    模擬旅客已讀
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  updates.notify(submission.id, currentSnapshot, "首次寄出入住資訊");
                  toast.success("已寄出入住資訊給旅客");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <BellRing className="h-3.5 w-3.5" />
                首次寄出入住資訊
              </button>
            )}
          </div>
        </OwnerCard>
      </div>
      )}



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

      {/* 補款 / 額外費用 / 要求補件 — placed right under ID/payment */}
      <div className="mt-4">
        <OwnerCard
          title="補款 / 額外費用 / 要求補件"
          desc="通知旅客補款或要求補件（例：證件照片不清、缺少付款憑證）。按下「通知旅客」後，旅客會在其入住頁面看到明確的補件說明。"
        >
          {reissueRequest && !reissueRequest.resolvedAt && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-warning bg-warning-soft/40 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[oklch(0.55_0.13_75)]" />
              <div className="min-w-0 flex-1 text-xs text-foreground/85">
                <p className="font-bold">
                  已要求補件：{reissueFieldLabels[reissueRequest.field]}
                  {reissueRequest.reason && ` · ${reissueRequest.reason}`}
                </p>
                {reissueRequest.message && (
                  <p className="mt-1 text-muted-foreground">{reissueRequest.message}</p>
                )}
              </div>
              <button
                onClick={() => {
                  updates.resolveReissue(submission.id);
                  toast.success("已標記補件完成");
                }}
                className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground"
              >
                標記完成
              </button>
            </div>
          )}

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

          {/* 要求補件 sub-section */}
          <ReissueSection
            field={reissueField}
            reason={reissueReason}
            message={reissueMessage}
            onFieldChange={setReissueField}
            onReasonChange={setReissueReason}
            onMessageChange={setReissueMessage}
          />

          {/* 補款 / 額外費用 sub-section */}
          <div className="mt-3 rounded-lg border border-dashed border-primary bg-primary-soft/20 p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
              補款 / 額外費用
            </p>
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
          </div>

          <div className="mt-3">
            <button
              onClick={notifyGuest}
              disabled={surchargeLines.length === 0 && !reissueField}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              通知旅客
            </button>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              旅客會收到補款連結／補件說明，並於補件完成後於「旅客更新紀錄」自動顯示。
            </p>
          </div>
        </OwnerCard>
      </div>

      {/* 旅客更新紀錄 */}
      <div className="mt-4">
        <OwnerCard
          title="旅客更新紀錄"
          desc="旅客補件、重新上傳資料或完成補款時會顯示於此。"
          actions={
            guestUpdates.length > 0 && (
              <button
                onClick={() => {
                  updates.markSeen(submission.id);
                  toast.success("已標記為已讀");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary"
              >
                <Eye className="h-3 w-3" />
                標記已讀
              </button>
            )
          }
        >
          {guestUpdates.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              旅客尚未更新資料。要求補件後，旅客的更新會即時顯示於此。
            </div>
          ) : (
            <ul className="space-y-2">
              {[...guestUpdates].reverse().map((u, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-[oklch(0.94_0.02_82)] bg-card p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      旅客已重新上傳「{reissueFieldLabels[u.field]}」
                    </p>
                    {u.note && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{u.note}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {new Date(u.at).toLocaleString("zh-TW", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </OwnerCard>
      </div>

      {/* Approval bar: only 核准入住 remains — approval auto-releases passwords */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          disabled={!allChecked || status === "approved"}
          onClick={approveAndRelease}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" />
          核准入住並釋出密碼
        </button>
        <span className="text-xs text-muted-foreground">
          {allChecked ? "確認完 checklist 後即可核准，密碼將自動釋出。" : "請先勾選 checklist。"}
        </span>
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

// ------------------------------------------------------------------
// Room assignment
// ------------------------------------------------------------------
function RoomAssignmentCard({
  submissionId: _sid,
  propertyRooms,
  groups,
  assignedRoomIds,
  isAutoAssigned,
  onSave,
  onClear,
  guestCount,
}: {
  submissionId: string;
  propertyRooms: Room[];
  groups: RoomTypeGroup[];
  assignedRoomIds: string[];
  isAutoAssigned: boolean;
  onSave: (ids: string[]) => void;
  onClear: () => void;
  guestCount: number;
}) {
  const [draft, setDraft] = useState<string[]>(assignedRoomIds);
  const dirty = JSON.stringify([...draft].sort()) !== JSON.stringify([...assignedRoomIds].sort());
  const toggle = (id: string) =>
    setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  return (
    <div className="mt-4">
      <OwnerCard
        title="分配房間"
        desc="由業者依據入住需求選擇實際入住的房間"
        actions={
          <div className="flex items-center gap-2">
            {isAutoAssigned && (
              <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-[oklch(0.45_0.13_55)]">
                系統建議（尚未確認）
              </span>
            )}
            <button
              onClick={() => {
                onSave(draft);
                toast.success("已儲存房間分配");
              }}
              disabled={!dirty}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-40"
            >
              儲存分配
            </button>
            <button
              onClick={() => {
                onClear();
                setDraft([]);
                toast("已清除自訂分配");
              }}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
            >
              清除
            </button>
          </div>
        }
      >
        <p className="mb-3 text-xs text-muted-foreground">
          入住人數：<span className="font-bold text-foreground">{guestCount}</span>　·　
          已選：<span className="font-bold text-foreground">{draft.length}</span> 間
        </p>
        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            此民宿尚未建立房型。
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => {
              const gRooms = propertyRooms.filter((r) => r.groupId === g.id);
              if (gRooms.length === 0) return null;
              return (
                <div key={g.id} className="rounded-lg border border-[oklch(0.94_0.02_82)] p-3">
                  <p className="mb-2 text-xs font-black text-foreground">{g.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {gRooms.map((r) => {
                      const on = draft.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          onClick={() => toggle(r.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            on
                              ? "border-2 border-primary bg-primary-soft text-foreground"
                              : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          <Home className="h-3 w-3" />
                          {r.displayName || r.roomNumber || r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </OwnerCard>
    </div>
  );
}

// ------------------------------------------------------------------
// Inline password editor (pencil button)
// ------------------------------------------------------------------
function InlinePasswordEditor({
  room,
  propertyGate,
  onSaveRoom,
  onSaveProperty,
}: {
  room: Room;
  propertyGate: string;
  onSaveRoom: (patch: Partial<Room>) => void;
  onSaveProperty: (gp: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [door, setDoor] = useState(room.doorPassword ?? "");
  const [gate, setGate] = useState(room.gatePassword ?? propertyGate ?? "");

  if (!open) {
    return (
      <button
        onClick={() => {
          setDoor(room.doorPassword ?? "");
          setGate(room.gatePassword ?? propertyGate ?? "");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary"
        title="編輯密碼"
      >
        <Pencil className="h-3 w-3" />
        編輯
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-primary bg-primary-soft/30 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Pencil className="h-3.5 w-3.5 text-foreground" />
        <p className="text-xs font-bold text-foreground">就地編輯密碼</p>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto grid h-6 w-6 place-items-center rounded hover:bg-card"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[11px]">
          <span className="mb-0.5 block font-semibold text-muted-foreground">房門密碼</span>
          <input
            value={door}
            onChange={(e) => setDoor(e.target.value)}
            className="w-full rounded border border-input bg-card px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="text-[11px]">
          <span className="mb-0.5 block font-semibold text-muted-foreground">大門密碼（此房覆寫）</span>
          <input
            value={gate}
            onChange={(e) => setGate(e.target.value)}
            className="w-full rounded border border-input bg-card px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            onSaveRoom({ doorPassword: door, gatePassword: gate });
            toast.success("已更新密碼，資訊已同步至密碼設定頁");
            setOpen(false);
          }}
          className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
        >
          儲存
        </button>
        <Link
          to="/owner/settings/passwords"
          className="text-[11px] font-semibold text-muted-foreground underline"
        >
          改用密碼設定頁編輯
        </Link>
      </div>
    </div>
  );
}


