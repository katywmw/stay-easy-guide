import { createFileRoute } from "@tanstack/react-router";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { usePropertyConfig } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/guide")({
  component: GuideSettings,
});

const fields: { key: keyof ReturnType<typeof usePropertyConfig.getState>["guide"]; label: string; hint?: string }[] = [
  { key: "address", label: "地址", hint: "旅客可直接複製導航。" },
  { key: "parking", label: "停車資訊" },
  { key: "gate", label: "大門說明" },
  { key: "door", label: "房門說明" },
  { key: "notes", label: "注意事項" },
  { key: "emergency", label: "緊急聯絡" },
];

function GuideSettings() {
  const { guide, update } = usePropertyConfig();

  return (
    <OwnerCard title="入住指引模板" desc="審核通過後旅客可看到的內容。">
      <Toaster position="top-center" richColors />
      <div className="space-y-4">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-sm font-semibold text-foreground">{f.label}</span>
            <textarea
              rows={3}
              value={guide[f.key]}
              onChange={(e) => update({ guide: { ...guide, [f.key]: e.target.value } })}
              className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
          </label>
        ))}
      </div>
      <button
        onClick={() => toast.success("已儲存")}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
      >
        儲存
      </button>
    </OwnerCard>
  );
}
