import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Lock,
  MapPin,
  Route as RouteIcon,
  DoorOpen,
  Wifi,
  Info,
  KeyRound,
  Phone,
} from "lucide-react";
import { PhoneShell } from "@/components/checkin/PhoneShell";
import { useCheckinStore } from "@/lib/checkin-store";
import { checkinStatusPill, StatusPill } from "@/components/checkin/StatusPill";
import {
  usePropertyConfig,
  guideFieldLabels,
  guideFieldOrder,
  type GuideField,
} from "@/lib/property-config";
import { useRoomAssignments } from "@/lib/room-assignments";
import { ImageLightbox, isVideoUrl } from "@/components/checkin/ImageLightbox";
import { Play } from "lucide-react";

export const Route = createFileRoute("/checkin/demo/guide")({
  component: GuidePage,
  head: () => ({ meta: [{ title: "入住指引 · 胡桃民宿" }] }),
});

const iconFor: Record<GuideField, typeof MapPin> = {
  address: MapPin,
  parking: RouteIcon,
  gate: DoorOpen,
  door: KeyRound,
  notes: Info,
  emergency: Phone,
};

function GuidePage() {
  const status = useCheckinStore((s) => s.status);
  const { guide, guidePhotos, rooms, roomGroups } = usePropertyConfig();
  const assignments = useRoomAssignments((s) => s.assignments);
  const locked = status !== "approved" && status !== "completed";
  const pill = checkinStatusPill(status);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Key-pickup groups for this guest's assigned rooms
  const assignedIds = assignments["demo"] ?? [];
  const assignedRooms = rooms.filter((r) => assignedIds.includes(r.id));
  const keyGroups = Array.from(
    new Set(assignedRooms.map((r) => r.groupId).filter(Boolean)),
  )
    .map((gid) => roomGroups.find((g) => g.id === gid))
    .filter((g): g is NonNullable<typeof g> => !!g && g.accessMode === "key");

  return (
    <PhoneShell title="入住指引" backTo="/checkin/demo/home">
      {locked ? (
        <>
          <div
            className="mt-2 overflow-hidden rounded-3xl p-6 text-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.94 0.03 85) 0%, oklch(0.90 0.05 80) 100%)",
            }}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-card shadow-[var(--shadow-card)]">
              <Lock className="h-7 w-7 text-[oklch(0.55_0.10_60)]" strokeWidth={2.2} />
            </div>
            <h2 className="mt-3 text-lg font-black text-foreground">尚未開放</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/70">
              入住指引將於民宿審核通過後開放。
            </p>
            <div className="mt-3 flex justify-center">
              <StatusPill label={pill.label} tone={pill.tone} />
            </div>
          </div>

          <ul className="mt-4 space-y-2.5">
            {guideFieldOrder.map((k) => {
              const Icon = iconFor[k];
              return (
                <li key={k} className="card-soft flex items-center gap-3 p-4 opacity-70">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {guideFieldLabels[k]}
                    </p>
                    <p className="text-xs text-muted-foreground">審核通過後開放</p>
                  </div>
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              );
            })}
          </ul>

          {status === "draft" && (
            <Link
              to="/checkin/demo/start"
              className="mt-6 block w-full rounded-2xl bg-primary px-6 py-4 text-center text-base font-bold text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.75_0.14_85_/_0.6)]"
            >
              前往線上入住
            </Link>
          )}
        </>
      ) : (
        <>
          <div className="rounded-3xl bg-success-soft p-5">
            <StatusPill label="已核准" tone="success" />
            <h2 className="mt-2 text-lg font-black text-foreground">
              歡迎入住胡桃民宿
            </h2>
            <p className="mt-1 text-xs text-foreground/70">
              以下為您本次入住的完整指引資訊。
            </p>
          </div>

          <ul className="mt-4 space-y-2.5">
            {guideFieldOrder.map((k) => {
              const Icon = iconFor[k];
              const value = guide[k];
              const photos = guidePhotos[k] ?? [];
              if (!value && photos.length === 0) return null;
              return (
                <li key={k} className="card-soft flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {guideFieldLabels[k]}
                      </p>
                      <p className="mt-0.5 whitespace-pre-line text-sm font-semibold leading-relaxed text-foreground">
                        {value}
                      </p>
                    </div>
                  </div>
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {photos.map((url, i) => {
                        const video = isVideoUrl(url);
                        return (
                          <button
                            key={i}
                            onClick={() => setLightbox(url)}
                            className="relative overflow-hidden rounded-lg border border-border transition hover:shadow-md"
                          >
                            {video ? (
                              <>
                                <video
                                  src={url}
                                  muted
                                  playsInline
                                  className="h-20 w-20 object-cover"
                                />
                                <span className="absolute inset-0 grid place-items-center bg-black/30">
                                  <Play className="h-5 w-5 fill-white text-white" />
                                </span>
                              </>
                            ) : (
                              <img
                                src={url}
                                alt={guideFieldLabels[k] + " 照片"}
                                className="h-20 w-20 object-cover"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="card-soft mt-4 flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
              <Wifi className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Wi-Fi</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                Walnut-Guest / 密碼於現場提供
              </p>
            </div>
          </div>

          <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
        </>
      )}
    </PhoneShell>
  );
}
