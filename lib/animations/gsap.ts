"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lenis from "@studio-freight/lenis";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

let pluginsRegistered = false;

export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function registerGsapPlugins() {
  if (pluginsRegistered || typeof window === "undefined") {
    return;
  }

  gsap.registerPlugin(useGSAP, ScrollTrigger, TextPlugin, CustomEase);
  CustomEase.create("softReveal", "0.25, 0.1, 0.25, 1");
  pluginsRegistered = true;
}

export function createLenisSmoothScroll() {
  if (typeof window === "undefined" || prefersReducedMotion()) {
    return () => undefined;
  }

  const lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}

export function splitTextWords(element: HTMLElement) {
  const content = element.textContent?.trim() ?? "";

  if (!content) {
    return [] as HTMLSpanElement[];
  }

  const words = content.split(/\s+/);
  element.innerHTML = words
    .map(
      (word) =>
        `<span class="inline-block overflow-hidden"><span data-split-word class="inline-block will-change-transform">${word}</span></span>`
    )
    .join('<span class="inline-block">&nbsp;</span>');

  return Array.from(
    element.querySelectorAll("[data-split-word]")
  ) as HTMLSpanElement[];
}

export { gsap, ScrollTrigger, TextPlugin };
