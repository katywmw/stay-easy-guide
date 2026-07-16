import { createFileRoute } from "@tanstack/react-router";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { Input } from "./owner.settings.property";
import { usePropertyConfig, type PasswordReleaseMode } from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/passwords")({
  component: PasswordSettings,
});

const modes: { v: PasswordReleaseMode; label: string; desc: string }[] = [
  { v: "manual", label: "手動釋出", desc: "業者於後台點擊「釋出密碼」旅客才能看到。" },
  { v: "scheduled", label: "定時釋出", desc: "於入住日的指定時間自動釋出。" },
  { v: "conditional", label: "條件式釋出", desc: "押金已收 + 證件通過後自動釋出。" },
];

function PasswordSettings() {
  const { rooms, currentPropertyId, updateRoom, passwordReleaseMode, passwordReleaseTime, update } = usePropertyConfig();
  const filtered = rooms.filter((r) => r.propertyId === currentPropertyId);

  return (
    <div className="space-y-5">
      <Toaster position="top-center" richColors />

      <OwnerCard title="密碼模板" desc="於各房間輸入大門 / 房門密碼。也可在「房間 / 單位」頁面編輯。">
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-4">
              <p className="mb-3 text-sm font-bold text-foreground">{r.name}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="大門密碼" value={r.gatePassword ?? ""} onChange={(v) => updateRoom(r.id, { gatePassword: v })} />
                <Input label="房門密碼" value={r.doorPassword ?? ""} onChange={(v) => updateRoom(r.id, { doorPassword: v })} />
              </div>
            </div>
          ))}
        </div>
      </OwnerCard>

      <OwnerCard title="密碼釋出規則">
        <div className="space-y-3">
          {modes.map((m) => (
            <label
              key={m.v}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                passwordReleaseMode === m.v
                  ? "border-primary bg-primary-soft/40"
                  : "border-[oklch(0.94_0.02_82)] hover:bg-secondary/40"
              }`}
            >
              <input
                type="radio"
                checked={passwordReleaseMode === m.v}
                onChange={() => update({ passwordReleaseMode: m.v })}
                className="mt-0.5 h-4 w-4 accent-[oklch(0.75_0.14_85)]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{m.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
                {m.v === "scheduled" && passwordReleaseMode === "scheduled" && (
                  <div className="mt-3 max-w-xs">
                    <Input
                      label="釋出時間"
                      type="time"
                      value={passwordReleaseTime}
                      onChange={(v) => update({ passwordReleaseTime: v })}
                    />
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
        <button
          onClick={() => toast.success("已儲存")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          儲存
        </button>
      </OwnerCard>
    </div>
  );
}
