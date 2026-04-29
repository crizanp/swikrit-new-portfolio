"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImageIcon, Loader2, UploadCloud, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploaderProps = {
  label: string;
  bucket: "portfolio-images" | "portfolio-videos" | "blog-images" | "avatars";
  value?: string;
  accept?: string;
  onChange: (url: string) => void;
};

export function FileUploader({ label, bucket, value, accept, onChange }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isImage = useMemo(() => {
    if (!value) {
      return false;
    }

    return /\.(png|jpe?g|gif|webp|svg)$/i.test(value);
  }, [value]);

  async function handleUpload(file: File) {
    setError(null);
    setProgress(0);

    try {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/upload?bucket=${bucket}`);

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return;
          }

          setProgress(Math.round((event.loaded / event.total) * 100));
        };

        xhr.onerror = () => {
          reject(new Error("Upload failed due to a network issue."));
        };

        xhr.onload = () => {
          type UploadResponse = {
            url?: string;
            error?: string;
            data?: {
              publicUrl?: string;
            };
          };

          if (xhr.status < 200 || xhr.status >= 300) {
            let message = "Upload request failed.";

            try {
              const payload = JSON.parse(xhr.responseText) as UploadResponse;
              if (payload.error) {
                message = payload.error;
              }
            } catch {
              // Ignore parse errors and keep default message.
            }

            reject(new Error(message));
            return;
          }

          const payload = JSON.parse(xhr.responseText) as UploadResponse;
          const uploadedUrl = payload.url ?? payload.data?.publicUrl;

          if (!uploadedUrl) {
            reject(new Error(payload.error ?? "Could not read uploaded file URL."));
            return;
          }

          onChange(uploadedUrl);
          resolve();
        };

        xhr.send(formData);
      });
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">{label}</p>

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-center transition",
          isDragging ? "border-[#e8c547] bg-[#e8c547]/10" : "border-white/20 bg-zinc-900"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];

          if (file) {
            void handleUpload(file);
          }
        }}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleUpload(file);
            }
          }}
        />

        {progress != null ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-[#e8c547]" />
            <p className="text-sm text-zinc-200">Uploading... {progress}%</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-[#e8c547]" />
            <p className="text-sm text-zinc-200">Drag a file here or click to upload</p>
            <p className="text-xs text-zinc-500">Bucket: {bucket}</p>
          </>
        )}
      </label>

      {value ? (
        <div className="rounded-lg border border-white/10 bg-zinc-950 p-3 text-xs text-zinc-300">
          {isImage ? (
            <div className="relative mb-2 h-36 w-full overflow-hidden rounded-md">
              <Image
                src={value}
                alt="Uploaded asset"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          ) : value.includes(".mp4") || value.includes(".webm") || value.includes(".mov") ? (
            <div className="mb-2 flex h-20 items-center justify-center rounded-md bg-zinc-900 text-zinc-400">
              <Video className="h-5 w-5" />
            </div>
          ) : (
            <div className="mb-2 flex h-20 items-center justify-center rounded-md bg-zinc-900 text-zinc-400">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}

          <p className="break-all text-zinc-400">{value}</p>
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
