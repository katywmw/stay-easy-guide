import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { CopyFromPropertyButton } from "@/components/owner/CopyFromPropertyButton";
import { SaveBar } from "@/components/owner/SaveBar";
import { useDirtyForm } from "@/hooks/useDirtyForm";
import { Input } from "./owner.settings.property";
import { usePropertyConfig, type PaymentInfo } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/payments")({
  component: PaymentSettings,
});

function PaymentSettings() {
  const { payment, update } = usePropertyConfig();
  const { draft, patch, set, dirty, savedAt, markSaved, reset } =
    useDirtyForm<PaymentInfo>(payment);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const save = () => {
    update({ payment: draft });
    markSaved();
    toast.success("已儲存");
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => patch({ linePayQrDataUrl: String(reader.result) });
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />

      <OwnerCard
        title="銀行匯款資訊"
        desc="旅客選擇匯款時會看到此帳戶。每館獨立設定。"
        actions={<CopyFromPropertyButton kinds={["payment"]} />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="銀行名稱" value={draft.bankName} onChange={(v) => patch({ bankName: v })} />
          <Input label="銀行代碼" value={draft.bankCode} onChange={(v) => patch({ bankCode: v })} />
          <Input label="戶名" value={draft.accountName} onChange={(v) => patch({ accountName: v })} />
          <Input label="帳號" value={draft.accountNumber} onChange={(v) => patch({ accountNumber: v })} />
          <Input label="備註 / 說明" full value={draft.notes} onChange={(v) => patch({ notes: v })} />
        </div>
      </OwnerCard>

      <OwnerCard title="LINE Pay 收款 QR" desc="上傳後旅客選擇 LINE Pay 付款時會看到此 QR。">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <div className="flex items-start gap-4">
          {draft.linePayQrDataUrl ? (
            <img
              src={draft.linePayQrDataUrl}
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
              {draft.linePayQrDataUrl ? "更換 QR" : "上傳 QR"}
            </button>
            {draft.linePayQrDataUrl && (
              <button
                type="button"
                onClick={() => patch({ linePayQrDataUrl: null })}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
              >
                移除
              </button>
            )}
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              儲存後才會套用。變更 QR 也需點下方「儲存」。
            </p>
          </div>
        </div>
      </OwnerCard>

      <SaveBar
        dirty={dirty || JSON.stringify(draft) !== JSON.stringify(payment)}
        savedAt={savedAt}
        onSave={save}
        onReset={() => {
          reset();
          set(payment);
        }}
      />
    </div>
  );
}
