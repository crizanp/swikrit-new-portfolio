"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap";

export function PageTransition() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    registerGsapPlugins();
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) {
      return;
    }

    const previousPath = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (previousPath === pathname || prefersReducedMotion()) {
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power4.inOut" } });

    timeline
      .set(overlay, { xPercent: -100, autoAlpha: 1 })
      .to(overlay, { xPercent: 0, duration: 0.32 })
      .to(overlay, {
        xPercent: 100,
        duration: 0.4,
        delay: 0.05,
        onComplete: () => {
          gsap.set(overlay, { xPercent: -100, autoAlpha: 1 });
        },
      });

    return () => {
      timeline.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[120] bg-black"
      style={{ transform: "translateX(-100%)" }}
    />
  );
}
