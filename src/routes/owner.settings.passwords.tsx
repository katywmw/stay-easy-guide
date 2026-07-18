import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Key, Lock, Save, Check, ChevronDown, ChevronUp, Search, Eye, EyeOff } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { Input } from "./owner.settings.property";
import {
  usePropertyConfig,
  type PasswordReleaseMode,
  type RoomTypeGroup,
  type Room,
} from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/passwords")({
  component: PasswordSettings,
});

const modes: { v: PasswordReleaseMode; label: string; desc: string }[] = [
  {
    v: "manual",
    label: "手動釋出",
    desc: "審核通過後，由業者在後台按下「釋出密碼」旅客才會收到。",
  },
  {
    v: "scheduled",
    label: "審核通過後定時釋出",
    desc: "審核通過後，於入住當日指定時間自動寄出密碼。",
  },
  {
    v: "conditional",
    label: "條件式釋出",
    desc: "審核通過且完成付款（含押金）後自動寄出密碼。",
  },
];

function PasswordSettings() {
  const {
    rooms,
    roomGroups,
    properties,
    currentPropertyId,
    updateRoom,
    updateRoomGroup,
    updateProperty,
    passwordReleaseMode,
    passwordReleaseTime,
    update,
  } = usePropertyConfig();

  const property = properties.find((p) => p.id === currentPropertyId);
  const groups = roomGroups.filter((g) => g.propertyId === currentPropertyId);

  // Local draft for property-wide gate password
  const [gateDraft, setGateDraft] = useState(property?.gatePassword ?? "");
  const gateDirty = (property?.gatePassword ?? "") !== gateDraft;
  const propKey = property?.id ?? "";
  useEffect(() => {
    setGateDraft(property?.gatePassword ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propKey]);

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />

      {/* Property-wide gate password */}
      <OwnerCard
        title="大門密碼（整館預設）"
        desc="整館共用一組大門密碼。修改後請按「儲存」。"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 max-w-xs flex-1">
            <Input
              label={`${property?.name ?? ""} · 大門密碼`}
              value={gateDraft}
              onChange={(v) => setGateDraft(v)}
              placeholder="例：9945"
            />
          </div>
          <button
            onClick={() => {
              if (property) {
                updateProperty(property.id, { gatePassword: gateDraft });
                toast.success("已儲存整館大門密碼");
              }
            }}
            disabled={!gateDirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" />
            儲存
          </button>
        </div>
      </OwnerCard>

      {/* Per-group password cards */}
      <PasswordGroupsSection
        groups={groups}
        rooms={rooms}
        onSaveGroup={(id, patch) => updateRoomGroup(id, patch)}
        onSaveRoom={(id, patch) => updateRoom(id, patch)}
      />

      {/* Release rules */}
      <OwnerCard title="密碼釋出規則">
        <div className="mb-3 rounded-lg bg-primary-soft/40 p-3 text-xs leading-relaxed text-foreground">
          所有規則都以「審核通過」為前提；審核未通過前，密碼一律不會釋出。
        </div>
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

function maskValue(v: string) {
  return v ? "•".repeat(Math.max(4, v.length)) : "";
}

// -------------------------------------------------------------------
function PasswordGroupsSection({
  groups,
  rooms,
  onSaveGroup,
  onSaveRoom,
}: {
  groups: RoomTypeGroup[];
  rooms: Room[];
  onSaveGroup: (id: string, patch: Partial<RoomTypeGroup>) => void;
  onSaveRoom: (id: string, patch: Partial<Room>) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const kw = q.trim().toLowerCase();

  const filtered = groups
    .map((g) => {
      const gRooms = rooms.filter((r) => r.groupId === g.id);
      if (!kw) return { g, gRooms, matches: true };
      const gMatch = g.name.toLowerCase().includes(kw);
      const rMatch = gRooms.filter(
        (r) =>
          (r.roomNumber ?? "").toLowerCase().includes(kw) ||
          (r.displayName ?? "").toLowerCase().includes(kw) ||
          (r.doorPassword ?? "").toLowerCase().includes(kw),
      );
      return { g, gRooms: gMatch ? gRooms : rMatch, matches: gMatch || rMatch.length > 0 };
    })
    .filter((x) => x.matches);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋房型、房號、別名或密碼"
            className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() =>
            setCollapsed(Object.fromEntries(groups.map((g) => [g.id, false])))
          }
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          全部展開
        </button>
        <button
          onClick={() =>
            setCollapsed(Object.fromEntries(groups.map((g) => [g.id, true])))
          }
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          全部收合
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
          沒有符合條件的房型或房間。
        </p>
      )}

      {filtered.map(({ g, gRooms }) => (
        <GroupPasswordCard
          key={g.id}
          group={g}
          rooms={gRooms}
          collapsed={!!collapsed[g.id]}
          onToggle={() =>
            setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))
          }
          onSaveGroup={(patch) => onSaveGroup(g.id, patch)}
          onSaveRoom={onSaveRoom}
        />
      ))}
    </div>
  );
}

