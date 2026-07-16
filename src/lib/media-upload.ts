/**
 * Read files chosen by the user and return data URLs. Images are downscaled to
 * MAX_DIM on the longest edge and re-encoded as JPEG at ~0.85 quality to keep
 * localStorage from filling up with megabyte-sized originals (which produces
 * QuotaExceededError from zustand/persist).
 *
 * Videos are returned as-is via FileReader (no downscale — user should keep
 * them short).
 */
const MAX_DIM = 1600;
const JPEG_QUALITY = 0.85;

export async function fileToMediaDataUrl(file: File): Promise<string> {
  if (file.type.startsWith("video/")) {
    return readAsDataUrl(file);
  }
  return downscaleImage(file);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function downscaleImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const { width, height } = fit(img.naturalWidth, img.naturalHeight, MAX_DIM);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return readAsDataUrl(file);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return readAsDataUrl(file);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fit(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}
