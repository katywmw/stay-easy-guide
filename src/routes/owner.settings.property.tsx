import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { usePropertyConfig, type Property } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/property")({
  component: PropertySettings,
});

function emptyProperty(): Omit<Property, "id"> {
  return {
    name: "",
    address: "",
    phone: "",
    email: "",
    checkInTime: "15:00",
    checkOutTime: "11:00",
  };
}

function PropertySettings() {
  const {
    properties,
    currentPropertyId,
    addProperty,
    updateProperty,
    removeProperty,
    update,
  } = usePropertyConfig();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyProperty());

  return (
    <div className="space-y-5">
      <Toaster position="top-center" richColors />
      <OwnerCard
        title="館別管理"
        desc="適合多館別業者，例如安平九號、胡桃等。每館獨立房間、押金與付款設定。"
        actions={
          <button
            onClick={() => setAdding((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            新增館別
          </button>
        }
      >
        {adding && (
          <div className="mb-5 rounded-lg border border-dashed border-primary bg-primary-soft/40 p-4">
            <p className="mb-3 text-sm font-bold text-foreground">新增館別</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="民宿名稱" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Input label="聯絡電話" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
              <Input label="地址" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} full />
              <Input label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
              <Input label="入住時間" value={draft.checkInTime} onChange={(v) => setDraft({ ...draft, checkInTime: v })} />
              <Input label="退房時間" value={draft.checkOutTime} onChange={(v) => setDraft({ ...draft, checkOutTime: v })} />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (!draft.name.trim()) return toast.error("請輸入民宿名稱");
                  addProperty(draft);
                  setDraft(emptyProperty());
                  setAdding(false);
                  toast.success("已新增");
                }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                儲存
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setDraft(emptyProperty());
                }}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {properties.map((p) => (
            <div
              key={p.id}
              className={`rounded-lg border p-4 ${
                p.id === currentPropertyId
                  ? "border-primary bg-primary-soft/30"
                  : "border-[oklch(0.94_0.02_82)] bg-secondary/30"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <input
                    type="radio"
                    checked={p.id === currentPropertyId}
                    onChange={() => update({ currentPropertyId: p.id })}
                    className="h-4 w-4 accent-[oklch(0.75_0.14_85)]"
                  />
                  設為目前操作館別
                </label>
                {properties.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`刪除「${p.name}」？`)) {
                        removeProperty(p.id);
                        toast.success("已刪除");
                      }
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="民宿名稱" value={p.name} onChange={(v) => updateProperty(p.id, { name: v })} />
                <Input label="聯絡電話" value={p.phone} onChange={(v) => updateProperty(p.id, { phone: v })} />
                <Input label="地址" full value={p.address} onChange={(v) => updateProperty(p.id, { address: v })} />
                <Input label="Email" value={p.email} onChange={(v) => updateProperty(p.id, { email: v })} />
                <Input label="入住時間" value={p.checkInTime} onChange={(v) => updateProperty(p.id, { checkInTime: v })} />
                <Input label="退房時間" value={p.checkOutTime} onChange={(v) => updateProperty(p.id, { checkOutTime: v })} />
              </div>
            </div>
          ))}
        </div>
      </OwnerCard>
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  full,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  full?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className={`block text-xs ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-semibold text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
