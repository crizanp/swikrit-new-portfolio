"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap";

export function PageTransition() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement | null>(null);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    registerGsapPlugins();
  }, []);

  useEffect(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    const previousPath = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (previousPath === pathname || prefersReducedMotion()) {
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

    timeline
      .set(bar, { scaleX: 0, autoAlpha: 1, transformOrigin: "left center" })
      .to(bar, { scaleX: 1, duration: 0.22 })
      .to(bar, {
        scaleX: 0,
        duration: 0.28,
        transformOrigin: "right center",
        delay: 0.02,
      })
      .set(bar, { autoAlpha: 0, transformOrigin: "left center" });

    return () => {
      timeline.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[120] h-1 w-full origin-left bg-gradient-to-r from-brand/50 via-brand to-brand/50 opacity-0"
    />
  );
}
