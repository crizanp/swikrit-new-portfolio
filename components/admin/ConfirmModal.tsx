"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[210] grid place-items-center bg-black/75 p-4 transition-opacity",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
        <div className="mb-3 inline-flex rounded-full border border-amber-300/20 bg-amber-200/10 p-2 text-amber-300">
          <TriangleAlert className="h-4 w-4" />
        </div>

        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {description ? <p className="mt-2 text-sm text-zinc-400">{description}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 px-3 py-2 text-sm text-zinc-300"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              danger ? "bg-rose-600 text-white" : "bg-[#e8c547] text-black"
            )}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
