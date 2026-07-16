import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { Input } from "./owner.settings.property";
import { usePropertyConfig, type FaqEntry } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/faq")({
  component: FaqSettings,
});

const categoryLabels: Record<FaqEntry["category"], string> = {
  general: "一般",
  id: "證件",
  deposit: "押金",
};

function emptyFaq(): Omit<FaqEntry, "id"> {
  return { category: "general", q: "", a: "" };
}

function FaqSettings() {
  const { faq, addFaq, updateFaq, removeFaq } = usePropertyConfig();
  const [draft, setDraft] = useState(emptyFaq());

  return (
    <OwnerCard
      title="常見問答編輯器"
      desc="於此新增問答，將顯示於旅客的證件、押金、入住等頁面。留白則使用系統預設題庫。"
    >
      <Toaster position="top-center" richColors />
      <div className="mb-5 rounded-lg border border-dashed border-primary bg-primary-soft/30 p-4">
        <p className="mb-3 text-sm font-bold text-foreground">新增問答</p>
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-foreground">分類</span>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as FaqEntry["category"] })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
              >
                {(Object.keys(categoryLabels) as FaqEntry["category"][]).map((k) => (
                  <option key={k} value={k}>{categoryLabels[k]}</option>
                ))}
              </select>
            </label>
            <Input label="問題" value={draft.q} onChange={(v) => setDraft({ ...draft, q: v })} />
          </div>
          <label className="block text-xs">
            <span className="mb-1 block font-semibold text-foreground">答案</span>
            <textarea
              rows={3}
              value={draft.a}
              onChange={(e) => setDraft({ ...draft, a: e.target.value })}
              className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
          <div>
            <button
              onClick={() => {
                if (!draft.q.trim() || !draft.a.trim()) return toast.error("請填寫問題與答案");
                addFaq(draft);
                setDraft(emptyFaq());
                toast.success("已新增");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              新增
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {faq.map((f) => (
          <div key={f.id} className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {categoryLabels[f.category]}
              </span>
              <button
                onClick={() => removeFaq(f.id)}
                className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive-soft"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input label="問題" value={f.q} onChange={(v) => updateFaq(f.id, { q: v })} />
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-foreground">答案</span>
              <textarea
                rows={2}
                value={f.a}
                onChange={(e) => updateFaq(f.id, { a: e.target.value })}
                className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm"
              />
            </label>
          </div>
        ))}
        {faq.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            尚未新增自訂 FAQ，將顯示系統預設題庫。
          </p>
        )}
      </div>
    </OwnerCard>
  );
}
