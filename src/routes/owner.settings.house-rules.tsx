import { createFileRoute } from "@tanstack/react-router";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { CopyFromPropertyButton } from "@/components/owner/CopyFromPropertyButton";
import { SaveBar } from "@/components/owner/SaveBar";
import { RichTextEditor } from "@/components/owner/RichTextEditor";
import { useDirtyForm } from "@/hooks/useDirtyForm";
import { usePropertyConfig } from "@/lib/property-config";
import { houseRulesText } from "@/lib/checkin-content";
import { looksLikeHtml } from "@/lib/sanitize-html";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/house-rules")({
  component: HouseRulesSettings,
});

/** If the stored value is plain-text / markdown, convert it to simple HTML so
 *  the rich-text editor can display it. Users can then reformat via the toolbar. */
function toEditorHtml(v: string): string {
  if (!v) return "";
  if (looksLikeHtml(v)) return v;
  // Convert simple markdown-ish content: # H1, ## H2, `n.` ordered list, blank → paragraph
  const lines = v.split("\n");
  const out: string[] = [];
  let ol: string[] = [];
  const flushOl = () => {
    if (ol.length) {
      out.push("<ol>" + ol.map((li) => `<li>${escape(li)}</li>`).join("") + "</ol>");
      ol = [];
    }
  };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) {
      flushOl();
      continue;
    }
    if (l.startsWith("# ")) {
      flushOl();
      out.push(`<h1>${escape(l.slice(2))}</h1>`);
      continue;
    }
    if (l.startsWith("## ")) {
      flushOl();
      out.push(`<h2>${escape(l.slice(3))}</h2>`);
      continue;
    }
    const m = l.match(/^\d+\.\s+(.*)$/);
    if (m) {
      ol.push(m[1]);
      continue;
    }
    flushOl();
    out.push(`<p>${escape(l)}</p>`);
  }
  flushOl();
  return out.join("");
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function HouseRulesSettings() {
  const { houseRules, update } = usePropertyConfig();
  const initial = toEditorHtml(houseRules || houseRulesText);
  const { draft, set, dirty, savedAt, markSaved, reset } = useDirtyForm(initial);

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
        desc="旅客於「入住須知」步驟閱讀的內容。可設定標題大小、粗體、底線、清單與連結。每館獨立設定。"
        actions={
          <div className="flex items-center gap-2">
            <CopyFromPropertyButton kinds={["houseRules"]} />
            <button
              onClick={() => {
                set(toEditorHtml(houseRulesText));
                toast.success("已載入預設模板，別忘了儲存");
              }}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              載入預設
            </button>
          </div>
        }
      >
        <RichTextEditor value={draft} onChange={set} placeholder="輸入入住須知內容…" />
      </OwnerCard>
      <SaveBar dirty={dirty} savedAt={savedAt} onSave={save} onReset={reset} />
    </div>
  );
}
