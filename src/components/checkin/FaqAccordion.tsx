import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faqItems, type FaqCategory } from "@/lib/checkin-content";

interface FaqAccordionProps {
  category: FaqCategory;
  title?: string;
}

export function FaqAccordion({ category, title = "常見問題" }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);
  const items = faqItems.filter((f) => f.category === category);
  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-[oklch(0.55_0.15_72)]" strokeWidth={2.4} />
        <h3 className="text-sm font-black text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <li
              key={item.q}
              className="overflow-hidden rounded-2xl border border-[oklch(0.92_0.04_88)] bg-card"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[10px] font-black text-foreground">
                  Q
                </span>
                <span className="min-w-0 flex-1 text-xs font-bold text-foreground">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-border/60 bg-secondary/40 px-4 py-3">
                  <p className="text-xs leading-relaxed text-foreground/85">
                    {item.a}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
