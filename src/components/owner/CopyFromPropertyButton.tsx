import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { usePropertyConfig } from "@/lib/property-config";

type Kind = "payment" | "houseRules" | "guide" | "contact";

export function CopyFromPropertyButton({
  kinds,
  label = "從其他館別複製",
}: {
  kinds: Kind[];
  label?: string;
}) {
  const { properties, currentPropertyId, copyFromProperty } = usePropertyConfig();
  const [open, setOpen] = useState(false);
  const others = properties.filter((p) => p.id !== currentPropertyId);
  if (others.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
      >
        <Copy className="h-3.5 w-3.5" />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <p className="border-b border-border bg-secondary/50 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
            從哪一個館別複製？
          </p>
          {others.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                if (!confirm(`從「${p.name}」複製並覆寫本館目前的設定？`)) return;
                copyFromProperty(p.id, currentPropertyId, kinds);
                toast.success(`已從 ${p.name} 複製`);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
