import { createFileRoute } from "@tanstack/react-router";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { usePropertyConfig, type DepositMode } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/deposit")({
  component: DepositSettings,
});

const modeOptions: { v: DepositMode; label: string; desc: string }[] = [
  { v: "none", label: "無押金", desc: "所有訂單不收押金，旅客可直接跳過押金頁。" },
  { v: "fixed", label: "固定押金", desc: "所有訂單皆收相同金額。" },
  { v: "perRoom", label: "按房型計算", desc: "每間房獨立押金；一房 $1000 / 整棟 $6000。" },
];

function DepositSettings() {
  const s = usePropertyConfig();
  return (
    <OwnerCard
      title="押金規則"
      desc="押金金額 = 0 時，旅客端會自動跳過押金流程。"
    >
      <Toaster position="top-center" richColors />
      <div className="space-y-3">
        {modeOptions.map((o) => (
          <label
            key={o.v}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
              s.depositMode === o.v
                ? "border-primary bg-primary-soft/40"
                : "border-[oklch(0.94_0.02_82)] hover:bg-secondary/40"
            }`}
          >
            <input
              type="radio"
              checked={s.depositMode === o.v}
              onChange={() => s.update({ depositMode: o.v })}
              className="mt-0.5 h-4 w-4 accent-[oklch(0.75_0.14_85)]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{o.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{o.desc}</p>
              {o.v === "fixed" && s.depositMode === "fixed" && (
                <div className="mt-3">
                  <label className="text-xs font-semibold text-foreground">
                    固定押金金額（NT$）
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={s.fixedDepositAmount}
                    onChange={(e) =>
                      s.update({ fixedDepositAmount: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}
              {o.v === "perRoom" && s.depositMode === "perRoom" && (
                <p className="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground">
                  按房型金額在「房間 / 單位」頁面編輯，旅客選幾間就自動加總。
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={() => toast.success("已儲存")}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
      >
        儲存設定
      </button>
    </OwnerCard>
  );
}
