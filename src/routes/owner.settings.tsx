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
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/owner/settings")({
  component: SettingsLayout,
  head: () => ({ meta: [{ title: "民宿設定 · 胡桃民宿" }] }),
});

type NavItem = { to: string; label: string; icon: typeof Building2; desc: string };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "常用（每日）",
    items: [
      { to: "/owner/settings/passwords", label: "密碼設定", icon: KeyRound, desc: "大門 + 房門 · 每日常變動" },
    ],
  },
  {
    title: "民宿基本",
    items: [
      { to: "/owner/settings/property", label: "館別 / 資料", icon: Building2, desc: "多館別、聯絡資訊" },
      { to: "/owner/settings/rooms", label: "房型 / 房間", icon: DoorOpen, desc: "分類、床型、押金" },
      { to: "/owner/settings/house-rules", label: "入住須知", icon: ScrollText, desc: "富文字編輯" },
      { to: "/owner/settings/guide", label: "入住指引 + 相片", icon: MapPin, desc: "地址、停車、大門" },
      { to: "/owner/settings/faq", label: "常見問答", icon: HelpCircle, desc: "自訂 FAQ" },
      { to: "/owner/settings/contact", label: "旅客聯絡方式", icon: MessageCircle, desc: "LINE / WhatsApp" },
    ],
  },
  {
    title: "交易",
    items: [
      { to: "/owner/settings/deposit", label: "押金規則", icon: Coins, desc: "無 / 固定 / 按房" },
      { to: "/owner/settings/payments", label: "付款方式", icon: Wallet, desc: "匯款 + LINE Pay QR" },
      { to: "/owner/settings/extra-fees", label: "額外費用項目", icon: Plus, desc: "寵物、加床、烤肉" },
    ],
  },
];

function SettingsLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <OwnerShell title="民宿設定" subtitle="Settings">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="min-w-0 overflow-hidden rounded-xl border border-[oklch(0.92_0.02_80)] bg-card p-3 lg:sticky lg:top-16 lg:self-start">
          <div className="min-w-0 space-y-4">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  {g.title}
                </p>
                <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex shrink-0 items-start gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition lg:w-full ${
                          active
                            ? "bg-primary-soft text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} />
                        <div className="min-w-0">
                          <p className="whitespace-nowrap lg:whitespace-normal">
                            {item.label}
                          </p>
                          <p className="hidden text-[10px] font-normal text-muted-foreground lg:block">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </OwnerShell>
  );
}
