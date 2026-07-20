import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { FieldLabel } from "./Fields";

export interface Country {
  code: string; // dial code including +
  iso: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "+886", iso: "TW", name: "台灣 Taiwan", flag: "🇹🇼" },
  { code: "+852", iso: "HK", name: "香港 Hong Kong", flag: "🇭🇰" },
  { code: "+853", iso: "MO", name: "澳門 Macau", flag: "🇲🇴" },
  { code: "+86", iso: "CN", name: "中國 China", flag: "🇨🇳" },
  { code: "+81", iso: "JP", name: "日本 Japan", flag: "🇯🇵" },
  { code: "+82", iso: "KR", name: "韓國 Korea", flag: "🇰🇷" },
  { code: "+65", iso: "SG", name: "新加坡 Singapore", flag: "🇸🇬" },
  { code: "+60", iso: "MY", name: "馬來西亞 Malaysia", flag: "🇲🇾" },
  { code: "+66", iso: "TH", name: "泰國 Thailand", flag: "🇹🇭" },
  { code: "+84", iso: "VN", name: "越南 Vietnam", flag: "🇻🇳" },
  { code: "+63", iso: "PH", name: "菲律賓 Philippines", flag: "🇵🇭" },
  { code: "+62", iso: "ID", name: "印尼 Indonesia", flag: "🇮🇩" },
  { code: "+91", iso: "IN", name: "印度 India", flag: "🇮🇳" },
  { code: "+61", iso: "AU", name: "澳洲 Australia", flag: "🇦🇺" },
  { code: "+64", iso: "NZ", name: "紐西蘭 New Zealand", flag: "🇳🇿" },
  { code: "+1", iso: "US", name: "美國 / 加拿大", flag: "🇺🇸" },
  { code: "+44", iso: "GB", name: "英國 UK", flag: "🇬🇧" },
  { code: "+33", iso: "FR", name: "法國 France", flag: "🇫🇷" },
  { code: "+49", iso: "DE", name: "德國 Germany", flag: "🇩🇪" },
  { code: "+39", iso: "IT", name: "義大利 Italy", flag: "🇮🇹" },
  { code: "+34", iso: "ES", name: "西班牙 Spain", flag: "🇪🇸" },
  { code: "+31", iso: "NL", name: "荷蘭 Netherlands", flag: "🇳🇱" },
  { code: "+41", iso: "CH", name: "瑞士 Switzerland", flag: "🇨🇭" },
  { code: "+46", iso: "SE", name: "瑞典 Sweden", flag: "🇸🇪" },
  { code: "+7", iso: "RU", name: "俄羅斯 Russia", flag: "🇷🇺" },
  { code: "+971", iso: "AE", name: "阿聯 UAE", flag: "🇦🇪" },
];

export function splitPhone(full: string): { code: string; local: string } {
  const trimmed = (full || "").trim();
  if (trimmed.startsWith("+")) {
    const match = COUNTRIES
      .slice()
      .sort((a, b) => b.code.length - a.code.length)
      .find((c) => trimmed.startsWith(c.code));
    if (match) {
      return { code: match.code, local: trimmed.slice(match.code.length).replace(/^\s+/, "") };
    }
  }
  // Local Taiwan number
  if (/^09\d/.test(trimmed)) {
    return { code: "+886", local: trimmed.replace(/^0/, "") };
  }
  return { code: "+886", local: trimmed };
}

export function PhoneField({
  label,
  required,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (fullE164: string) => void;
  hint?: string;
  error?: string;
}) {
  const { code, local } = useMemo(() => splitPhone(value), [value]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

  const filtered = COUNTRIES.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const pickCountry = (c: Country) => {
    setOpen(false);
    setQuery("");
    onChange(`${c.code}${local ? " " + local : ""}`);
  };

  const setLocal = (v: string) => {
    const digits = v.replace(/[^\d]/g, "");
    onChange(digits ? `${code} ${digits}` : code);
  };

  return (
    <div className="mb-4">
      <FieldLabel>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>

      <div className="flex gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-full items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-3 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="text-base leading-none">{selected.flag}</span>
            <span>{selected.code}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="absolute left-0 top-full z-50 mt-1 w-72 max-w-[85vw] overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜尋國家或代碼"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <ul
                  role="listbox"
                  className="max-h-64 overflow-y-auto overscroll-contain py-1"
                >
                  {filtered.length === 0 && (
                    <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                      找不到符合的國家
                    </li>
                  )}
                  {filtered.map((c) => {
                    const active = c.code === selected.code && c.iso === selected.iso;
                    return (
                      <li key={c.iso}>
                        <button
                          type="button"
                          onClick={() => pickCountry(c)}
                          className={
                            "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition " +
                            (active
                              ? "bg-primary-soft text-foreground"
                              : "text-foreground hover:bg-accent")
                          }
                        >
                          <span className="text-lg leading-none">{c.flag}</span>
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {c.code}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>

        <input
          type="tel"
          inputMode="numeric"
          placeholder="912 345 678"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className="w-full flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-destructive">{error}</p>
      )}
    </div>
  );
}
