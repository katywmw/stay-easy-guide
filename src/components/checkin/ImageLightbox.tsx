import { useEffect } from "react";
import { X } from "lucide-react";

/** Data URLs beginning with `data:video` (or common video extensions) are treated as videos. */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:video")) return true;
  return /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url);
}

export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string | null;
  alt?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;
  const video = isVideoUrl(src);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="關閉"
      >
        <X className="h-5 w-5" />
      </button>
      {video ? (
        <video
          src={src}
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] max-w-full rounded-xl bg-black"
        />
      ) : (
        <img
          src={src}
          alt={alt ?? ""}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] max-w-full rounded-xl object-contain"
        />
      )}
    </div>
  );
}
