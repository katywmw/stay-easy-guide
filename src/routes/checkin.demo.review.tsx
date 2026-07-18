import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Pencil } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { PrimaryButton } from "@/components/checkin/Fields";
import {
  depositPill,
  StatusPill,
} from "@/components/checkin/StatusPill";
import {
  platformLabels,
  useCheckinStore,
} from "@/lib/checkin-store";
import { useLiveSubmissions } from "@/lib/live-submissions";
import { StepBar } from "./checkin.demo.booking";

export const Route = createFileRoute("/checkin/demo/review")({
  component: ReviewPage,
  head: () => ({ meta: [{ title: "檢查資料 · 胡桃民宿" }] }),
});

function ReviewPage() {
  const nav = useNavigate();
  const s = useCheckinStore();
  const dp = depositPill(s.depositStatus);
  const push = useLiveSubmissions((st) => st.push);

  const submit = () => {
    s.submit();
    const id = `live-${Date.now().toString(36)}`;
    push({
      source: "live",
      id,
      propertyId: s.propertyId || "walnut",
      name: s.bookingName || "測試旅客",
      platform: (s.platform || "other") as never,
      checkIn: s.checkInDate,
      checkOut: s.checkOutDate,
      guests: Number(s.guestCount) || 1,
      status: "submitted",
      deposit: s.depositStatus,
      phone: s.phone,
      email: s.email,
      arrivalTime: s.arrivalTime,
      hasPet: s.hasPet === "yes",
      needParking: s.needParking === "yes",
      notes: s.specialNotes,
      idUploaded: s.idUploaded,
      proofUploaded: s.depositProofUploaded,
      faqRead: s.faqRead,
      rulesAgreed: s.rulesAgreed,
      submittedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    // Remember the id so the submitted page reads the live record
    try {
      localStorage.setItem("walnut-live-current-id", id);
    } catch {
      /* ignore */
    }
    nav({ to: "/checkin/demo/submitted" });
  };


  return (
    <PhoneShell title="檢查資料" subtitle="步驟 5 / 5" backTo="/checkin/demo/house-rules">
      <StepBar current={5} />

      <div className="mt-4 space-y-3">
        <SummaryBlock
          title="訂房資料"
          editTo="/checkin/demo/booking"
          rows={[
            ["訂房平台", s.platform ? platformLabels[s.platform] : "—"],
            ["訂房姓名", s.bookingName || "—"],
            ["手機", s.phone || "—"],
            ["Email", s.email || "—"],
            ["入住 / 退房", `${s.checkInDate || "—"} → ${s.checkOutDate || "—"}`],
            ["訂單編號", s.orderId || "—"],
          ]}
        />

        <SummaryBlock
          title="入住人資訊"
          editTo="/checkin/demo/guest-info"
          rows={[
            ["入住人數", `${s.guestCount || "—"} 人`],
            ["預計抵達", s.arrivalTime || "—"],
            ["攜帶寵物", s.hasPet === "yes" ? "是" : s.hasPet === "no" ? "否" : "—"],
            ["需要停車", s.needParking === "yes" ? "是" : s.needParking === "no" ? "否" : "—"],
            ["備註", s.specialNotes || "—"],
          ]}
        />

        <StatusBlock
          title="證件上傳"
          editTo="/checkin/demo/id-upload"
          ok={s.idUploaded && s.idConsent}
          okText="已完成上傳與同意"
          failText="尚未完成"
        />

        <div className="card-soft p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">押金狀態</p>
            <Link to="/checkin/demo/deposit" className="text-xs font-semibold text-[oklch(0.55_0.13_75)]">
              <Pencil className="inline h-3 w-3" /> 編輯
            </Link>
          </div>
          <StatusPill label={dp.label} tone={dp.tone} />
        </div>


        <StatusBlock
          title="入住須知"
          editTo="/checkin/demo/house-rules"
          ok={s.rulesAgreed}
          okText="已同意"
          failText="尚未同意"
        />
      </div>

      <div className="mt-6">
        <PrimaryButton
          disabled={!s.idUploaded || !s.idConsent || !s.rulesAgreed}
          onClick={submit}
        >
          送出入住資料
        </PrimaryButton>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          送出後民宿將盡快確認，請留意 LINE 或 Email 訊息。
        </p>
      </div>
    </PhoneShell>
  );
}

function SummaryBlock({
  title,
  rows,
  editTo,
}: {
  title: string;
  rows: [string, string][];
  editTo: string;
}) {
  return (
    <div className="card-soft p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <Link to={editTo} className="text-xs font-semibold text-[oklch(0.55_0.13_75)]">
          <Pencil className="inline h-3 w-3" /> 編輯
        </Link>
      </div>
      <dl className="space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="min-w-0 break-words font-medium text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function StatusBlock({
  title,
  editTo,
  ok,
  okText,
  failText,
}: {
  title: string;
  editTo: string;
  ok: boolean;
  okText: string;
  failText: string;
}) {
  return (
    <div className="card-soft flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        {ok ? (
          <CheckCircle2 className="h-6 w-6 text-success" />
        ) : (
          <XCircle className="h-6 w-6 text-destructive" />
        )}
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{ok ? okText : failText}</p>
        </div>
      </div>
      <Link to={editTo} className="text-xs font-semibold text-[oklch(0.55_0.13_75)]">
        編輯
      </Link>
    </div>
  );
}
