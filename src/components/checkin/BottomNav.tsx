import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, ClipboardList, HelpCircle, KeyRound } from "lucide-react";
import { useCheckinStore } from "@/lib/checkin-store";
import { useLiveSubmissions } from "@/lib/live-submissions";

const items = [
  { to: "/checkin/demo/home", label: "首頁", icon: Home },
  { to: "/checkin/demo/start", label: "入住", icon: ClipboardList, key: "start" },
  { to: "/checkin/demo/faq", label: "FAQ", icon: HelpCircle },
  { to: "/checkin/demo/guide", label: "指引", icon: KeyRound },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const status = useCheckinStore((s) => s.status);
  const liveItems = useLiveSubmissions((s) => s.items);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCurrentId(localStorage.getItem("walnut-live-current-id"));
    } catch {
      /* ignore */
    }
  }, []);

  const currentLive = currentId ? liveItems.find((x) => x.id === currentId) : null;
  const liveActive =
    !!currentLive &&
    !currentLive.removedAt &&
    currentLive.status !== ("removed" as typeof currentLive.status) &&
    currentLive.status !== ("cancelled" as typeof currentLive.status);
  const hasActiveSubmission =
    status !== "draft" && (!currentId || liveActive);

  const startTarget = hasActiveSubmission ? "/checkin/demo/submitted" : "/checkin/demo/start";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur"
      style={{ boxShadow: "var(--shadow-nav)" }}
    >
      <ul className="grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map(({ to, label, icon: Icon, ...rest }) => {
          const isStart = "key" in rest && rest.key === "start";
          const target = isStart ? startTarget : to;
          const active = pathname === target || (isStart && pathname === to);
          const cls =
            "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors";
          const iconEl = (
            <Icon
              className={
                active ? "h-5 w-5 text-foreground" : "h-5 w-5 text-muted-foreground"
              }
              strokeWidth={active ? 2.4 : 1.8}
            />
          );
          const labelEl = (
            <span
              className={
                active
                  ? "text-[11px] font-semibold text-foreground"
                  : "text-[11px] text-muted-foreground"
              }
            >
              {label}
            </span>
          );
          return (
            <li key={to} className="flex justify-center">
              {isStart ? (
                <button
                  type="button"
                  onClick={() => navigate({ to: startTarget })}
                  className={cls}
                >
                  {iconEl}
                  {labelEl}
                </button>
              ) : (
                <Link to={to} className={cls}>
                  {iconEl}
                  {labelEl}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
