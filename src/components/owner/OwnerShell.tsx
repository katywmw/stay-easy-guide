import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  LogOut,
  Building2,
  Receipt,
  Menu,
  X,
  Check,
  KeyRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useOwnerAuth } from "@/lib/owner-auth";
import { usePropertyConfig } from "@/lib/property-config";

const navItems = [
  { to: "/owner/dashboard", label: "儀表板", icon: LayoutDashboard },
  { to: "/owner/submissions", label: "入住申請", icon: ClipboardList },
  { to: "/owner/settings/passwords", label: "密碼設定", icon: KeyRound },
  { to: "/owner/settings/property", label: "民宿設定", icon: Settings, matchPrefix: "/owner/settings" },
] as const;

export function OwnerShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const nav = useNavigate();
  const { loggedIn, logout } = useOwnerAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loggedIn) nav({ to: "/owner/login" });
  }, [loggedIn, nav]);

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.024_86)]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[oklch(0.90_0.02_80)] bg-card px-4 py-2.5 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm font-bold text-foreground">胡桃民宿 · 後台</p>
        <div className="w-9" />
      </div>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[oklch(0.90_0.02_80)] bg-[oklch(0.955_0.024_86)] lg:block">
          <SidebarContent pathname={pathname} onLogout={() => { logout(); nav({ to: "/owner/login" }); }} />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-bold text-foreground">選單</p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent
                pathname={pathname}
                onLogout={() => { logout(); nav({ to: "/owner/login" }); }}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 hidden items-center justify-between gap-4 border-b border-[oklch(0.90_0.02_80)] bg-card/95 px-6 py-2.5 backdrop-blur lg:flex">
            <div className="min-w-0">
              {subtitle && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {subtitle}
                </p>
              )}
              <h1 className="truncate text-base font-black tracking-tight text-foreground">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/owner/settings/passwords"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary-soft/60 px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-primary-soft"
                title="密碼設定"
              >
                <KeyRound className="h-3 w-3" />
                密碼
              </Link>
              <PropertySwitcher />
              {right}
            </div>
          </header>

          <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:py-5">
            <div className="mb-3 lg:hidden">
              {subtitle && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {subtitle}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <h1 className="truncate text-lg font-black tracking-tight text-foreground">
                  {title}
                </h1>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PropertySwitcher />
                <Link
                  to="/owner/settings/passwords"
                  className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary-soft/60 px-2.5 py-1 text-[11px] font-bold text-foreground"
                >
                  <KeyRound className="h-3 w-3" />
                  密碼
                </Link>
              </div>
              {right && <div className="mt-2">{right}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[oklch(0.90_0.02_80)] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Walnut · Ops
        </p>
        <p className="mt-0.5 text-base font-black tracking-tight text-foreground">
          胡桃民宿後台
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active =
            "matchPrefix" in item && item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-primary-soft text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[oklch(0.90_0.02_80)] px-3 py-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          登出
        </button>
      </div>
    </div>
  );
}

/**
 * Segmented property switcher — makes it obvious which property is active.
 */
function PropertySwitcher() {
  const { properties, currentPropertyId, update } = usePropertyConfig();
  if (properties.length === 0) return null;
  return (
    <div className="flex items-center gap-1 rounded-full border border-[oklch(0.90_0.02_80)] bg-card p-1 shadow-sm">
      {properties.map((p) => {
        const active = p.id === currentPropertyId;
        return (
          <button
            key={p.id}
            onClick={() => update({ currentPropertyId: p.id })}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {active ? (
              <Check className="h-3 w-3" strokeWidth={3} />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            <span className="max-w-[7rem] truncate">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function OwnerCard({
  title,
  desc,
  actions,
  children,
}: {
  title?: string;
  desc?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[oklch(0.92_0.02_80)] bg-card shadow-[0_1px_0_rgba(139,115,85,0.04),0_8px_24px_-16px_rgba(139,115,85,0.18)]">
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-[oklch(0.94_0.02_82)] px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-black tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatMini({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: typeof Receipt;
  tone?: "default" | "warning" | "success" | "destructive" | "primary";
}) {
  const bar = {
    default: "bg-[oklch(0.55_0.08_60)]",
    primary: "bg-primary",
    warning: "bg-warning",
    success: "bg-success",
    destructive: "bg-destructive",
  }[tone];
  const iconBg = {
    default: "bg-secondary text-foreground",
    primary: "bg-primary-soft text-foreground",
    warning: "bg-warning-soft text-[oklch(0.45_0.13_55)]",
    success: "bg-success-soft text-success",
    destructive: "bg-destructive-soft text-destructive",
  }[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border border-[oklch(0.92_0.02_80)] bg-card px-4 py-4 shadow-[0_1px_0_rgba(139,115,85,0.04),0_8px_20px_-16px_rgba(139,115,85,0.2)] transition hover:shadow-[0_1px_0_rgba(139,115,85,0.06),0_12px_28px_-14px_rgba(139,115,85,0.28)]">
      <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-black tracking-tight text-foreground [font-variant-numeric:tabular-nums]">
            {value}
          </p>
        </div>
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4" strokeWidth={2.3} />
        </div>
      </div>
    </div>
  );
}

/**
 * Compact horizontal stat pill — mobile.
 */
export function StatPill({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: typeof Receipt;
  tone?: "default" | "warning" | "success" | "destructive" | "primary";
}) {
  const iconBg = {
    default: "bg-secondary text-foreground",
    primary: "bg-primary-soft text-foreground",
    warning: "bg-warning-soft text-[oklch(0.45_0.13_55)]",
    success: "bg-success-soft text-success",
    destructive: "bg-destructive-soft text-destructive",
  }[tone];
  return (
    <div className="flex snap-start shrink-0 flex-col items-center gap-1 rounded-xl border border-[oklch(0.92_0.02_80)] bg-card px-2.5 py-2 shadow-sm w-[19%] min-w-[64px]">
      <div className={`grid h-7 w-7 place-items-center rounded-lg ${iconBg}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </div>
      <p className="text-lg font-black leading-none text-foreground [font-variant-numeric:tabular-nums]">
        {value}
      </p>
      <p className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">
        {label}
      </p>
    </div>
  );
}
