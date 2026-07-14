import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { PrimaryButton } from "@/components/checkin/Fields";
import { useCheckinStore } from "@/lib/checkin-store";
import { faqItems } from "@/lib/checkin-content";

export const Route = createFileRoute("/checkin/demo/faq")({
  component: FaqPage,
  head: () => ({ meta: [{ title: "常見問題 · 胡桃民宿" }] }),
});

function FaqPage() {
  const nav = useNavigate();
  const [open, setOpen] = useState<number | null>(0);
  const markRead = useCheckinStore((s) => s.update);

  useEffect(() => {
    markRead({ faqRead: true });
  }, [markRead]);

  return (
    <PhoneShell title="常見問題" backTo="/checkin/demo/deposit">
      <div className="mb-3">
        <h2 className="text-xl font-black text-foreground">常見問題</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          入住前可能會遇到的問題，都幫您整理好了。
        </p>
      </div>

      <ul className="space-y-2.5">
        {faqItems.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q} className="card-soft overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-black text-foreground">
                  Q
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold text-foreground">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-border bg-secondary/50 px-4 py-3">
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {item.a}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <PrimaryButton onClick={() => nav({ to: "/checkin/demo/house-rules" })}>
          下一步：閱讀入住須知
        </PrimaryButton>
      </div>
    </PhoneShell>
  );
}
