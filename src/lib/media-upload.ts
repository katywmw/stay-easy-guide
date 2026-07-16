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

/**
 * Overlay a repeating diagonal watermark on an image data URL. Used for
 * guest-uploaded ID photos so the file is only usable for verification.
 */
export async function watermarkImageDataUrl(
  dataUrl: string,
  text = "僅供入住核對使用 · For verification only",
): Promise<string> {
  try {
    const img = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0);

    const stamp = `${text} · ${new Date().toISOString().slice(0, 10)}`;
    const fontSize = Math.max(16, Math.round(canvas.width / 34));
    ctx.font = `700 ${fontSize}px "Noto Sans TC", system-ui, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = Math.max(1, fontSize / 14);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((-25 * Math.PI) / 180);
    const stepY = fontSize * 4;
    const stepX = ctx.measureText(stamp).width + fontSize * 3;
    const diag = Math.hypot(canvas.width, canvas.height);
    for (let y = -diag; y < diag; y += stepY) {
      for (let x = -diag; x < diag; x += stepX) {
        ctx.strokeText(stamp, x, y);
        ctx.fillText(stamp, x, y);
      }
    }
    ctx.restore();

    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return dataUrl;
  }
}

