/**
 * Client-side image compression utility using Canvas API.
 * Resizes and converts images to WebP/JPEG before uploading,
 * reducing file size and bandwidth usage.
 */

interface CompressOptions {
  /** Max width in px (default: 1200) */
  maxWidth?: number;
  /** Max height in px (default: 1200) */
  maxHeight?: number;
  /** Quality 0-1 (default: 0.82) */
  quality?: number;
  /** Output MIME type (default: image/webp, fallback image/jpeg) */
  outputType?: "image/webp" | "image/jpeg";
  /** Max file size in bytes — if exceeded, re-compress at lower quality */
  maxSizeBytes?: number;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  outputType: "image/webp",
  maxSizeBytes: 500_000, // 500KB
};

/**
 * Check if the browser supports WebP encoding via canvas.
 */
function supportsWebP(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

/**
 * Load an image File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Draw the image onto a canvas with the target dimensions and return a Blob.
 */
function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas context unavailable"));

    // Use high-quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Compress a single image file.
 * Returns a new File with reduced dimensions/quality.
 * If the image is already smaller than the target, it may be returned as-is.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip non-image files
  if (!file.type.startsWith("image/")) return file;

  // Determine output MIME
  const canWebP = supportsWebP();
  const mime = opts.outputType === "image/webp" && canWebP ? "image/webp" : "image/jpeg";
  const ext = mime === "image/webp" ? ".webp" : ".jpg";

  try {
    const img = await loadImage(file);

    // Calculate target dimensions preserving aspect ratio
    let { width, height } = img;
    if (width > opts.maxWidth || height > opts.maxHeight) {
      const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // First pass
    let blob = await canvasToBlob(img, width, height, mime, opts.quality);

    // Re-compress if still too large
    if (blob.size > opts.maxSizeBytes && opts.quality > 0.3) {
      const lowerQuality = Math.max(opts.quality - 0.2, 0.3);
      blob = await canvasToBlob(img, width, height, mime, lowerQuality);
    }

    // If still too large, reduce dimensions further
    if (blob.size > opts.maxSizeBytes) {
      const scale = Math.sqrt(opts.maxSizeBytes / blob.size);
      const w2 = Math.round(width * scale);
      const h2 = Math.round(height * scale);
      blob = await canvasToBlob(img, w2, h2, mime, 0.6);
    }

    // Release object URL
    URL.revokeObjectURL(img.src);

    // Build output filename
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const newName = `${baseName}${ext}`;

    return new File([blob], newName, { type: mime, lastModified: Date.now() });
  } catch {
    // If compression fails, return original file
    return file;
  }
}

/**
 * Compress multiple image files in parallel.
 */
export async function compressImages(
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}

/**
 * Pre-configured compress presets for different upload contexts.
 */
export const COMPRESS_PRESETS = {
  /** Passport-style photo: 400x500, high quality */
  photo: { maxWidth: 400, maxHeight: 500, quality: 0.85, maxSizeBytes: 300_000 } as CompressOptions,
  /** Document scan: 800x600 */
  document: { maxWidth: 800, maxHeight: 600, quality: 0.8, maxSizeBytes: 400_000 } as CompressOptions,
  /** Payment screenshot: 800x1200 */
  screenshot: { maxWidth: 800, maxHeight: 1200, quality: 0.78, maxSizeBytes: 500_000 } as CompressOptions,
  /** QR Code: 600x600, higher quality to keep sharpness */
  qrCode: { maxWidth: 600, maxHeight: 600, quality: 0.9, maxSizeBytes: 200_000 } as CompressOptions,
} as const;
