import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { OwnerCard } from "@/components/owner/OwnerShell";
import { PropertyBadge } from "@/components/owner/PropertyBadge";
import { CopyFromPropertyButton } from "@/components/owner/CopyFromPropertyButton";
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

  const setField = (k: GuideField, v: string) =>
    update({ guide: { ...guide, [k]: v } });

  const onFile =
    (k: GuideField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      Promise.all(
        files.map(
          (f) =>
            new Promise<string>((res) => {
              const r = new FileReader();
              r.onload = () => res(String(r.result));
              r.readAsDataURL(f);
            }),
        ),
      ).then((urls) => {
        update({
          guidePhotos: {
            ...guidePhotos,
            [k]: [...(guidePhotos[k] ?? []), ...urls],
          },
        });
      });
      e.target.value = "";
    };

  const removePhoto = (k: GuideField, idx: number) =>
    update({
      guidePhotos: {
        ...guidePhotos,
        [k]: (guidePhotos[k] ?? []).filter((_, i) => i !== idx),
      },
    });

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <PropertyBadge />
      <OwnerCard
        title="入住指引模板 + 相片"
        desc="審核通過後旅客可看到。每個欄位可附上多張照片，旅客點擊可放大檢視。"
        actions={<CopyFromPropertyButton kinds={["guide"]} label="複製指引" />}
      >
        <div className="space-y-5">
          {guideFieldOrder.map((k) => (
            <div key={k} className="rounded-lg border border-[oklch(0.94_0.02_82)] p-4">
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
                  {(guidePhotos[k] ?? []).map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={guideFieldLabels[k] + " 照片 " + (i + 1)}
                        className="h-16 w-16 rounded-lg border border-border object-cover"
                      />
                      <button
                        onClick={() => removePhoto(k, i)}
                        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  <FilePicker onFiles={onFile(k)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.success("已自動保存變更")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          完成
        </button>
      </OwnerCard>
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
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFiles}
      />
      <button
        onClick={() => ref.current?.click()}
        className="grid h-16 w-16 place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
      >
        <ImagePlus className="h-5 w-5" />
      </button>
    </>
  );
}
