"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap";

export function InitialLoader() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    registerGsapPlugins();

    if (prefersReducedMotion()) {
      setDone(true);
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        setDone(true);
      },
    });

    timeline
      .fromTo(
        ".loader-letter",
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 }
      )
      .to(overlay, {
        autoAlpha: 0,
        duration: 1.2,
        delay: 0.25,
      });

    return () => {
      timeline.kill();
    };
  }, []);

  if (done) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[300] grid place-items-center bg-black"
    >
      <div className="flex items-center gap-2 font-heading text-5xl font-bold tracking-[0.2em] text-white sm:text-6xl">
        <span className="loader-letter">S</span>
        <span className="loader-letter text-brand">P</span>
      </div>
    </div>
  );
}
