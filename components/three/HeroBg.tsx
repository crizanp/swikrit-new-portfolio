"use client";

import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/animations/gsap";
import { createHeroThreeBackground } from "@/lib/animations/three-bg";

interface HeroBgProps {
  sectionRef: RefObject<HTMLElement>;
  className?: string;
}

export function HeroBg({ sectionRef, className }: HeroBgProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvasHost = hostRef.current;
    const section = sectionRef.current;

    if (!canvasHost || !section || prefersReducedMotion()) {
      return;
    }

    return createHeroThreeBackground({
      canvasHost,
      scrollTriggerSection: section,
    });
  }, [sectionRef]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