type GroupDraft = {
  keyPickupLocation: string;
  rooms: Record<string, { doorPassword: string; note: string }>;
};

function buildDraft(g: RoomTypeGroup, rooms: Room[]): GroupDraft {
  return {
    keyPickupLocation: g.keyPickupLocation ?? "",
    rooms: Object.fromEntries(
      rooms.map((r) => [
        r.id,
        {
          doorPassword: r.doorPassword ?? "",
          note: r.note ?? "",
        },
      ]),
    ),
  };
}

function GroupPasswordCard({
  group,
  rooms,
  collapsed = false,
  onToggle,
  onSaveGroup,
  onSaveRoom,
}: {
  group: RoomTypeGroup;
  rooms: Room[];
  collapsed?: boolean;
  onToggle?: () => void;
  onSaveGroup: (patch: Partial<RoomTypeGroup>) => void;
  onSaveRoom: (id: string, patch: Partial<Room>) => void;
}) {
  const initial = useMemo(() => buildDraft(group, rooms), [group, rooms]);
  const [draft, setDraft] = useState<GroupDraft>(initial);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const patchRoom = (id: string, patch: Partial<GroupDraft["rooms"][string]>) =>
    setDraft((d) => ({
      ...d,
      rooms: { ...d.rooms, [id]: { ...d.rooms[id], ...patch } },
    }));

  const save = () => {
    onSaveGroup({ keyPickupLocation: draft.keyPickupLocation });
    Object.entries(draft.rooms).forEach(([id, r]) =>
      onSaveRoom(id, {
        doorPassword: r.doorPassword,
        note: r.note,
      }),
    );
    setSavedAt(new Date());
    toast.success(`已儲存：${group.name}`);
  };

  const isKey = group.accessMode === "key";

  return (
    <OwnerCard
      title={group.name}
      desc={group.description}
      actions={
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {rooms.length} 間
          </span>
          {isKey ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-[oklch(0.45_0.13_55)]">
              <Key className="h-3 w-3" /> 鑰匙房型
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.94_0.05_240)] px-2 py-0.5 text-[10px] font-bold text-[oklch(0.35_0.15_250)]">
              <Lock className="h-3 w-3" /> 密碼房型
            </span>
          )}
          <button
            onClick={save}
            disabled={!dirty}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
              dirty
                ? "bg-primary text-primary-foreground shadow"
                : "border border-border bg-card text-muted-foreground"
            }`}
            title="儲存此房型"
          >
            {dirty ? (
              <>
                <Save className="h-3.5 w-3.5" /> 儲存
              </>
            ) : savedAt ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" /> 已儲存
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> 已同步
              </>
            )}
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary"
              aria-label={collapsed ? "展開" : "收合"}
            >
              {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      }
    >
      {collapsed ? (
        <p className="text-[11px] text-muted-foreground">
          房間清單已收合。共 {rooms.length} 間。
        </p>
      ) : isKey ? (
        <Input
          label="取鑰匙位置與方式"
          full
          value={draft.keyPickupLocation}
          onChange={(v) => setDraft((d) => ({ ...d, keyPickupLocation: v }))}
          placeholder="例：民宿門口右側鑰匙盒（密碼 5588）"
        />
      ) : (
        <div className="space-y-2">
          {rooms.map((r) => {
            const rd = draft.rooms[r.id] ?? { doorPassword: "", note: "" };
            const title = r.displayName?.trim() || r.roomNumber || "未命名";
            return (
              <div
                key={r.id}
                className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-card p-3"
              >
                <div className="mb-2 flex flex-wrap items-baseline gap-2">
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  {r.displayName && r.roomNumber && (
                    <span className="text-[11px] text-muted-foreground">
                      房號 {r.roomNumber}
                    </span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="房門密碼"
                    value={rd.doorPassword}
                    onChange={(v) => patchRoom(r.id, { doorPassword: v })}
                    placeholder="4-6 位數字"
                  />
                  <Input
                    label="備註"
                    full
                    value={rd.note}
                    onChange={(v) => patchRoom(r.id, { note: v })}
                    placeholder="例：提早入住需重設 / 週末不同"
                  />
                </div>
              </div>
            );
          })}
          {rooms.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
              此房型尚未新增房間，請至「房型與房間」頁面新增。
            </p>
          )}
        </div>
      )}
    </OwnerCard>
  );
}
