"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/animations/gsap";

export function SectionReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));

    if (sections.length === 0) {
      return;
    }

    sections.forEach((section) => {
      section.classList.add("section-reveal");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove("section-reveal", "section-reveal-visible");
      });
    };
  }, []);

  return null;
}
