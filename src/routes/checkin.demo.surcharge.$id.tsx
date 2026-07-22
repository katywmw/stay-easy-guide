import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Wallet, Send, Clock } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { useSurchargeStore, surchargeTotal } from "@/lib/surcharge-store";
import { usePropertyConfig } from "@/lib/property-config";
import { StatusPill } from "@/components/checkin/StatusPill";

export const Route = createFileRoute("/checkin/demo/surcharge/$id")({
  component: SurchargePage,
  head: () => ({ meta: [{ title: "補款通知 · 胡桃民宿" }] }),
});

function SurchargePage() {
  const { id } = Route.useParams();
  const inv = useSurchargeStore((s) => s.invoices.find((x) => x.id === id));
  const markReported = useSurchargeStore((s) => s.markReported);
  const { payment } = usePropertyConfig();
  const [guestNote, setGuestNote] = useState("");

  if (!inv) {
    throw notFound();
  }

  const total = surchargeTotal(inv);
  const paid = inv.status === "paid";
  const reported = inv.status === "reported";
  const cancelled = inv.status === "cancelled";
  const pending = inv.status === "pending";

  const statusLabel = paid
    ? "已付款"
    : reported
      ? "已通知民宿，等待確認"
      : cancelled
        ? "已取消"
        : "待付款";
  const statusTone: "success" | "warning" | "muted" = paid
    ? "success"
    : reported
      ? "muted"
      : cancelled
        ? "muted"
        : "warning";

  return (
    <PhoneShell title="補款通知" subtitle="額外費用" backTo="/checkin/demo/home">
      <div className="card-soft mt-4 p-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[oklch(0.55_0.13_75)]" />
          <p className="text-base font-bold text-foreground">
            {inv.guestName} 您好
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          民宿為您新增以下額外費用，請完成付款後聯繫民宿。
        </p>
        <div className="mt-3">
          <StatusPill label={statusLabel} tone={statusTone} />
        </div>
        {reported && inv.reportedAt && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            通知時間：
            {new Date(inv.reportedAt).toLocaleString("zh-TW", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        {reported && inv.guestNote && (
          <p className="mt-2 rounded-lg bg-secondary/60 p-2 text-[11px] text-foreground/80 whitespace-pre-wrap">
            您的備註：{inv.guestNote}
          </p>
        )}
      </div>

      <div className="card-soft mt-4 overflow-hidden">
        <div className="border-b border-border px-4 py-3 text-sm font-bold text-foreground">
          費用明細
        </div>
        <ul className="divide-y divide-[oklch(0.94_0.02_82)]">
          {inv.lines.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{l.name}</p>
                <p className="text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
                  {l.unit} · {l.quantity} × NT$ {l.unitAmount.toLocaleString()}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground [font-variant-numeric:tabular-nums]">
                NT$ {(l.unitAmount * l.quantity).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border bg-primary-soft/40 px-4 py-3">
          <span className="text-xs font-semibold text-foreground/70">合計</span>
          <span className="text-2xl font-black text-foreground [font-variant-numeric:tabular-nums]">
            NT$ {total.toLocaleString()}
          </span>
        </div>
      </div>

      {inv.note && (
        <div className="mt-4 rounded-2xl bg-secondary/60 p-3 text-xs leading-relaxed text-foreground/80">
          <p className="font-bold">備註</p>
          <p className="mt-1 whitespace-pre-wrap">{inv.note}</p>
        </div>
      )}

      {pending && (
        <>
          <div className="card-soft mt-4 p-4">
            <p className="text-sm font-bold text-foreground">LINE Pay</p>
            {payment.linePayQrDataUrl ? (
              <div className="mt-2 flex flex-col items-center gap-2">
                <img
                  src={payment.linePayQrDataUrl}
                  alt="LINE Pay QR"
                  className="h-40 w-40 rounded-lg border border-border bg-card object-contain p-2"
                />
                <p className="text-xs text-muted-foreground">請以 LINE Pay 掃描付款</p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">業者尚未提供 QR，請改用匯款。</p>
            )}
          </div>

          <div className="card-soft mt-4 p-4">
            <p className="text-sm font-bold text-foreground">銀行匯款</p>
            <ul className="mt-2 space-y-1 text-xs text-foreground/80 [font-variant-numeric:tabular-nums]">
              <li>{payment.bankName}（{payment.bankCode}）</li>
              <li>帳號：{payment.accountNumber}</li>
              <li>戶名：{payment.accountName}</li>
            </ul>
            {payment.notes && (
              <p className="mt-2 text-[11px] text-muted-foreground">{payment.notes}</p>
            )}
          </div>

          <div className="card-soft mt-4 p-4">
            <label className="text-sm font-bold text-foreground">
              備註給民宿（選填）
            </label>
            <textarea
              value={guestNote}
              onChange={(e) => setGuestNote(e.target.value)}
              rows={2}
              placeholder="例如：末五碼 12345、已使用 LINE Pay 轉帳"
              className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            />
            <button
              type="button"
              onClick={() => markReported(inv.id, guestNote.trim() || undefined)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              <Send className="h-4 w-4" />
              我已完成付款，通知民宿
            </button>
          </div>
        </>
      )}

      {reported && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-secondary/60 p-4">
          <Clock className="mt-0.5 h-5 w-5 text-[oklch(0.55_0.08_60)]" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">已通知民宿，等待確認</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              民宿確認收款後，此筆補款將標記為已付款。
            </p>
          </div>
        </div>
      )}

      {paid && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-success-soft p-4">
          <CheckCircle2 className="h-6 w-6 text-success" />
          <p className="text-sm font-bold text-success">此筆補款已完成</p>
        </div>
      )}

      {cancelled && (
        <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-sm font-bold text-foreground">此補款單已取消</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            如有疑問請直接聯繫民宿。
          </p>
        </div>
      )}

      <div className="mt-6">
        <Link
          to="/checkin/demo/home"
          className="block w-full rounded-2xl border border-border bg-card px-6 py-4 text-center text-sm font-semibold text-foreground"
        >
          回入住首頁
        </Link>
      </div>
    </PhoneShell>
  );
}
