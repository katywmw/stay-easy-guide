import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Copy, ChevronDown, ChevronRight, Key, Lock, Pencil, Check, ImagePlus, Play } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { Input } from "./owner.settings.property";
import {
  usePropertyConfig,
  type Room,
  type RoomTypeGroup,
  type AccessMode,
} from "@/lib/property-config";
import { fileToMediaDataUrl } from "@/lib/media-upload";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/rooms")({
  component: RoomsSettings,
});

function emptyGroup(propertyId: string): Omit<RoomTypeGroup, "id"> {
  return {
    propertyId,
    name: "",
    bedType: "",
    description: "",
    depositAmount: 1000,
    accessMode: "password",
  };
}

function RoomsSettings() {
  const {
    properties,
    currentPropertyId,
    roomGroups,
    rooms,
    addRoomGroup,
    updateRoomGroup,
    removeRoomGroup,
    duplicateRoomGroup,
    addRoom,
    updateRoom,
    removeRoom,
    duplicateRoom,
  } = usePropertyConfig();

  const property = properties.find((p) => p.id === currentPropertyId);
  const propertyGroups = roomGroups.filter((g) => g.propertyId === currentPropertyId);
  const propertyRooms = rooms.filter((r) => r.propertyId === currentPropertyId);

  const [addingGroup, setAddingGroup] = useState(false);
  const [groupDraft, setGroupDraft] = useState(emptyGroup(currentPropertyId));
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(propertyGroups.map((g) => g.id)));
  const [filterTags, setFilterTags] = useState<Set<string>>(new Set());

  const bedTags = useMemo(() => {
    const set = new Set<string>();
    propertyGroups.forEach((g) => g.bedType && set.add(g.bedType));
    return Array.from(set);
  }, [propertyGroups]);

  const filteredGroups = filterTags.size
    ? propertyGroups.filter((g) => g.bedType && filterTags.has(g.bedType))
    : propertyGroups;

  const toggle = (id: string) => {
    const n = new Set(openIds);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setOpenIds(n);
  };
  const toggleTag = (t: string) => {
    const n = new Set(filterTags);
    if (n.has(t)) n.delete(t);
    else n.add(t);
    setFilterTags(n);
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />

      <OwnerCard
        title={`房型與房間 · ${property?.name ?? ""}`}
        desc="先建立房型（如：雙人床、單人床、整棟），再於底下新增實際房間。可複製房型或房間快速套用。"
        actions={
          <button
            onClick={() => {
              setGroupDraft(emptyGroup(currentPropertyId));
              setAddingGroup((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            新增房型
          </button>
        }
      >
        {bedTags.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">
              依床型篩選：
            </span>
            {bedTags.map((t) => {
              const on = filterTags.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              );
            })}
            {filterTags.size > 0 && (
              <button
                onClick={() => setFilterTags(new Set())}
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-muted-foreground underline"
              >
                清除
              </button>
            )}
          </div>
        )}

        {addingGroup && (
          <div className="mb-5 rounded-lg border border-dashed border-primary bg-primary-soft/30 p-4">
            <p className="mb-3 text-sm font-bold text-foreground">新增房型群組</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="房型名稱（自訂）" value={groupDraft.name} onChange={(v) => setGroupDraft({ ...groupDraft, name: v })} placeholder="例：雙人床套房 / 單人床 / 整棟" />
              <Input label="床型 tag" value={groupDraft.bedType ?? ""} onChange={(v) => setGroupDraft({ ...groupDraft, bedType: v })} placeholder="用於快速篩選：雙人床、單人床…" />
              <Input label="押金金額（NT$，每間）" type="number" value={groupDraft.depositAmount} onChange={(v) => setGroupDraft({ ...groupDraft, depositAmount: Number(v) || 0 })} />
              <AccessSelect value={groupDraft.accessMode} onChange={(v) => setGroupDraft({ ...groupDraft, accessMode: v })} />
              <Input label="房型描述" full value={groupDraft.description} onChange={(v) => setGroupDraft({ ...groupDraft, description: v })} />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (!groupDraft.name.trim()) return toast.error("請輸入房型名稱");
                  addRoomGroup(groupDraft);
                  setAddingGroup(false);
                  toast.success("已新增房型");
                }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                建立
              </button>
              <button
                onClick={() => setAddingGroup(false)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {filteredGroups.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
            {propertyGroups.length === 0
              ? "尚未建立房型，請先新增。"
              : "沒有符合篩選的房型。"}
          </p>
        )}

        <div className="space-y-3">
          {filteredGroups.map((g) => {
            const groupRooms = propertyRooms.filter((r) => r.groupId === g.id);
            const isOpen = openIds.has(g.id);
            return (
              <GroupCard
                key={g.id}
                group={g}
                rooms={groupRooms}
                isOpen={isOpen}
                onToggle={() => toggle(g.id)}
                onUpdate={(patch) => updateRoomGroup(g.id, patch)}
                onDelete={() => {
                  if (
                    confirm(
                      `刪除房型「${g.name}」？其下 ${groupRooms.length} 間房間將變成未分類。`,
                    )
                  ) {
                    removeRoomGroup(g.id);
                    toast.success("已刪除");
                  }
                }}
                onDuplicate={() => {
                  duplicateRoomGroup(g.id);
                  toast.success("已複製房型（房間需另外新增）");
                }}
                onAddRoom={() =>
                  addRoom({
                    propertyId: currentPropertyId,
                    groupId: g.id,
                    roomNumber: "",
                    name: g.name,
                    type: "suite",
                    beds: 1,
                    depositAmount: g.depositAmount,
                  })
                }
                onUpdateRoom={updateRoom}
                onRemoveRoom={(id) => {
                  if (confirm("刪除此房間？")) {
                    removeRoom(id);
                    toast.success("已刪除");
                  }
                }}
                onDuplicateRoom={(id) => {
                  duplicateRoom(id);
                  toast.success("已複製，可修改房號與密碼");
                }}
              />
            );
          })}
        </div>
      </OwnerCard>
    </div>
  );
}

function GroupCard({
  group,
  rooms,
  isOpen,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddRoom,
  onUpdateRoom,
  onRemoveRoom,
  onDuplicateRoom,
}: {
  group: RoomTypeGroup;
  rooms: Room[];
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<RoomTypeGroup>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddRoom: () => void;
  onUpdateRoom: (id: string, patch: Partial<Room>) => void;
  onRemoveRoom: (id: string) => void;
  onDuplicateRoom: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[oklch(0.92_0.02_80)] bg-secondary/20">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-foreground">
              {group.name || "未命名"}
            </p>
            {group.bedType && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-foreground">
                {group.bedType}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                group.accessMode === "password"
                  ? "bg-[oklch(0.94_0.05_240)] text-[oklch(0.35_0.15_250)]"
                  : "bg-warning-soft text-[oklch(0.45_0.13_55)]"
              }`}
            >
              {group.accessMode === "password" ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Key className="h-3 w-3" />
              )}
              {group.accessMode === "password" ? "密碼" : "鑰匙"}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
            {rooms.length} 間 · 押金 NT$ {group.depositAmount.toLocaleString()}
          </p>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
          title="複製房型"
        >
          <Copy className="h-3.5 w-3.5" />
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive-soft"
          title="刪除房型"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-[oklch(0.94_0.02_82)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="房型名稱" value={group.name} onChange={(v) => onUpdate({ name: v })} />
            <Input label="床型 tag" value={group.bedType ?? ""} onChange={(v) => onUpdate({ bedType: v })} placeholder="雙人床 / 單人床 / 加大床" />
            <Input label="押金金額（NT$）" type="number" value={group.depositAmount} onChange={(v) => onUpdate({ depositAmount: Number(v) || 0 })} />
            <AccessSelect value={group.accessMode} onChange={(v) => onUpdate({ accessMode: v })} />
            <Input label="房型描述" full value={group.description} onChange={(v) => onUpdate({ description: v })} />
            <Input label="入住指引補充" full value={group.guideNote ?? ""} onChange={(v) => onUpdate({ guideNote: v })} />
          </div>
          {group.accessMode === "key" && (
            <KeyPickupMedia
              media={group.keyPickupMedia ?? []}
              onChange={(m) => onUpdate({ keyPickupMedia: m })}
            />
          )}
          <p className="mt-3 rounded-lg bg-primary-soft/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            大門密碼、房門密碼、取鑰匙位置等敏感資訊請至
            <a href="/owner/settings/passwords" className="mx-1 font-bold text-foreground underline">密碼設定</a>
            統一管理（密碼變動頻繁，建議集中在同一頁）。
          </p>


          {/* Rooms table */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                房間清單（{rooms.length}）
              </p>
              <button
                onClick={onAddRoom}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground"
              >
                <Plus className="h-3 w-3" />
                新增房間
              </button>
            </div>
            {rooms.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
                尚無房間
              </p>
            ) : (
              <div className="space-y-2">
                {rooms.map((r) => (
                  <RoomRow
                    key={r.id}
                    room={r}
                    showDoorPassword={group.accessMode === "password"}
                    onUpdate={(patch) => onUpdateRoom(r.id, patch)}
                    onRemove={() => onRemoveRoom(r.id)}
                    onDuplicate={() => onDuplicateRoom(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AccessSelect({
  value,
  onChange,
}: {
  value: AccessMode;
  onChange: (v: AccessMode) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold text-foreground">進門方式</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AccessMode)}
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="password">密碼鎖（每房不同密碼）</option>
        <option value="key">實體鑰匙（同一取鑰匙地點）</option>
      </select>
    </label>
  );
}

function RoomRow({
  room,
  showDoorPassword,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  room: Room;
  showDoorPassword: boolean;
  onUpdate: (patch: Partial<Room>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const title = room.displayName?.trim() || room.roomNumber || "未命名";

  return (
    <div className="overflow-hidden rounded-lg border border-[oklch(0.94_0.02_82)] bg-card">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="truncate text-sm font-bold text-foreground">{title}</p>
            {room.displayName && room.roomNumber && (
              <span className="text-[11px] text-muted-foreground">
                房號 {room.roomNumber}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground [font-variant-numeric:tabular-nums]">
            {room.note && <span className="truncate">備註 {room.note}</span>}
          </div>

        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className={`grid h-7 w-7 place-items-center rounded ${
            editing
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary"
          }`}
          title={editing ? "完成" : "編輯"}
        >
          {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={onDuplicate}
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary"
          title="複製房間"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="grid h-7 w-7 place-items-center rounded text-destructive hover:bg-destructive-soft"
          title="刪除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {editing && (
        <div className="border-t border-[oklch(0.94_0.02_82)] bg-secondary/30 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="房號"
              value={room.roomNumber ?? ""}
              onChange={(v) => onUpdate({ roomNumber: v })}
              placeholder="101"
            />
            <Input
              label="房間別名（選填）"
              value={room.displayName ?? ""}
              onChange={(v) => onUpdate({ displayName: v })}
              placeholder="Happy 101 / 松風"
            />
            <Input
              label="備註"
              full
              value={room.note ?? ""}
              onChange={(v) => onUpdate({ note: v })}
              placeholder="例：非吸菸房 / 附早餐"
            />
          </div>
          <p className="mt-2 rounded bg-primary-soft/30 px-2 py-1.5 text-[10px] text-muted-foreground">
            房門密碼請至「密碼設定」頁編輯（密碼改動集中管理，避免遺漏通知旅客）。
          </p>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

