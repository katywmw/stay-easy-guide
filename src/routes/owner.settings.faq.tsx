import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { SaveBar } from "@/components/owner/SaveBar";
import { Input } from "./owner.settings.property";
import { usePropertyConfig, type FaqEntry } from "@/lib/property-config";
import { faqItems } from "@/lib/checkin-content";
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
  const { faq, addFaq, updateFaq, removeFaq, update } = usePropertyConfig();

  // Seed system defaults automatically if the list is empty.
  useEffect(() => {
    if (faq.length === 0) {
      const seeded = faqItems.map((f, i) => ({
        id: `seed-${Date.now()}-${i}`,
        category: f.category,
        q: f.q,
        a: f.a,
      }));
      update({ faq: seeded });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [addDraft, setAddDraft] = useState(emptyFaq());
  const [draft, setDraft] = useState<FaqEntry[]>(faq);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setDraft(faq);
  }, [faq.map((f) => f.id).join(",")]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(faq);
  const patch = (id: string, p: Partial<FaqEntry>) =>
    setDraft((d) => d.map((f) => (f.id === id ? { ...f, ...p } : f)));

  const save = () => {
    draft.forEach((f) => {
      const orig = faq.find((o) => o.id === f.id);
      if (!orig) return;
      const changes: Partial<FaqEntry> = {};
      (Object.keys(f) as (keyof FaqEntry)[]).forEach((k) => {
        if (f[k] !== orig[k]) (changes as any)[k] = f[k];
      });
      if (Object.keys(changes).length) updateFaq(f.id, changes);
    });
    setSavedAt(new Date());
    toast.success("已儲存 FAQ");
  };
  const reset = () => setDraft(faq);

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <OwnerCard
        title="常見問答編輯器"
        desc="旅客的證件、押金、入住等頁面會顯示這些問答。系統預設題庫會自動載入，可自由編輯或刪除。編輯後請按下方「儲存變更」。"
      >
        <div className="mb-5 rounded-lg border border-dashed border-primary bg-primary-soft/30 p-4">
          <p className="mb-3 text-sm font-bold text-foreground">新增問答</p>
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-foreground">分類</span>
                <select
                  value={addDraft.category}
                  onChange={(e) => setAddDraft({ ...addDraft, category: e.target.value as FaqEntry["category"] })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                >
                  {(Object.keys(categoryLabels) as FaqEntry["category"][]).map((k) => (
                    <option key={k} value={k}>{categoryLabels[k]}</option>
                  ))}
                </select>
              </label>
              <Input label="問題" value={addDraft.q} onChange={(v) => setAddDraft({ ...addDraft, q: v })} />
            </div>
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-foreground">答案</span>
              <textarea
                rows={3}
                value={addDraft.a}
                onChange={(e) => setAddDraft({ ...addDraft, a: e.target.value })}
                className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm"
              />
            </label>
            <div>
              <button
                onClick={() => {
                  if (!addDraft.q.trim() || !addDraft.a.trim()) return toast.error("請填寫問題與答案");
                  addFaq(addDraft);
                  setAddDraft(emptyFaq());
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
          {draft.map((f) => (
            <div key={f.id} className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <select
                  value={f.category}
                  onChange={(e) => patch(f.id, { category: e.target.value as FaqEntry["category"] })}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground outline-none"
                >
                  {(Object.keys(categoryLabels) as FaqEntry["category"][]).map((k) => (
                    <option key={k} value={k}>{categoryLabels[k]}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (confirm("刪除此問答？")) {
                      removeFaq(f.id);
                      toast.success("已刪除");
                    }
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive-soft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Input label="問題" value={f.q} onChange={(v) => patch(f.id, { q: v })} />
              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-foreground">答案</span>
                <textarea
                  rows={2}
                  value={f.a}
                  onChange={(e) => patch(f.id, { a: e.target.value })}
                  className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm"
                />
              </label>
            </div>
          ))}
          {draft.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
              尚未新增自訂 FAQ，將顯示系統預設題庫。
            </p>
          )}
        </div>
      </OwnerCard>
      <SaveBar dirty={dirty} savedAt={savedAt} onSave={save} onReset={reset} />
    </div>
  );
}
