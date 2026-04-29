"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 520);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-4 z-[120] inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-xl backdrop-blur transition hover:border-brand/60 hover:text-brand sm:right-6"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
