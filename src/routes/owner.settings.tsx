import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { OwnerShell } from "@/components/owner/OwnerShell";
import {
  Building2,
  DoorOpen,
  ScrollText,
  Wallet,
  Coins,
  Plus,
  MapPin,
  KeyRound,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/owner/settings")({
  component: SettingsLayout,
  head: () => ({ meta: [{ title: "民宿設定 · 胡桃民宿" }] }),
});

const items = [
  { to: "/owner/settings/property", label: "民宿資料 / 館別", icon: Building2 },
  { to: "/owner/settings/rooms", label: "房間 / 單位", icon: DoorOpen },
  { to: "/owner/settings/house-rules", label: "入住須知", icon: ScrollText },
  { to: "/owner/settings/deposit", label: "押金規則", icon: Coins },
  { to: "/owner/settings/payments", label: "付款方式", icon: Wallet },
  { to: "/owner/settings/extra-fees", label: "額外費用項目", icon: Plus },
  { to: "/owner/settings/guide", label: "入住指引模板", icon: MapPin },
  { to: "/owner/settings/passwords", label: "密碼模板", icon: KeyRound },
  { to: "/owner/settings/faq", label: "常見問答", icon: HelpCircle },
] as const;

function SettingsLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <OwnerShell title="民宿設定" subtitle="Settings">
      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="rounded-xl border border-[oklch(0.92_0.02_80)] bg-card p-2 lg:sticky lg:top-20 lg:self-start">
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition lg:text-sm ${
                    active
                      ? "bg-primary-soft text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                  <span className="whitespace-nowrap lg:whitespace-normal">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </OwnerShell>
  );
}
