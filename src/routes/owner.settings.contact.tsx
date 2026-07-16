import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, MessageCircle, Phone, Mail, MessageSquare } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { CopyFromPropertyButton } from "@/components/owner/CopyFromPropertyButton";
import { Input } from "./owner.settings.property";
import {
  usePropertyConfig,
  contactChannelTypeLabels,
  type ContactChannel,
  type ContactChannelType,
} from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/contact")({
  component: ContactSettings,
});

function emptyChannel(): Omit<ContactChannel, "id"> {
  return { type: "line", label: "LINE 官方帳號", value: "", enabled: true };
}

export function channelIcon(t: ContactChannelType) {
  switch (t) {
    case "line":
    case "messenger":
    case "whatsapp":
      return MessageCircle;
    case "phone":
    case "sms":
      return Phone;
    case "email":
      return Mail;
    default:
      return MessageSquare;
  }
}

/** Build a tel/mailto/deep-link href from a channel. */
export function channelHref(c: ContactChannel): string {
  const v = c.value.trim();
  if (!v) return "#";
  switch (c.type) {
    case "phone":
      return `tel:${v.replace(/[^+\d]/g, "")}`;
    case "sms":
      return `sms:${v.replace(/[^+\d]/g, "")}`;
    case "email":
      return `mailto:${v}`;
    case "whatsapp": {
      const num = v.replace(/[^+\d]/g, "");
      return `https://wa.me/${num.replace(/^\+/, "")}`;
    }
    case "line":
      return v.startsWith("http")
        ? v
        : `https://line.me/R/ti/p/${encodeURIComponent(v.replace(/^@/, "%40"))}`;
    case "messenger":
      return v.startsWith("http") ? v : `https://m.me/${v}`;
    case "custom":
    default:
      return v.startsWith("http") ? v : `https://${v}`;
  }
}

function ContactSettings() {
  const {
    contactChannels,
    addContactChannel,
    updateContactChannel,
    removeContactChannel,
  } = usePropertyConfig();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyChannel());

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />

      <OwnerCard
        title="旅客聯絡方式"
        desc="旅客可在入住頁面直接一鍵聯絡屋主。目前為外部導流模式（LINE、電話、Email…），未來將加入站內聊天。"
        actions={
          <div className="flex items-center gap-2">
            <CopyFromPropertyButton kinds={["contact"]} />
            <button
              onClick={() => {
                setAdding((v) => !v);
                setDraft(emptyChannel());
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              新增管道
            </button>
          </div>
        }
      >
        {adding && (
          <div className="mb-5 rounded-lg border border-dashed border-primary bg-primary-soft/30 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <TypeSelect
                value={draft.type}
                onChange={(v) => setDraft({ ...draft, type: v })}
              />
              <Input label="顯示名稱" value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} />
              <Input label="值（ID / 電話 / URL）" value={draft.value} onChange={(v) => setDraft({ ...draft, value: v })} />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (!draft.value.trim()) return toast.error("請填入聯絡值");
                  addContactChannel(draft);
                  setAdding(false);
                  toast.success("已新增");
                }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                新增
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

        {contactChannels.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
            尚未新增聯絡管道，旅客端將不顯示「聯絡屋主」區塊。
          </p>
        ) : (
          <div className="space-y-3">
            {contactChannels.map((c) => {
              const Icon = channelIcon(c.type);
              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-[oklch(0.94_0.02_82)] bg-secondary/30 p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground">
                      {contactChannelTypeLabels[c.type]}
                    </span>
                    <label className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={c.enabled}
                        onChange={(e) =>
                          updateContactChannel(c.id, { enabled: e.target.checked })
                        }
                        className="h-3.5 w-3.5 accent-[oklch(0.75_0.14_85)]"
                      />
                      啟用
                    </label>
                    <button
                      onClick={() => {
                        if (confirm("刪除此聯絡管道？")) {
                          removeContactChannel(c.id);
                          toast.success("已刪除");
                        }
                      }}
                      className="grid h-7 w-7 place-items-center rounded-lg text-destructive hover:bg-destructive-soft"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <TypeSelect
                      value={c.type}
                      onChange={(v) => updateContactChannel(c.id, { type: v })}
                    />
                    <Input
                      label="顯示名稱"
                      value={c.label}
                      onChange={(v) => updateContactChannel(c.id, { label: v })}
                    />
                    <Input
                      label="值"
                      value={c.value}
                      onChange={(v) => updateContactChannel(c.id, { value: v })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </OwnerCard>
    </div>
  );
}

function TypeSelect({
  value,
  onChange,
}: {
  value: ContactChannelType;
  onChange: (v: ContactChannelType) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold text-foreground">類型</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ContactChannelType)}
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {(Object.keys(contactChannelTypeLabels) as ContactChannelType[]).map((k) => (
          <option key={k} value={k}>
            {contactChannelTypeLabels[k]}
          </option>
        ))}
      </select>
    </label>
  );
}
