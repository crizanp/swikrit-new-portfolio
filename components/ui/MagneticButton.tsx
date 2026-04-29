"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap";
import { Button, type ButtonProps } from "@/components/ui/button";

interface MagneticButtonProps extends Omit<ButtonProps, "asChild"> {
  href?: string;
  radius?: number;
  target?: string;
  rel?: string;
}

export function MagneticButton({
  href,
  radius = 50,
  children,
  target,
  rel,
  ...buttonProps
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper || prefersReducedMotion()) {
      return;
    }

    registerGsapPlugins();

    const xTo = gsap.quickTo(wrapper, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(wrapper, "y", { duration: 0.35, ease: "power3.out" });

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;
      const threshold = Math.max(rect.width, rect.height) / 2 + radius;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (distance < threshold) {
        xTo(distanceX * 0.24);
        yTo(distanceY * 0.24);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const onPointerLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerLeave);
      xTo(0);
      yTo(0);
    };
  }, [radius]);

  return (
    <span ref={wrapperRef} className="inline-flex will-change-transform">
      {href ? (
        <Button asChild {...buttonProps}>
          <Link href={href} target={target} rel={rel}>
            {children}
          </Link>
        </Button>
      ) : (
        <Button {...buttonProps}>{children}</Button>
      )}
    </span>
  );
}
