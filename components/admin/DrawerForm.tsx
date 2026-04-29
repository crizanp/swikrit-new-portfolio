"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerFormProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
};

export function DrawerForm({
  open,
  title,
  subtitle,
  onClose,
  children,
  widthClassName = "max-w-2xl",
}: DrawerFormProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[180] bg-black/70 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[190] w-full border-l border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-300",
          widthClassName,
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between border-b border-white/10 p-5">
            <div>
              <p className="text-sm font-semibold text-[#e8c547]">{title}</p>
              {subtitle ? <p className="mt-1 text-xs text-zinc-400">{subtitle}</p> : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/15 p-2 text-zinc-300 hover:text-white"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </aside>
    </>
  );
}
