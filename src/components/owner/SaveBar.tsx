import { Check, Loader2, RotateCcw } from "lucide-react";

export function SaveBar({
  dirty,
  savedAt,
  onSave,
  onReset,
  saving = false,
}: {
  dirty: boolean;
  savedAt: Date | null;
  onSave: () => void;
  onReset: () => void;
  saving?: boolean;
}) {
  const label = savedAt
    ? `已儲存 · ${savedAt.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "尚未儲存";

  return (
    <div
      className={`sticky bottom-3 z-40 mt-6 flex flex-col items-stretch gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur transition sm:flex-row sm:items-center sm:justify-between ${
        dirty
          ? "border-warning bg-warning-soft/95"
          : "border-[oklch(0.92_0.02_80)] bg-card/95"
      }`}
    >
      <div className="flex items-center gap-2 text-xs">
        {saving ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="font-semibold text-foreground">儲存中…</span>
          </>
        ) : dirty ? (
          <>
            <span className="grid h-2 w-2 place-items-center rounded-full bg-warning" />
            <span className="font-semibold text-foreground">有未儲存變更</span>
          </>
        ) : (
          <>
            <Check className="h-3.5 w-3.5 text-success" />
            <span className="font-semibold text-foreground">{label}</span>
          </>
        )}
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        {dirty && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary sm:min-h-0 sm:flex-none sm:py-1.5"
          >
            <RotateCcw className="h-3 w-3" />
            捨棄
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-40 sm:min-h-0 sm:flex-none sm:py-1.5"
        >
          儲存變更
        </button>
      </div>
    </div>
  );
}
