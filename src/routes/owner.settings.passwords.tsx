import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Key, Lock, Save, Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { Input } from "./owner.settings.property";
import {
  usePropertyConfig,
  type PasswordReleaseMode,
  type RoomTypeGroup,
  type Room,
  type GatePasswordMode,
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
    label: "定時釋出",
    desc: "審核通過後，於入住當日指定時間自動寄出密碼。",
  },
  {
    v: "conditional",
    label: "條件式釋出",
    desc: "審核通過且完成付款（含押金）後自動寄出密碼。",
  },
];

const gateModeOptions: { v: GatePasswordMode; label: string; hint: string }[] = [
  { v: "sharedProperty", label: "整館共用", hint: "所有房型與房間使用同一組大門密碼。" },
  { v: "sharedGroup", label: "此房型共用", hint: "此房型的每一間房使用相同的大門密碼。" },
  { v: "perRoom", label: "每房不同", hint: "適合提早入住 / 多晚不同密碼 / 早退房場景。" },
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
  // Re-sync when switching property
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
        desc="供選擇「整館共用」的房型使用；也是新房型的預設值。"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 max-w-xs flex-1">
            <Input
              label={`${property?.name ?? ""} · 大門密碼`}
              value={gateDraft}
              onChange={setGateDraft}
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
        propertyGatePassword={property?.gatePassword ?? ""}
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

// -------------------------------------------------------------------
// Groups section: search + collapse-all controls, one card per group
// -------------------------------------------------------------------
function PasswordGroupsSection({
  groups,
  rooms,
  propertyGatePassword,
  onSaveGroup,
  onSaveRoom,
}: {
  groups: RoomTypeGroup[];
  rooms: Room[];
  propertyGatePassword: string;
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
          propertyGatePassword={propertyGatePassword}
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

// -------------------------------------------------------------------
// Per-group card with its own local draft + save button
// -------------------------------------------------------------------

type GroupDraft = {
  gatePasswordMode: GatePasswordMode;
  gatePasswordShared: string;
  keyPickupLocation: string;
  rooms: Record<
    string,
    { doorPassword: string; gatePassword: string; note: string }
  >;
};

function buildDraft(g: RoomTypeGroup, rooms: Room[]): GroupDraft {
  return {
    gatePasswordMode: g.gatePasswordMode ?? "sharedProperty",
    gatePasswordShared: g.gatePasswordShared ?? "",
    keyPickupLocation: g.keyPickupLocation ?? "",
    rooms: Object.fromEntries(
      rooms.map((r) => [
        r.id,
        {
          doorPassword: r.doorPassword ?? "",
          gatePassword: r.gatePassword ?? "",
          note: r.note ?? "",
        },
      ]),
    ),
  };
}

function GroupPasswordCard({
  group,
  rooms,
  propertyGatePassword,
  collapsed = false,
  onToggle,
  onSaveGroup,
  onSaveRoom,
}: {
  group: RoomTypeGroup;
  rooms: Room[];
  propertyGatePassword: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onSaveGroup: (patch: Partial<RoomTypeGroup>) => void;
  onSaveRoom: (id: string, patch: Partial<Room>) => void;
}) {
  const initial = useMemo(() => buildDraft(group, rooms), [group, rooms]);
  const [draft, setDraft] = useState<GroupDraft>(initial);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const setGate = (v: GatePasswordMode) =>
    setDraft((d) => ({ ...d, gatePasswordMode: v }));
  const patchRoom = (id: string, patch: Partial<GroupDraft["rooms"][string]>) =>
    setDraft((d) => ({
      ...d,
      rooms: { ...d.rooms, [id]: { ...d.rooms[id], ...patch } },
    }));

  const save = () => {
    onSaveGroup({
      gatePasswordMode: draft.gatePasswordMode,
      gatePasswordShared: draft.gatePasswordShared,
      keyPickupLocation: draft.keyPickupLocation,
    });
    Object.entries(draft.rooms).forEach(([id, r]) =>
      onSaveRoom(id, {
        doorPassword: r.doorPassword,
        gatePassword: r.gatePassword,
        note: r.note,
      }),
    );
    setSavedAt(new Date());
    toast.success(`已儲存：${group.name}`);
  };

  const isKey = group.accessMode === "key";
  const mode = draft.gatePasswordMode;

  return (
    <OwnerCard
      title={group.name}
      desc={group.description}
      actions={
        <div className="flex items-center gap-2">
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
        </div>
      }
    >
      {isKey ? (
        <Input
          label="取鑰匙位置與方式"
          full
          value={draft.keyPickupLocation}
          onChange={(v) => setDraft((d) => ({ ...d, keyPickupLocation: v }))}
          placeholder="例：民宿門口右側鑰匙盒（密碼 5588）"
        />
      ) : (
        <>
          {/* Gate password mode selector */}
          <div className="mb-4 rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-3">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
              大門密碼設定
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {gateModeOptions.map((o) => (
                <label
                  key={o.v}
                  className={`cursor-pointer rounded-lg border p-2.5 transition ${
                    mode === o.v
                      ? "border-primary bg-primary-soft/40"
                      : "border-border bg-card hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={mode === o.v}
                      onChange={() => setGate(o.v)}
                      className="h-3.5 w-3.5 accent-[oklch(0.75_0.14_85)]"
                    />
                    <span className="text-xs font-bold text-foreground">
                      {o.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                    {o.hint}
                  </p>
                </label>
              ))}
            </div>

            {mode === "sharedProperty" && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                使用整館預設大門密碼：
                <span className="ml-1 font-bold [font-variant-numeric:tabular-nums] text-foreground">
                  {propertyGatePassword || "尚未設定"}
                </span>
              </p>
            )}
            {mode === "sharedGroup" && (
              <div className="mt-3 max-w-xs">
                <Input
                  label="此房型共用大門密碼"
                  value={draft.gatePasswordShared}
                  onChange={(v) =>
                    setDraft((d) => ({ ...d, gatePasswordShared: v }))
                  }
                />
              </div>
            )}
          </div>

          {/* Per-room cards */}
          <div className="space-y-2">
            {rooms.map((r) => {
              const rd = draft.rooms[r.id] ?? {
                doorPassword: "",
                gatePassword: "",
                note: "",
              };
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
                    {mode === "perRoom" && (
                      <Input
                        label="大門密碼"
                        value={rd.gatePassword}
                        onChange={(v) => patchRoom(r.id, { gatePassword: v })}
                        placeholder="4-6 位數字"
                      />
                    )}
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
        </>
      )}
    </OwnerCard>
  );
}
