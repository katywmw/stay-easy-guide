import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ImagePlus, Trash2, ArrowLeft, ArrowRight, Play } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { CopyFromPropertyButton } from "@/components/owner/CopyFromPropertyButton";
import { ImageLightbox, isVideoUrl } from "@/components/checkin/ImageLightbox";
import { fileToMediaDataUrl } from "@/lib/media-upload";
import {
  usePropertyConfig,
  guideFieldLabels,
  guideFieldOrder,
  type GuideField,
} from "@/lib/property-config";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/owner/settings/guide")({
  component: GuideSettings,
});

function GuideSettings() {
  const { guide, guidePhotos, update } = usePropertyConfig();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const setField = (k: GuideField, v: string) =>
    update({ guide: { ...guide, [k]: v } });

  const onFile =
    (k: GuideField) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      if (!files.length) return;
      try {
        const urls = await Promise.all(files.map(fileToMediaDataUrl));
        update({
          guidePhotos: {
            ...guidePhotos,
            [k]: [...(guidePhotos[k] ?? []), ...urls],
          },
        });
      } catch {
        toast.error("上傳失敗，請重試或選擇較小的檔案。");
      }
    };

  const setList = (k: GuideField, list: string[]) =>
    update({ guidePhotos: { ...guidePhotos, [k]: list } });

  const removeAt = (k: GuideField, idx: number) =>
    setList(k, (guidePhotos[k] ?? []).filter((_, i) => i !== idx));

  const move = (k: GuideField, from: number, to: number) => {
    const list = [...(guidePhotos[k] ?? [])];
    if (to < 0 || to >= list.length) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    setList(k, list);
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />
      <OwnerCard
        title="入住指引模板 + 相片 / 影片"
        desc="審核通過後旅客可看到。每個欄位可附上多張照片或短影片；拖曳縮圖可調整順序，點擊可放大檢視。"
        actions={<CopyFromPropertyButton kinds={["guide"]} label="複製指引" />}
      >
        <div className="space-y-5">
          {guideFieldOrder.map((k) => (
            <div
              key={k}
              className="rounded-lg border border-[oklch(0.94_0.02_82)] p-4"
            >
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-foreground">
                  {guideFieldLabels[k]}
                </span>
                <textarea
                  rows={2}
                  value={guide[k]}
                  onChange={(e) => setField(k, e.target.value)}
                  className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <div className="mt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {(guidePhotos[k] ?? []).map((url, i, arr) => (
                    <MediaTile
                      key={`${k}-${i}-${url.slice(0, 24)}`}
                      url={url}
                      alt={guideFieldLabels[k] + " " + (i + 1)}
                      onOpen={() => setLightbox(url)}
                      onRemove={() => removeAt(k, i)}
                      onMoveLeft={i > 0 ? () => move(k, i, i - 1) : undefined}
                      onMoveRight={
                        i < arr.length - 1 ? () => move(k, i, i + 1) : undefined
                      }
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(i));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = Number(e.dataTransfer.getData("text/plain"));
                        if (!Number.isNaN(from) && from !== i) move(k, from, i);
                      }}
                    />
                  ))}
                  <FilePicker onFiles={onFile(k)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          變更會即時儲存至本地設定；旅客端於審核通過後看得到。
        </p>
      </OwnerCard>
      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function MediaTile({
  url,
  alt,
  onOpen,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  url: string;
  alt: string;
  onOpen: () => void;
  onRemove: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const video = isVideoUrl(url);
  return (
    <div
      className="group relative"
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-20 w-20 overflow-hidden rounded-lg border border-border bg-secondary"
        title="點擊放大"
      >
        {video ? (
          <>
            <video
              src={url}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            <span className="absolute inset-0 grid place-items-center bg-black/30">
              <Play className="h-5 w-5 fill-white text-white" />
            </span>
            <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[9px] font-bold text-white">
              影片
            </span>
          </>
        ) : (
          <img src={url} alt={alt} className="h-full w-full object-cover" />
        )}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
        title="刪除"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
      <div className="mt-1 flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100">
        <button
          type="button"
          onClick={onMoveLeft}
          disabled={!onMoveLeft}
          className="grid h-5 w-5 place-items-center rounded bg-card text-muted-foreground disabled:opacity-30 hover:bg-secondary"
          title="向前"
        >
          <ArrowLeft className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onMoveRight}
          disabled={!onMoveRight}
          className="grid h-5 w-5 place-items-center rounded bg-card text-muted-foreground disabled:opacity-30 hover:bg-secondary"
          title="向後"
        >
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function FilePicker({
  onFiles,
}: {
  onFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={onFiles}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
      >
        <ImagePlus className="h-5 w-5" />
      </button>
    </>
  );
}
