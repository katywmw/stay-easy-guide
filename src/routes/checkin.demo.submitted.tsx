import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, MessageCircle, BellRing, AlertTriangle, Upload, Receipt } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { StatusPill } from "@/components/checkin/StatusPill";
import { usePropertyConfig } from "@/lib/property-config";
import {
  useSubmissionUpdates,
  reissueFieldLabels,
} from "@/lib/submission-updates";
import { useCheckinStore } from "@/lib/checkin-store";
import { useLiveSubmissions } from "@/lib/live-submissions";
import { useSurchargeStore, surchargeTotal } from "@/lib/surcharge-store";
import { channelIcon, channelHref } from "./owner.settings.contact";

export const Route = createFileRoute("/checkin/demo/submitted")({
  component: SubmittedPage,
  head: () => ({ meta: [{ title: "已送出 · 胡桃民宿" }] }),
});

const nextSteps = [
  "民宿會核對訂房資料",
  "民宿會確認證件資料",
  "民宿會確認押金狀態",
  "審核通過後，入住指引將會開放",
  "請留意 LINE 或 Email 訊息",
];

function SubmittedPage() {
  const { contactChannels } = usePropertyConfig();
  const active = contactChannels.filter((c) => c.enabled && c.value.trim());
  const [currentSubmissionId, setCurrentSubmissionId] = useState("demo");

  useEffect(() => {
    try {
      const id = localStorage.getItem("walnut-live-current-id");
      if (id) setCurrentSubmissionId(id);
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const record = useSubmissionUpdates((s) => s.updates[currentSubmissionId]);
  const reissue = useSubmissionUpdates((s) => s.reissue[currentSubmissionId]);
  const acknowledge = useSubmissionUpdates((s) => s.acknowledge);
  const markGuestUpdate = useSubmissionUpdates((s) => s.markGuestUpdate);
  const resolveReissue = useSubmissionUpdates((s) => s.resolveReissue);
  const checkinStatus = useCheckinStore((s) => s.status);
  const updateCheckin = useCheckinStore((s) => s.update);
  const updateLiveSubmission = useLiveSubmissions((s) => s.updateOne);
  const invoices = useSurchargeStore((s) => s.bySubmission(currentSubmissionId));
  const pendingInvoices = invoices.filter((i) => i.status === "pending");

  const isApproved = checkinStatus === "approved" || checkinStatus === "completed";

  const statusDisplay =
    checkinStatus === "approved"
      ? { label: "審核通過", tone: "success" as const }
      : checkinStatus === "need_more_info"
        ? { label: "需補件", tone: "warning" as const }
        : checkinStatus === "completed"
          ? { label: "已完成", tone: "success" as const }
          : { label: "等待審核", tone: "warning" as const };

  // Auto-acknowledge when guest visits after an update
  useEffect(() => {
    if (record && !record.guestAcknowledgedAt) {
      const t = setTimeout(() => acknowledge(currentSubmissionId), 800);
      return () => clearTimeout(t);
    }
  }, [record, acknowledge, currentSubmissionId]);

  const activeReissue = reissue && !reissue.resolvedAt && !isApproved ? reissue : null;
  const canShowAccessInfo = isApproved && !!record;
  const simulateReupload = () => {
    if (!activeReissue) return;
    markGuestUpdate(currentSubmissionId, activeReissue.field, "旅客已重新上傳（模擬）");
    resolveReissue(currentSubmissionId);
    updateLiveSubmission(currentSubmissionId, { status: "submitted" });
    updateCheckin({ status: "submitted" });
  };


  return (
    <PhoneShell showBack={false} bare>
      <div className="flex min-h-screen flex-col px-4 pb-8 pt-[max(env(safe-area-inset-top),1.5rem)]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div
            className="relative grid h-28 w-28 place-items-center rounded-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.94 0.06 145) 0%, oklch(0.82 0.14 88) 100%)",
            }}
          >
            <div className="absolute inset-2 grid place-items-center rounded-full bg-card">
              <CheckCircle2 className="h-14 w-14 text-success" strokeWidth={2.2} />
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-black text-foreground">資料已送出</h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            您的入住資料已送出，民宿將盡快確認。
          </p>

          <div className="mt-5 card-soft w-full max-w-sm p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">目前狀態</span>
              <StatusPill label={statusDisplay.label} tone={statusDisplay.tone} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              民宿通常於 24 小時內完成審核
            </div>
          </div>
        </div>

        {activeReissue && (
          <div
            className="mt-6 rounded-2xl border-2 border-destructive bg-destructive-soft/40 p-5 shadow-md"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-black text-foreground">
                民宿要求補件：{reissueFieldLabels[activeReissue.field]}
              </p>
            </div>
            {activeReissue.reason && (
              <p className="mt-2 text-xs leading-relaxed text-foreground/85">
                {activeReissue.reason}
              </p>
            )}
            {activeReissue.message && (
              <p className="mt-1 rounded-lg bg-card/70 p-2 text-[11px] text-foreground/80">
                {activeReissue.message}
              </p>
            )}
            <button
              onClick={simulateReupload}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Upload className="h-3.5 w-3.5" />
              前往補件（模擬完成）
            </button>
          </div>
        )}


        {pendingInvoices.length > 0 && (
          <div className="mt-6 rounded-2xl border-2 border-warning bg-warning-soft/60 p-5 shadow-md">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[oklch(0.55_0.13_75)]" />
              <p className="text-sm font-black text-foreground">待補款項</p>
            </div>
            <div className="mt-3 space-y-2">
              {pendingInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to="/checkin/demo/surcharge/$id"
                  params={{ id: inv.id }}
                  className="block rounded-lg bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground">#{inv.id}</p>
                    <span className="ml-auto rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-[oklch(0.45_0.13_55)]">
                      待付款
                    </span>
                  </div>
                  <ul className="mt-2 space-y-0.5 text-[11px] text-foreground/80 [font-variant-numeric:tabular-nums]">
                    {inv.lines.map((l) => (
                      <li key={l.id}>
                        {l.name} × {l.quantity} · NT$ {l.unitAmount}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-foreground [font-variant-numeric:tabular-nums]">
                    合計 NT$ {surchargeTotal(inv)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {canShowAccessInfo && record && (
          <div
            className="mt-6 rounded-2xl border-2 border-success bg-success-soft/60 p-5 shadow-md"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-sm font-black text-foreground">入住已核准，門鎖密碼已開放</p>
              <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-foreground">
                第 {record.lastVersion} 版
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              更新時間：{new Date(record.lastNotifiedAt).toLocaleString("zh-TW", { hour: "2-digit", minute: "2-digit", month: "2-digit", day: "2-digit" })}
            </p>
            <div className="mt-3 space-y-2">
              {record.snapshot.map((r) => {
                const title = r.displayName || r.roomNumber || "—";
                return (
                  <div key={r.roomId} className="rounded-lg bg-card p-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{title}</p>
                      {r.displayName && r.roomNumber && (
                        <span className="text-[11px] text-muted-foreground">房號 {r.roomNumber}</span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-foreground/80 [font-variant-numeric:tabular-nums]">
                      大門密碼 <span className="font-bold text-foreground">{r.gatePassword || "—"}</span>
                      　·　房門密碼 <span className="font-bold text-foreground">{r.doorPassword || "—"}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}




        <div className="card-soft mt-6 p-5">
          <h2 className="text-sm font-bold text-foreground">接下來的流程</h2>
          <ol className="mt-3 space-y-2.5">
            {nextSteps.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-black text-foreground">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {active.length > 0 && (
          <div className="card-soft mt-4 p-5">
            <h2 className="text-sm font-bold text-foreground">聯絡屋主</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              如有緊急事項可透過以下方式聯繫民宿。
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {active.map((c) => {
                const Icon = channelIcon(c.type);
                return (
                  <a
                    key={c.id}
                    href={channelHref(c)}
                    target={
                      c.type === "email" || c.type === "phone" || c.type === "sms"
                        ? undefined
                        : "_blank"
                    }
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-xs font-bold text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="truncate">{c.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {!isApproved && (
          <div className="mt-4 rounded-2xl bg-warning-soft p-4">
            <div className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.13_75)]" />
              <p className="text-xs leading-relaxed text-foreground/80">
                門鎖密碼將於審核通過後開放，請耐心等候。
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/checkin/demo/home"
            className="rounded-2xl border border-border bg-card px-4 py-3.5 text-center text-sm font-semibold text-foreground"
          >
            回到首頁
          </Link>
          <Link
            to="/checkin/demo/guide"
            className="rounded-2xl bg-primary px-4 py-3.5 text-center text-sm font-bold text-primary-foreground"
          >
            查看入住指引
          </Link>
        </div>
      </div>
    </PhoneShell>
  );
}
