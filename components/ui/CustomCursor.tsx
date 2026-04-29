"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap";
import { cn } from "@/lib/utils";

type CursorTone = "dark" | "light";

const interactiveSelector =
  "a, button, [role='button'], input, textarea, select, [data-cursor-hover='true']";

export function CustomCursor() {
  const { resolvedTheme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [tone, setTone] = useState<CursorTone>("dark");
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const fallbackTone = useMemo<CursorTone>(() => {
    return resolvedTheme === "light" ? "light" : "dark";
  }, [resolvedTheme]);

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setIsEnabled(!isCoarsePointer && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) {
      return;
    }

    registerGsapPlugins();

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power3.out" });

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;

      dotX(x);
      dotY(y);
      ringX(x);
      ringY(y);

      const target = document.elementFromPoint(x, y) as HTMLElement | null;
      const sectionTone = target?.closest<HTMLElement>("[data-cursor-tone]")?.dataset
        .cursorTone as CursorTone | undefined;
      setTone(sectionTone ?? fallbackTone);
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(interactiveSelector)) {
        setIsHovering(true);
      }
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(interactiveSelector)) {
        setIsHovering(false);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, [fallbackTone, isEnabled]);

  if (!isEnabled) {
    return null;
  }

  const isLightTone = tone === "light";

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[130] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200",
          isLightTone ? "bg-black" : "bg-brand"
        )}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[129] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300",
          isLightTone ? "border-black/65" : "border-white/70",
          isHovering ? "scale-150" : "scale-100"
        )}
      />
    </>
  );
}
