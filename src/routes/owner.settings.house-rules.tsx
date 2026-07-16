import { createFileRoute } from "@tanstack/react-router";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { CopyFromPropertyButton } from "@/components/owner/CopyFromPropertyButton";
import { SaveBar } from "@/components/owner/SaveBar";
import { useDirtyForm } from "@/hooks/useDirtyForm";
import { usePropertyConfig } from "@/lib/property-config";
import { houseRulesText } from "@/lib/checkin-content";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/house-rules")({
  component: HouseRulesSettings,
});

function HouseRulesSettings() {
  const { houseRules, update } = usePropertyConfig();
  const { draft, set, dirty, savedAt, markSaved, reset } = useDirtyForm(houseRules);

  const value = draft || houseRulesText;

  const save = () => {
    update({ houseRules: draft });
    markSaved();
    toast.success("已儲存");
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />
      <OwnerCard
        title="入住須知編輯器"
        desc="旅客於「入住須知」步驟閱讀的內容。支援 Markdown 標題（# / ##）與清單。每館獨立設定。"
        actions={
          <div className="flex items-center gap-2">
            <CopyFromPropertyButton kinds={["houseRules"]} />
            <button
              onClick={() => {
                set(houseRulesText);
                toast.success("已載入預設模板，別忘了儲存");
              }}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              載入預設
            </button>
          </div>
        }
      >
        <textarea
          value={value}
          onChange={(e) => set(e.target.value)}
          rows={20}
          className="w-full resize-y rounded-lg border border-input bg-card px-4 py-3 font-mono text-xs leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </OwnerCard>
      <SaveBar dirty={dirty} savedAt={savedAt} onSave={save} onReset={reset} />
    </div>
  );
}
