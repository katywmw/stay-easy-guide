import { createFileRoute } from "@tanstack/react-router";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { usePropertyConfig } from "@/lib/property-config";
import { houseRulesText } from "@/lib/checkin-content";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/house-rules")({
  component: HouseRulesSettings,
});

function HouseRulesSettings() {
  const { houseRules, update } = usePropertyConfig();
  const value = houseRules || houseRulesText;

  return (
    <OwnerCard
      title="入住須知編輯器"
      desc="旅客於「入住須知」步驟閱讀的內容。支援 Markdown 標題（# / ##）與清單。"
      actions={
        <button
          onClick={() => {
            update({ houseRules: houseRulesText });
            toast.success("已還原為預設模板");
          }}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          還原預設
        </button>
      }
    >
      <Toaster position="top-center" richColors />
      <textarea
        value={value}
        onChange={(e) => update({ houseRules: e.target.value })}
        rows={20}
        className="w-full resize-y rounded-lg border border-input bg-card px-4 py-3 font-mono text-xs leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
      <button
        onClick={() => toast.success("已儲存")}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
      >
        儲存
      </button>
    </OwnerCard>
  );
}
