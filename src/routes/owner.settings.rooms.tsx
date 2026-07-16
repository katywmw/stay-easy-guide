import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { Input } from "./owner.settings.property";
import {
  usePropertyConfig,
  roomTypeLabels,
  type Room,
  type RoomType,
} from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/rooms")({
  component: RoomsSettings,
});

function emptyRoom(propertyId: string): Omit<Room, "id"> {
  return {
    propertyId,
    name: "",
    type: "suite",
    beds: 2,
    depositAmount: 1000,
  };
}

function RoomsSettings() {
  const { properties, currentPropertyId, rooms, addRoom, updateRoom, removeRoom } =
    usePropertyConfig();
  const property = properties.find((p) => p.id === currentPropertyId);
  const filtered = rooms.filter((r) => r.propertyId === currentPropertyId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyRoom(currentPropertyId));

  return (
    <OwnerCard
      title={`房間 / 單位 · ${property?.name ?? ""}`}
      desc="設定房名、房型、床數、押金金額。旅客訂房時可選擇一或多間房。"
      actions={
        <button
          onClick={() => {
            setDraft(emptyRoom(currentPropertyId));
            setAdding((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          新增房間
        </button>
      }
    >
      <Toaster position="top-center" richColors />
      {adding && (
        <div className="mb-5 rounded-lg border border-dashed border-primary bg-primary-soft/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="房名" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <TypeSelect value={draft.type} onChange={(v) => setDraft({ ...draft, type: v })} />
            <Input label="床數" type="number" value={draft.beds} onChange={(v) => setDraft({ ...draft, beds: Number(v) || 0 })} />
            <Input label="單間押金（NT$）" type="number" value={draft.depositAmount} onChange={(v) => setDraft({ ...draft, depositAmount: Number(v) || 0 })} />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                if (!draft.name.trim()) return toast.error("請輸入房名");
                addRoom(draft);
                setAdding(false);
                toast.success("已新增");
              }}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              儲存
            </button>
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            此館別尚無房間，請點「新增房間」。
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">{r.name || "未命名"}</p>
              <button
                onClick={() => {
                  if (confirm(`刪除「${r.name}」？`)) {
                    removeRoom(r.id);
                    toast.success("已刪除");
                  }
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive-soft"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="房名" value={r.name} onChange={(v) => updateRoom(r.id, { name: v })} />
              <TypeSelect value={r.type} onChange={(v) => updateRoom(r.id, { type: v })} />
              <Input label="床數" type="number" value={r.beds} onChange={(v) => updateRoom(r.id, { beds: Number(v) || 0 })} />
              <Input label="單間押金（NT$）" type="number" value={r.depositAmount} onChange={(v) => updateRoom(r.id, { depositAmount: Number(v) || 0 })} />
              <Input label="大門密碼" value={r.gatePassword ?? ""} onChange={(v) => updateRoom(r.id, { gatePassword: v })} />
              <Input label="房門密碼" value={r.doorPassword ?? ""} onChange={(v) => updateRoom(r.id, { doorPassword: v })} />
            </div>
          </div>
        ))}
      </div>
    </OwnerCard>
  );
}

function TypeSelect({
  value,
  onChange,
}: {
  value: RoomType;
  onChange: (v: RoomType) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold text-foreground">房型</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RoomType)}
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {(Object.keys(roomTypeLabels) as RoomType[]).map((k) => (
          <option key={k} value={k}>
            {roomTypeLabels[k]}
          </option>
        ))}
      </select>
    </label>
  );
}
