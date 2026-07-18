import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { Input } from "./owner.settings.property";
import { usePropertyConfig, type ExtraFeeItem } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/extra-fees")({
  component: ExtraFeesSettings,
});

function emptyFee(): Omit<ExtraFeeItem, "id"> {
  return { name: "", unit: "每次", defaultAmount: 0, confirmAtCheckin: false };
}

function ExtraFeesSettings() {
  const { extraFeeCatalog, addExtraFee, updateExtraFee, removeExtraFee } =
    usePropertyConfig();
  const [draft, setDraft] = useState(emptyFee());

  return (
    <OwnerCard
      title="額外費用項目"
      desc="業者於「入住申請」補款時，可從此清單選取項目。例如：寵物費、加床、烤肉、訪客費、早餐。"
    >
      <Toaster position="top-center" richColors />
      <div className="mb-5 rounded-lg border border-dashed border-primary bg-primary-soft/30 p-4">
        <p className="mb-3 text-sm font-bold text-foreground">新增費用項目</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="項目名稱" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Input label="單位" placeholder="每晚 / 每次 / 每人" value={draft.unit} onChange={(v) => setDraft({ ...draft, unit: v })} />
          <Input label="預設金額（NT$）" type="number" value={draft.defaultAmount} onChange={(v) => setDraft({ ...draft, defaultAmount: Number(v) || 0 })} />
          <button
            onClick={() => {
              if (!draft.name.trim()) return toast.error("請輸入名稱");
              addExtraFee(draft);
              setDraft(emptyFee());
              toast.success("已新增");
            }}
            className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            新增
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[oklch(0.94_0.02_82)]">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">項目</th>
              <th className="px-3 py-2">單位</th>
              <th className="px-3 py-2 text-right">預設金額</th>
              <th className="px-3 py-2 text-center" title="旅客填寫入住資料時詢問是否需要，選『是』會自動加入押金合計">
                入住時確認
              </th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[oklch(0.94_0.02_82)]">
            {extraFeeCatalog.map((f) => (
              <tr key={f.id} className="bg-card">
                <td className="px-3 py-2">
                  <input
                    value={f.name}
                    onChange={(e) => updateExtraFee(f.id, { name: e.target.value })}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus:border-input focus:bg-card"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={f.unit}
                    onChange={(e) => updateExtraFee(f.id, { unit: e.target.value })}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus:border-input focus:bg-card"
                  />
                </td>
                <td className="px-3 py-2 text-right [font-variant-numeric:tabular-nums]">
                  <input
                    type="number"
                    value={f.defaultAmount}
                    onChange={(e) => updateExtraFee(f.id, { defaultAmount: Number(e.target.value) || 0 })}
                    className="w-24 rounded border border-transparent bg-transparent px-1 py-1 text-right text-sm outline-none focus:border-input focus:bg-card"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={!!f.confirmAtCheckin}
                      onChange={(e) => updateExtraFee(f.id, { confirmAtCheckin: e.target.checked })}
                      className="h-4 w-4 accent-[oklch(0.75_0.14_85)]"
                    />
                    <span className="text-[11px] font-semibold text-foreground">
                      {f.confirmAtCheckin ? "是" : "否"}
                    </span>
                  </label>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => removeExtraFee(f.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {extraFeeCatalog.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  尚無項目
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </OwnerCard>
  );
}
