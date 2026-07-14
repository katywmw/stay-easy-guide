import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, HelpCircle, KeyRound } from "lucide-react";

const items = [
  { to: "/checkin/demo/home", label: "首頁", icon: Home },
  { to: "/checkin/demo/start", label: "入住", icon: ClipboardList },
  { to: "/checkin/demo/faq", label: "FAQ", icon: HelpCircle },
  { to: "/checkin/demo/guide", label: "指引", icon: KeyRound },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur"
      style={{ boxShadow: "var(--shadow-nav)" }}
    >
      <ul className="grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="flex justify-center">
              <Link
                to={to}
                className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors"
              >
                <Icon
                  className={
                    active
                      ? "h-5 w-5 text-foreground"
                      : "h-5 w-5 text-muted-foreground"
                  }
                  strokeWidth={active ? 2.4 : 1.8}
                />
                <span
                  className={
                    active
                      ? "text-[11px] font-semibold text-foreground"
                      : "text-[11px] text-muted-foreground"
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
