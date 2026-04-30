"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap";

const interactiveSelector =
  "a, button, [role='button'], input, textarea, select, [data-cursor-hover='true']";

export function CustomCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setIsEnabled(!isCoarsePointer && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const cursor = cursorRef.current;

    if (!cursor) {
      return;
    }

    registerGsapPlugins();

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.06, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.06, ease: "power2.out" });
    const scaleTo = gsap.quickTo(cursor, "scale", { duration: 0.16, ease: "power2.out" });

    const onPointerMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };

    const onPointerOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(interactiveSelector)) {
        scaleTo(1.45);
      }
    };

    const onPointerOut = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(interactiveSelector)) {
        scaleTo(1);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      xTo(0);
      yTo(0);
      scaleTo(1);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[240] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/70 bg-brand/20"
    />
  );
}
