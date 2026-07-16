import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { Input } from "./owner.settings.property";
import { usePropertyConfig } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/payments")({
  component: PaymentSettings,
});

function PaymentSettings() {
  const { payment, update } = usePropertyConfig();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () =>
      update({ payment: { ...payment, linePayQrDataUrl: String(reader.result) } });
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      <Toaster position="top-center" richColors />
      <OwnerCard title="銀行匯款資訊" desc="旅客選擇匯款時會看到此帳戶。">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="銀行名稱" value={payment.bankName} onChange={(v) => update({ payment: { ...payment, bankName: v } })} />
          <Input label="銀行代碼" value={payment.bankCode} onChange={(v) => update({ payment: { ...payment, bankCode: v } })} />
          <Input label="戶名" value={payment.accountName} onChange={(v) => update({ payment: { ...payment, accountName: v } })} />
          <Input label="帳號" value={payment.accountNumber} onChange={(v) => update({ payment: { ...payment, accountNumber: v } })} />
          <Input label="備註 / 說明" full value={payment.notes} onChange={(v) => update({ payment: { ...payment, notes: v } })} />
        </div>
      </OwnerCard>

      <OwnerCard title="LINE Pay 收款 QR" desc="上傳後旅客選擇 LINE Pay 付款時會看到此 QR。">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <div className="flex items-start gap-4">
          {payment.linePayQrDataUrl ? (
            <img
              src={payment.linePayQrDataUrl}
              alt="LINE Pay QR"
              className="h-32 w-32 rounded-lg border border-border bg-card object-contain p-2"
            />
          ) : (
            <div className="grid h-32 w-32 place-items-center rounded-lg border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground">
              尚未上傳
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              {payment.linePayQrDataUrl ? "更換 QR" : "上傳 QR"}
            </button>
            {payment.linePayQrDataUrl && (
              <button
                type="button"
                onClick={() => {
                  update({ payment: { ...payment, linePayQrDataUrl: null } });
                  toast.success("已移除");
                }}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
              >
                移除
              </button>
            )}
          </div>
        </div>
      </OwnerCard>
    </div>
  );
}
