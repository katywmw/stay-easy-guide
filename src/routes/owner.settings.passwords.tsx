import { createFileRoute } from "@tanstack/react-router";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { Input } from "./owner.settings.property";
import {
  usePropertyConfig,
  type PasswordReleaseMode,
} from "@/lib/property-config";
import { toast, Toaster } from "sonner";
import { Key, Lock } from "lucide-react";

export const Route = createFileRoute("/owner/settings/passwords")({
  component: PasswordSettings,
});

const modes: { v: PasswordReleaseMode; label: string; desc: string }[] = [
  { v: "manual", label: "手動釋出", desc: "業者於後台點擊「釋出密碼」旅客才能看到。" },
  { v: "scheduled", label: "定時釋出", desc: "於入住日的指定時間自動釋出。" },
  { v: "conditional", label: "條件式釋出", desc: "押金已收 + 證件通過後自動釋出。" },
];

function PasswordSettings() {
  const {
    rooms,
    roomGroups,
    currentPropertyId,
    updateRoom,
    updateRoomGroup,
    passwordReleaseMode,
    passwordReleaseTime,
    update,
  } = usePropertyConfig();
  const groups = roomGroups.filter((g) => g.propertyId === currentPropertyId);

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />

      <OwnerCard
        title="房型 / 房間密碼"
        desc="密碼房型顯示每房不同密碼，鑰匙房型只需設定取鑰匙位置。"
      >
        <div className="space-y-4">
          {groups.map((g) => {
            const groupRooms = rooms.filter((r) => r.groupId === g.id);
            return (
              <div
                key={g.id}
                className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{g.name}</p>
                  {g.accessMode === "password" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.94_0.05_240)] px-2 py-0.5 text-[10px] font-bold text-[oklch(0.35_0.15_250)]">
                      <Lock className="h-3 w-3" />
                      密碼房型
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-[oklch(0.45_0.13_55)]">
                      <Key className="h-3 w-3" />
                      鑰匙房型
                    </span>
                  )}
                </div>

                {g.accessMode === "password" ? (
                  <>
                    <div className="mb-3 max-w-xs">
                      <Input
                        label="大門密碼（此房型共用）"
                        value={g.gatePasswordShared ?? ""}
                        onChange={(v) => updateRoomGroup(g.id, { gatePasswordShared: v })}
                      />
                    </div>
                    <div className="space-y-2">
                      {groupRooms.map((r) => (
                        <div key={r.id} className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                          <Input
                            label="房號"
                            value={r.roomNumber ?? ""}
                            onChange={(v) => updateRoom(r.id, { roomNumber: v })}
                          />
                          <Input
                            label="房門密碼"
                            value={r.doorPassword ?? ""}
                            onChange={(v) => updateRoom(r.id, { doorPassword: v })}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Input
                    label="取鑰匙位置與方式"
                    full
                    value={g.keyPickupLocation ?? ""}
                    onChange={(v) => updateRoomGroup(g.id, { keyPickupLocation: v })}
                  />
                )}
              </div>
            );
          })}
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
