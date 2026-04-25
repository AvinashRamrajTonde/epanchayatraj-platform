import { useState, useRef, useCallback, useEffect, type FC } from "react";
import Label from "./Label";

// --- Types ---

export interface UploadedImage {
  url: string;
  /** Thumbnail variant URL (for gallery) */
  thumbUrl?: string;
}

interface ImageUploadProps {
  /** Server section name for upload API (e.g. "team", "gallery", "hero") */
  section: string;
  /** Maximum number of images allowed */
  maxFiles?: number;
  /** Current image URL(s). Pass string for single, string[] for multiple */
  value?: string | string[];
  /** Called when images change. Returns array of uploaded image URLs */
  onChange: (urls: string[]) => void;
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Upload API function - must return array of image URLs */
  uploadFn: (section: string, files: File[]) => Promise<string[]>;
  /** Delete API function */
  deleteFn?: (imageUrl: string) => Promise<void>;
  /** Hint text below dropzone */
  hint?: string;
  /** Show smaller preview thumbnails */
  compact?: boolean;
}

// --- Component ---

const ImageUpload: FC<ImageUploadProps> = ({
  section,
  maxFiles = 1,
  value,
  onChange,
  label,
  required = false,
  className = "",
  uploadFn,
  deleteFn,
  hint,
  compact = false,
}) => {
  // Normalize value to array
  const currentUrls: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSingle = maxFiles === 1;
  const canAddMore = currentUrls.length < maxFiles;

  // Simulate progress during upload
  useEffect(() => {
    if (!uploading) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.random() * 15 : p));
    }, 200);
    return () => clearInterval(interval);
  }, [uploading]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError("");
      const fileArray = Array.from(files);

      // Validate file types
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/avif",
      ];
      const invalidFiles = fileArray.filter(
        (f) => !validTypes.includes(f.type)
      );
      if (invalidFiles.length > 0) {
        setError("फक्त JPG, PNG, GIF, WebP, AVIF प्रतिमा स्वीकारल्या जातात");
        return;
      }

      // Validate file sizes (max 10MB each)
      const oversized = fileArray.filter((f) => f.size > 10 * 1024 * 1024);
      if (oversized.length > 0) {
        setError("प्रत्येक प्रतिमा 10MB पेक्षा कमी असावी");
        return;
      }

      // Limit count
      const remaining = maxFiles - currentUrls.length;
      if (remaining <= 0) {
        setError(`कमाल ${maxFiles} प्रतिमा अनुमत आहेत`);
        return;
      }
      const filesToUpload = fileArray.slice(0, remaining);

      setUploading(true);
      try {
        const uploadedUrls = await uploadFn(section, filesToUpload);
        setProgress(100);

        if (isSingle) {
          // Replace the current image
          onChange(uploadedUrls.slice(0, 1));
        } else {
          onChange([...currentUrls, ...uploadedUrls]);
        }
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          axiosErr.response?.data?.message || "प्रतिमा अपलोड अयशस्वी"
        );
      } finally {
        setUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [section, maxFiles, currentUrls, onChange, uploadFn, isSingle]
  );

  const handleRemove = useCallback(
    async (url: string) => {
      try {
        if (deleteFn) {
          await deleteFn(url);
        }
      } catch {
        // Silently ignore delete errors - still remove from UI
      }
      onChange(currentUrls.filter((u) => u !== url));
    },
    [currentUrls, onChange, deleteFn]
  );

  // Drag & Drop handlers
  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Backend URL to full absolute URL
  const resolveUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    // Relative URL from backend - prepend backend origin
    const hostname = window.location.hostname;
    return `http://${hostname}:5000${url}`;
  };

  return (
    <div className={className}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </Label>
      )}

      {/* Current images preview */}
      {currentUrls.length > 0 && (
        <div
          className={`mb-3 ${
            isSingle
              ? ""
              : compact
              ? "grid grid-cols-3 sm:grid-cols-4 gap-2"
              : "grid grid-cols-2 sm:grid-cols-3 gap-3"
          }`}
        >
          {currentUrls.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <img
                src={resolveUrl(url)}
                alt={`Upload ${idx + 1}`}
                className={`w-full object-cover ${
                  isSingle
                    ? compact
                      ? "max-h-24"
                      : "max-h-48"
                    : compact
                    ? "aspect-square h-24"
                    : "aspect-video"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23f3f4f6' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3EImage%3C/text%3E%3C/svg%3E";
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                title="हटवा"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {canAddMore && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFilePicker}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragActive
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-gray-300 hover:border-brand-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-brand-500 dark:hover:bg-gray-800/50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            multiple={!isSingle}
            onChange={handleInputChange}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-2">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                अपलोड होत आहे... {Math.round(progress)}%
              </p>
              <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto mb-2 h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dragActive
                  ? "प्रतिमा इथे सोडा"
                  : "प्रतिमा ड्रॅग करा किंवा क्लिक करा"}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                JPG, PNG, GIF, WebP, AVIF • कमाल 10MB
                {maxFiles > 1 && ` • कमाल ${maxFiles} प्रतिमा`}
              </p>
            </>
          )}
        </div>
      )}

      {/* Progress bar when replacing single image */}
      {uploading && !canAddMore && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500">बदलत आहे... {Math.round(progress)}%</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-error-500 dark:text-error-400">
          {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
